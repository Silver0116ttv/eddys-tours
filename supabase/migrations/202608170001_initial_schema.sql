begin;

create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create type public.app_role as enum ('customer', 'operator', 'admin');
create type public.operator_status as enum ('pending', 'active', 'suspended');
create type public.operator_member_role as enum ('owner', 'manager', 'staff');
create type public.departure_status as enum ('scheduled', 'sold_out', 'cancelled', 'completed');
create type public.booking_status as enum (
  'draft',
  'pending_payment',
  'confirmed',
  'cancelled',
  'completed',
  'refunded'
);
create type public.payment_status as enum (
  'pending',
  'requires_action',
  'succeeded',
  'failed',
  'partially_refunded',
  'refunded'
);
create type public.review_status as enum ('pending', 'published', 'rejected');
create type public.subscription_status as enum ('pending', 'subscribed', 'unsubscribed');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'customer',
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.operators (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  contact_email text,
  status public.operator_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.operator_members (
  operator_id uuid not null references public.operators (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.operator_member_role not null default 'staff',
  created_at timestamptz not null default now(),
  primary key (operator_id, user_id)
);

create table public.tours (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  operator_id uuid not null references public.operators (id) on delete restrict,
  slug text not null unique,
  title text not null,
  category text not null check (
    category in ('Adventure', 'Water', 'Boats', 'Nature', 'Family', 'Couples', 'Wildlife', 'Culture')
  ),
  location text not null,
  short_description text not null,
  full_description text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  meeting_point text not null,
  included_items text[] not null default '{}',
  excluded_items text[] not null default '{}',
  requirements text[] not null default '{}',
  rating_average numeric(2, 1) not null default 0 check (rating_average between 0 and 5),
  reviews_count integer not null default 0 check (reviews_count >= 0),
  featured boolean not null default false,
  popular boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tour_media (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours (id) on delete cascade,
  url text not null,
  alt_text text not null default '',
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  unique (tour_id, position)
);

create table public.tour_options (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours (id) on delete cascade,
  name text not null default 'Standard',
  retail_price_usd_minor integer not null check (retail_price_usd_minor >= 0),
  retail_price_mxn_minor integer not null check (retail_price_mxn_minor >= 0),
  deposit_usd_minor integer not null check (
    deposit_usd_minor >= 0 and deposit_usd_minor <= retail_price_usd_minor
  ),
  min_participants integer not null default 1 check (min_participants > 0),
  max_participants integer not null default 20 check (max_participants >= min_participants),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tour_id, name)
);

create table private.operator_rates (
  id uuid primary key default gen_random_uuid(),
  tour_option_id uuid not null references public.tour_options (id) on delete cascade,
  currency text not null default 'USD' check (currency in ('USD', 'MXN')),
  provider_cost_minor integer not null check (provider_cost_minor >= 0),
  effective_from date not null default current_date,
  effective_until date,
  created_at timestamptz not null default now(),
  check (effective_until is null or effective_until >= effective_from),
  unique (tour_option_id, currency, effective_from)
);

create table public.departures (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours (id) on delete cascade,
  starts_at timestamptz not null,
  capacity integer not null check (capacity > 0),
  status public.departure_status not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tour_id, starts_at)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 10)),
  customer_id uuid references public.profiles (id) on delete set null,
  guest_email text not null,
  status public.booking_status not null default 'draft',
  currency text not null default 'USD' check (currency in ('USD', 'MXN')),
  subtotal_minor integer not null default 0 check (subtotal_minor >= 0),
  amount_due_minor integer not null default 0 check (amount_due_minor >= 0),
  amount_paid_minor integer not null default 0 check (amount_paid_minor >= 0),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.booking_items (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  departure_id uuid not null references public.departures (id) on delete restrict,
  tour_option_id uuid not null references public.tour_options (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price_minor integer not null check (unit_price_minor >= 0),
  unit_deposit_minor integer not null check (unit_deposit_minor >= 0),
  title_snapshot text not null,
  created_at timestamptz not null default now()
);

create table public.inventory_holds (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  departure_id uuid not null references public.departures (id) on delete cascade,
  quantity integer not null check (quantity > 0),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (booking_id, departure_id)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete restrict,
  stripe_payment_intent_id text unique,
  status public.payment_status not null default 'pending',
  currency text not null check (currency in ('USD', 'MXN')),
  amount_minor integer not null check (amount_minor >= 0),
  refunded_minor integer not null default 0 check (
    refunded_minor >= 0 and refunded_minor <= amount_minor
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours (id) on delete cascade,
  booking_id uuid not null references public.bookings (id) on delete restrict,
  customer_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  content text not null check (char_length(content) between 10 and 2000),
  status public.review_status not null default 'pending',
  verified boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (booking_id, tour_id)
);

create table public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  tour_id uuid not null references public.tours (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, tour_id)
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status public.subscription_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (position('@' in email) > 1)
);

create table private.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index tours_operator_id_idx on public.tours (operator_id);
create index tours_published_popular_idx on public.tours (published, popular) where published;
create index tour_media_tour_id_idx on public.tour_media (tour_id, position);
create index tour_options_tour_id_idx on public.tour_options (tour_id) where active;
create index departures_tour_starts_idx on public.departures (tour_id, starts_at);
create index bookings_customer_created_idx on public.bookings (customer_id, created_at desc);
create index booking_items_booking_id_idx on public.booking_items (booking_id);
create index booking_items_departure_id_idx on public.booking_items (departure_id);
create index inventory_holds_expiry_idx on public.inventory_holds (expires_at);
create index payments_booking_id_idx on public.payments (booking_id);
create index reviews_tour_published_idx on public.reviews (tour_id, published_at desc)
  where status = 'published';

create function private.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure private.handle_new_user();

create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create function private.is_operator_member(target_operator_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.operator_members
    where operator_id = target_operator_id and user_id = (select auth.uid())
  );
$$;

create function private.can_manage_tour(target_tour_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.tours
    where id = target_tour_id
      and (private.is_admin() or private.is_operator_member(operator_id))
  );
$$;

create function private.can_manage_departure(target_departure_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.departures
    where id = target_departure_id and private.can_manage_tour(tour_id)
  );
$$;

create function private.owns_booking(target_booking_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.bookings
    where id = target_booking_id and customer_id = (select auth.uid())
  );
$$;

create function private.can_view_booking(target_booking_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_admin()
    or private.owns_booking(target_booking_id)
    or exists (
      select 1
      from public.booking_items bi
      join public.departures d on d.id = bi.departure_id
      where bi.booking_id = target_booking_id and private.can_manage_tour(d.tour_id)
    );
$$;

create function private.refresh_tour_rating()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_tour_id uuid;
begin
  target_tour_id := case when tg_op = 'DELETE' then old.tour_id else new.tour_id end;
  update public.tours
  set
    rating_average = coalesce((
      select round(avg(rating)::numeric, 1)
      from public.reviews
      where tour_id = target_tour_id and status = 'published'
    ), 0),
    reviews_count = (
      select count(*)
      from public.reviews
      where tour_id = target_tour_id and status = 'published'
    )
  where id = target_tour_id;
  return null;
end;
$$;

create function private.guard_tour_editorial_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null and not private.is_admin() then
    if tg_op = 'INSERT' and (new.featured or new.popular or new.published) then
      raise exception 'Only administrators can set editorial tour fields';
    end if;

    if tg_op = 'UPDATE' and (
      new.featured is distinct from old.featured
      or new.popular is distinct from old.popular
      or new.published is distinct from old.published
    ) then
      raise exception 'Only administrators can change editorial tour fields';
    end if;
  end if;

  return new;
end;
$$;

create function private.guard_operator_control_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null
    and not private.is_admin()
    and (new.status is distinct from old.status or new.slug is distinct from old.slug)
  then
    raise exception 'Only administrators can change operator status or slug';
  end if;

  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute procedure private.set_updated_at();
create trigger operators_set_updated_at before update on public.operators
  for each row execute procedure private.set_updated_at();
create trigger operators_guard_control_fields before update on public.operators
  for each row execute procedure private.guard_operator_control_fields();
create trigger tours_set_updated_at before update on public.tours
  for each row execute procedure private.set_updated_at();
create trigger tours_guard_editorial_fields before insert or update on public.tours
  for each row execute procedure private.guard_tour_editorial_fields();
create trigger tour_options_set_updated_at before update on public.tour_options
  for each row execute procedure private.set_updated_at();
create trigger departures_set_updated_at before update on public.departures
  for each row execute procedure private.set_updated_at();
create trigger bookings_set_updated_at before update on public.bookings
  for each row execute procedure private.set_updated_at();
create trigger payments_set_updated_at before update on public.payments
  for each row execute procedure private.set_updated_at();
create trigger reviews_set_updated_at before update on public.reviews
  for each row execute procedure private.set_updated_at();
create trigger newsletter_set_updated_at before update on public.newsletter_subscribers
  for each row execute procedure private.set_updated_at();
create trigger reviews_refresh_tour_rating
  after insert or update of rating, status or delete on public.reviews
  for each row execute procedure private.refresh_tour_rating();

revoke execute on all functions in schema private from public, anon, authenticated;
grant usage on schema private to anon, authenticated, service_role;
grant execute on function private.is_admin() to anon, authenticated, service_role;
grant execute on function private.is_operator_member(uuid) to anon, authenticated, service_role;
grant execute on function private.can_manage_tour(uuid) to anon, authenticated, service_role;
grant execute on function private.can_manage_departure(uuid) to authenticated, service_role;
grant execute on function private.owns_booking(uuid) to authenticated, service_role;
grant execute on function private.can_view_booking(uuid) to authenticated, service_role;

alter table public.profiles enable row level security;
alter table public.operators enable row level security;
alter table public.operator_members enable row level security;
alter table public.tours enable row level security;
alter table public.tour_media enable row level security;
alter table public.tour_options enable row level security;
alter table public.departures enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_items enable row level security;
alter table public.inventory_holds enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.newsletter_subscribers enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant select on public.operators, public.tours, public.tour_media, public.tour_options,
  public.departures, public.reviews to anon, authenticated;
grant select on public.profiles, public.operator_members, public.bookings, public.booking_items,
  public.inventory_holds, public.payments, public.favorites, public.newsletter_subscribers
  to authenticated;
grant insert, update, delete on public.operators, public.operator_members, public.tours,
  public.tour_media, public.tour_options, public.departures to authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;
grant insert, update, delete on public.reviews, public.favorites to authenticated;
grant insert on public.newsletter_subscribers to anon, authenticated;
grant update, delete on public.newsletter_subscribers to authenticated;
grant all on all tables in schema public to service_role;
grant usage on schema private to service_role;
grant all on all tables in schema private to service_role;

create policy profiles_select on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or private.is_admin());
create policy profiles_update on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or private.is_admin())
  with check (id = (select auth.uid()) or private.is_admin());

create policy operators_select on public.operators
  for select to anon, authenticated
  using (status = 'active' or private.is_operator_member(id) or private.is_admin());
create policy operators_insert on public.operators
  for insert to authenticated with check (private.is_admin());
create policy operators_update on public.operators
  for update to authenticated
  using (private.is_operator_member(id) or private.is_admin())
  with check (private.is_operator_member(id) or private.is_admin());
create policy operators_delete on public.operators
  for delete to authenticated using (private.is_admin());

create policy operator_members_select on public.operator_members
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or private.is_operator_member(operator_id)
    or private.is_admin()
  );
create policy operator_members_manage on public.operator_members
  for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

create policy tours_select on public.tours
  for select to anon, authenticated
  using (published or private.can_manage_tour(id) or private.is_admin());
create policy tours_insert on public.tours
  for insert to authenticated
  with check (private.is_operator_member(operator_id) or private.is_admin());
create policy tours_update on public.tours
  for update to authenticated
  using (private.can_manage_tour(id) or private.is_admin())
  with check (private.is_operator_member(operator_id) or private.is_admin());
create policy tours_delete on public.tours
  for delete to authenticated using (private.can_manage_tour(id) or private.is_admin());

create policy tour_media_select on public.tour_media
  for select to anon, authenticated
  using (
    exists (select 1 from public.tours where id = tour_id and published)
    or private.can_manage_tour(tour_id)
    or private.is_admin()
  );
create policy tour_media_manage on public.tour_media
  for all to authenticated
  using (private.can_manage_tour(tour_id) or private.is_admin())
  with check (private.can_manage_tour(tour_id) or private.is_admin());

create policy tour_options_select on public.tour_options
  for select to anon, authenticated
  using (
    (active and exists (select 1 from public.tours where id = tour_id and published))
    or private.can_manage_tour(tour_id)
    or private.is_admin()
  );
create policy tour_options_manage on public.tour_options
  for all to authenticated
  using (private.can_manage_tour(tour_id) or private.is_admin())
  with check (private.can_manage_tour(tour_id) or private.is_admin());

create policy departures_select on public.departures
  for select to anon, authenticated
  using (
    (
      status in ('scheduled', 'sold_out')
      and starts_at >= now()
      and exists (select 1 from public.tours where id = tour_id and published)
    )
    or private.can_manage_tour(tour_id)
    or private.is_admin()
  );
create policy departures_manage on public.departures
  for all to authenticated
  using (private.can_manage_tour(tour_id) or private.is_admin())
  with check (private.can_manage_tour(tour_id) or private.is_admin());

create policy bookings_select on public.bookings
  for select to authenticated
  using (private.can_view_booking(id));
create policy booking_items_select on public.booking_items
  for select to authenticated
  using (private.can_view_booking(booking_id));
create policy inventory_holds_select on public.inventory_holds
  for select to authenticated
  using (
    private.owns_booking(booking_id)
    or private.can_manage_departure(departure_id)
    or private.is_admin()
  );
create policy payments_select on public.payments
  for select to authenticated
  using (private.owns_booking(booking_id) or private.is_admin());

create policy reviews_select on public.reviews
  for select to anon, authenticated
  using (
    status = 'published'
    or customer_id = (select auth.uid())
    or private.can_manage_tour(tour_id)
    or private.is_admin()
  );
create policy reviews_insert on public.reviews
  for insert to authenticated
  with check (
    customer_id = (select auth.uid())
    and status = 'pending'
    and not verified
    and exists (
      select 1
      from public.bookings b
      join public.booking_items bi on bi.booking_id = b.id
      join public.departures d on d.id = bi.departure_id
      where b.id = booking_id
        and b.customer_id = (select auth.uid())
        and b.status = 'completed'
        and d.tour_id = tour_id
    )
  );
create policy reviews_update on public.reviews
  for update to authenticated
  using (customer_id = (select auth.uid()) and status = 'pending')
  with check (
    customer_id = (select auth.uid())
    and status = 'pending'
    and not verified
    and exists (
      select 1
      from public.bookings b
      join public.booking_items bi on bi.booking_id = b.id
      join public.departures d on d.id = bi.departure_id
      where b.id = booking_id
        and b.customer_id = (select auth.uid())
        and b.status = 'completed'
        and d.tour_id = tour_id
    )
  );
create policy reviews_delete on public.reviews
  for delete to authenticated
  using (
    (customer_id = (select auth.uid()) and status = 'pending')
    or private.is_admin()
  );
create policy reviews_admin_manage on public.reviews
  for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

create policy favorites_select on public.favorites
  for select to authenticated using (user_id = (select auth.uid()));
create policy favorites_insert on public.favorites
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy favorites_delete on public.favorites
  for delete to authenticated using (user_id = (select auth.uid()));

create policy newsletter_insert on public.newsletter_subscribers
  for insert to anon, authenticated with check (status = 'pending');
create policy newsletter_admin_select on public.newsletter_subscribers
  for select to authenticated using (private.is_admin());
create policy newsletter_admin_manage on public.newsletter_subscribers
  for update to authenticated
  using (private.is_admin()) with check (private.is_admin());
create policy newsletter_admin_delete on public.newsletter_subscribers
  for delete to authenticated using (private.is_admin());

commit;

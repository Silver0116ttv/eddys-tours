begin;

create type public.payment_choice as enum ('deposit', 'full');
create type public.booking_channel as enum ('web', 'admin', 'operator');

alter table public.tour_options
  add column deposit_mxn_minor integer;

update public.tour_options
set deposit_mxn_minor = round(deposit_usd_minor * 18.0 / 500.0)::integer * 500;

alter table public.tour_options
  alter column deposit_mxn_minor set not null,
  add constraint tour_options_deposit_mxn_check check (
    deposit_mxn_minor >= 0 and deposit_mxn_minor <= retail_price_mxn_minor
  );

alter table public.bookings
  add column guest_name text,
  add column guest_phone text,
  add column customer_notes text,
  add column channel public.booking_channel not null default 'web';

alter table public.booking_items
  add column payment_choice public.payment_choice not null default 'deposit',
  add column unit_price_mxn_minor integer not null default 0 check (unit_price_mxn_minor >= 0),
  add column unit_deposit_mxn_minor integer not null default 0 check (
    unit_deposit_mxn_minor >= 0 and unit_deposit_mxn_minor <= unit_price_mxn_minor
  );

create table public.tour_translations (
  tour_id uuid not null references public.tours (id) on delete cascade,
  locale text not null check (locale in ('en', 'es-MX')),
  title text not null,
  short_description text not null,
  full_description text not null,
  meeting_point text not null,
  included_items text[] not null default '{}',
  excluded_items text[] not null default '{}',
  requirements text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (tour_id, locale)
);

create table public.booking_events (
  id bigint generated always as identity primary key,
  booking_id uuid not null references public.bookings (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  from_status public.booking_status,
  to_status public.booking_status not null,
  note text,
  created_at timestamptz not null default now()
);

create index tour_translations_locale_idx on public.tour_translations (locale, tour_id);
create index booking_events_booking_created_idx on public.booking_events (booking_id, created_at desc);
create index bookings_status_created_idx on public.bookings (status, created_at desc);
create index payments_status_created_idx on public.payments (status, created_at desc);

create function private.available_capacity(
  target_departure_id uuid,
  check_at timestamptz default now()
)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select greatest(
    d.capacity
      - coalesce((
          select sum(bi.quantity)::integer
          from public.booking_items bi
          join public.bookings b on b.id = bi.booking_id
          where bi.departure_id = d.id
            and b.status in ('confirmed', 'completed')
        ), 0)
      - coalesce((
          select sum(ih.quantity)::integer
          from public.inventory_holds ih
          join public.bookings b on b.id = ih.booking_id
          where ih.departure_id = d.id
            and ih.expires_at > check_at
            and b.status in ('draft', 'pending_payment')
        ), 0),
    0
  )
  from public.departures d
  where d.id = target_departure_id;
$$;

create function public.get_departure_availability(
  target_tour_id uuid,
  starts_after timestamptz default now(),
  starts_before timestamptz default null
)
returns table (
  departure_id uuid,
  tour_id uuid,
  starts_at timestamptz,
  capacity integer,
  remaining_capacity integer,
  status public.departure_status
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    d.id,
    d.tour_id,
    d.starts_at,
    d.capacity,
    private.available_capacity(d.id),
    d.status
  from public.departures d
  join public.tours t on t.id = d.tour_id
  where d.tour_id = target_tour_id
    and d.starts_at >= starts_after
    and (starts_before is null or d.starts_at < starts_before)
    and d.status in ('scheduled', 'sold_out')
    and (t.published or private.can_manage_tour(t.id) or private.is_admin())
  order by d.starts_at;
$$;

create function public.create_booking(
  guest_email text,
  guest_name text,
  guest_phone text,
  currency text,
  items jsonb,
  channel public.booking_channel default 'web',
  customer_notes text default null,
  hold_minutes integer default 15
)
returns table (
  booking_id uuid,
  reference text,
  expires_at timestamptz,
  subtotal_minor integer,
  amount_due_minor integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_booking_id uuid;
  created_reference text;
  created_expires_at timestamptz;
  caller_id uuid := (select auth.uid());
  item jsonb;
  item_departure_id uuid;
  item_option_id uuid;
  item_quantity integer;
  item_payment_choice public.payment_choice;
  item_title text;
  item_retail_minor integer;
  item_deposit_minor integer;
  running_subtotal bigint := 0;
  running_due bigint := 0;
begin
  if caller_id is null and (select auth.role()) <> 'service_role' then
    raise exception 'Authentication is required';
  end if;

  if guest_email is null or position('@' in guest_email) <= 1 then
    raise exception 'A valid guest email is required';
  end if;

  if currency not in ('USD', 'MXN') then
    raise exception 'Unsupported currency';
  end if;

  if items is null
    or jsonb_typeof(items) <> 'array'
    or jsonb_array_length(items) < 1
    or jsonb_array_length(items) > 20
  then
    raise exception 'A booking requires between 1 and 20 items';
  end if;

  if hold_minutes < 5 or hold_minutes > 30 then
    raise exception 'Inventory holds must last between 5 and 30 minutes';
  end if;

  created_expires_at := now() + make_interval(mins => hold_minutes);

  insert into public.bookings (
    customer_id,
    guest_email,
    guest_name,
    guest_phone,
    customer_notes,
    channel,
    status,
    currency,
    expires_at
  )
  values (
    caller_id,
    lower(trim(guest_email)),
    nullif(trim(guest_name), ''),
    nullif(trim(guest_phone), ''),
    nullif(trim(customer_notes), ''),
    channel,
    'draft',
    currency,
    created_expires_at
  )
  returning id, bookings.reference into created_booking_id, created_reference;

  for item in select value from jsonb_array_elements(items)
  loop
    begin
      item_departure_id := (item ->> 'departure_id')::uuid;
      item_option_id := (item ->> 'tour_option_id')::uuid;
      item_quantity := (item ->> 'quantity')::integer;
      item_payment_choice := coalesce(item ->> 'payment_choice', 'deposit')::public.payment_choice;
    exception when others then
      raise exception 'Each booking item requires valid departure_id, tour_option_id, quantity, and payment_choice';
    end;

    if item_quantity < 1 or item_quantity > 20 then
      raise exception 'Item quantity must be between 1 and 20';
    end if;

    perform 1
    from public.departures d
    where d.id = item_departure_id
    for update;

    select
      t.title,
      case when currency = 'USD' then o.retail_price_usd_minor else o.retail_price_mxn_minor end,
      case when currency = 'USD' then o.deposit_usd_minor else o.deposit_mxn_minor end
    into item_title, item_retail_minor, item_deposit_minor
    from public.departures d
    join public.tours t on t.id = d.tour_id
    join public.tour_options o on o.id = item_option_id and o.tour_id = d.tour_id
    where d.id = item_departure_id
      and d.status = 'scheduled'
      and d.starts_at > now()
      and t.published
      and o.active;

    if not found then
      raise exception 'A selected departure or tour option is unavailable';
    end if;

    if private.available_capacity(item_departure_id) < item_quantity then
      raise exception 'Not enough availability for departure %', item_departure_id;
    end if;

    insert into public.booking_items (
      booking_id,
      departure_id,
      tour_option_id,
      quantity,
      unit_price_minor,
      unit_deposit_minor,
      unit_price_mxn_minor,
      unit_deposit_mxn_minor,
      payment_choice,
      title_snapshot
    )
    select
      created_booking_id,
      item_departure_id,
      item_option_id,
      item_quantity,
      o.retail_price_usd_minor,
      o.deposit_usd_minor,
      o.retail_price_mxn_minor,
      o.deposit_mxn_minor,
      item_payment_choice,
      item_title
    from public.tour_options o
    where o.id = item_option_id;

    insert into public.inventory_holds (booking_id, departure_id, quantity, expires_at)
    values (created_booking_id, item_departure_id, item_quantity, created_expires_at)
    on conflict (booking_id, departure_id) do update
    set
      quantity = public.inventory_holds.quantity + excluded.quantity,
      expires_at = excluded.expires_at;

    running_subtotal := running_subtotal + (item_retail_minor::bigint * item_quantity);
    running_due := running_due + (
      case
        when item_payment_choice = 'deposit' then item_deposit_minor::bigint
        else item_retail_minor::bigint
      end * item_quantity
    );
  end loop;

  if running_subtotal > 2147483647 or running_due > 2147483647 then
    raise exception 'Booking total is too large';
  end if;

  update public.bookings
  set
    status = 'pending_payment',
    subtotal_minor = running_subtotal::integer,
    amount_due_minor = running_due::integer
  where id = created_booking_id;

  return query
  select
    created_booking_id,
    created_reference,
    created_expires_at,
    running_subtotal::integer,
    running_due::integer;
end;
$$;

create function public.cancel_pending_booking(target_booking_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed_rows integer;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required';
  end if;

  update public.bookings
  set status = 'cancelled', expires_at = now()
  where id = target_booking_id
    and customer_id = (select auth.uid())
    and status in ('draft', 'pending_payment');

  get diagnostics changed_rows = row_count;

  if changed_rows = 1 then
    delete from public.inventory_holds where booking_id = target_booking_id;
    return true;
  end if;

  return false;
end;
$$;

create function public.set_profile_role(
  target_user_id uuid,
  new_role public.app_role
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_profile public.profiles;
begin
  if not private.is_admin() then
    raise exception 'Administrator access is required';
  end if;

  if target_user_id = (select auth.uid())
    and new_role <> 'admin'
    and (select count(*) from public.profiles where role = 'admin') <= 1
  then
    raise exception 'The final administrator cannot be demoted';
  end if;

  update public.profiles
  set role = new_role
  where id = target_user_id
  returning * into updated_profile;

  if not found then
    raise exception 'Profile not found';
  end if;

  return updated_profile;
end;
$$;

create function public.admin_dashboard_summary()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Administrator access is required';
  end if;

  return jsonb_build_object(
    'bookings_total', (select count(*) from public.bookings),
    'bookings_pending', (
      select count(*) from public.bookings where status in ('draft', 'pending_payment')
    ),
    'bookings_confirmed', (
      select count(*) from public.bookings where status = 'confirmed'
    ),
    'gross_paid_usd_minor', (
      select coalesce(sum(amount_minor - refunded_minor), 0)
      from public.payments where status in ('succeeded', 'partially_refunded') and currency = 'USD'
    ),
    'gross_paid_mxn_minor', (
      select coalesce(sum(amount_minor - refunded_minor), 0)
      from public.payments where status in ('succeeded', 'partially_refunded') and currency = 'MXN'
    ),
    'published_tours', (select count(*) from public.tours where published),
    'active_operators', (select count(*) from public.operators where status = 'active'),
    'pending_reviews', (select count(*) from public.reviews where status = 'pending'),
    'upcoming_departures', (
      select count(*) from public.departures where starts_at >= now() and status = 'scheduled'
    )
  );
end;
$$;

create function public.admin_update_booking_status(
  target_booking_id uuid,
  new_status public.booking_status,
  event_note text default null
)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_status public.booking_status;
  updated_booking public.bookings;
begin
  if not private.is_admin() then
    raise exception 'Administrator access is required';
  end if;

  select status into current_status
  from public.bookings
  where id = target_booking_id
  for update;

  if not found then
    raise exception 'Booking not found';
  end if;

  if current_status = new_status then
    return (select b from public.bookings b where b.id = target_booking_id);
  end if;

  if not (
    (current_status = 'draft' and new_status in ('pending_payment', 'cancelled'))
    or (current_status = 'pending_payment' and new_status in ('confirmed', 'cancelled'))
    or (current_status = 'confirmed' and new_status in ('completed', 'cancelled', 'refunded'))
    or (current_status = 'completed' and new_status = 'refunded')
  ) then
    raise exception 'Invalid booking status transition from % to %', current_status, new_status;
  end if;

  perform set_config('app.booking_event_note', coalesce(nullif(trim(event_note), ''), ''), true);

  update public.bookings
  set
    status = new_status,
    expires_at = case
      when new_status in ('cancelled', 'confirmed', 'completed', 'refunded') then now()
      else expires_at
    end
  where id = target_booking_id
  returning * into updated_booking;

  if new_status in ('cancelled', 'confirmed', 'completed', 'refunded') then
    delete from public.inventory_holds where booking_id = target_booking_id;
  end if;

  return updated_booking;
end;
$$;

create function public.admin_moderate_review(
  target_review_id uuid,
  new_status public.review_status
)
returns public.reviews
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_review public.reviews;
begin
  if not private.is_admin() then
    raise exception 'Administrator access is required';
  end if;

  update public.reviews
  set
    status = new_status,
    verified = (new_status = 'published'),
    published_at = case when new_status = 'published' then now() else null end
  where id = target_review_id
  returning * into updated_review;

  if not found then
    raise exception 'Review not found';
  end if;

  return updated_review;
end;
$$;

create function public.admin_update_tour_editorial(
  target_tour_id uuid,
  publish boolean,
  feature boolean,
  mark_popular boolean
)
returns public.tours
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_tour public.tours;
begin
  if not private.is_admin() then
    raise exception 'Administrator access is required';
  end if;

  update public.tours
  set published = publish, featured = feature, popular = mark_popular
  where id = target_tour_id
  returning * into updated_tour;

  if not found then
    raise exception 'Tour not found';
  end if;

  return updated_tour;
end;
$$;

create function private.log_booking_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.booking_events (booking_id, actor_id, from_status, to_status, note)
    values (
      new.id,
      (select auth.uid()),
      case when tg_op = 'INSERT' then null else old.status end,
      new.status,
      nullif(current_setting('app.booking_event_note', true), '')
    );
  end if;

  return new;
end;
$$;

create function private.log_audit_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  old_row jsonb := case when tg_op = 'INSERT' then null else to_jsonb(old) end;
  new_row jsonb := case when tg_op = 'DELETE' then null else to_jsonb(new) end;
  entity_id text := coalesce(new_row ->> 'id', old_row ->> 'id', 'unknown');
begin
  insert into private.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (
    (select auth.uid()),
    lower(tg_op),
    tg_table_schema || '.' || tg_table_name,
    entity_id,
    jsonb_build_object('old', old_row, 'new', new_row)
  );

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create trigger tour_translations_set_updated_at
  before update on public.tour_translations
  for each row execute procedure private.set_updated_at();

create trigger booking_status_history
  after insert or update of status on public.bookings
  for each row execute procedure private.log_booking_status_change();

create trigger operators_audit
  after insert or update or delete on public.operators
  for each row execute procedure private.log_audit_change();
create trigger tours_audit
  after insert or update or delete on public.tours
  for each row execute procedure private.log_audit_change();
create trigger departures_audit
  after insert or update or delete on public.departures
  for each row execute procedure private.log_audit_change();
create trigger bookings_audit
  after insert or update or delete on public.bookings
  for each row execute procedure private.log_audit_change();
create trigger payments_audit
  after insert or update or delete on public.payments
  for each row execute procedure private.log_audit_change();
create trigger reviews_audit
  after insert or update or delete on public.reviews
  for each row execute procedure private.log_audit_change();

alter table public.tour_translations enable row level security;
alter table public.booking_events enable row level security;

revoke all on public.tour_translations, public.booking_events from anon, authenticated;
grant select on public.tour_translations to anon, authenticated;
grant insert, update, delete on public.tour_translations to authenticated;
grant select on public.booking_events to authenticated;
grant all on public.tour_translations, public.booking_events to service_role;
grant usage, select on sequence public.booking_events_id_seq to service_role;

create policy tour_translations_select on public.tour_translations
  for select to anon, authenticated
  using (
    exists (select 1 from public.tours where id = tour_id and published)
    or private.can_manage_tour(tour_id)
    or private.is_admin()
  );
create policy tour_translations_manage on public.tour_translations
  for all to authenticated
  using (private.can_manage_tour(tour_id) or private.is_admin())
  with check (private.can_manage_tour(tour_id) or private.is_admin());

create policy booking_events_select on public.booking_events
  for select to authenticated
  using (private.can_view_booking(booking_id));

drop policy booking_items_select on public.booking_items;
create policy booking_items_select on public.booking_items
  for select to authenticated
  using (
    private.owns_booking(booking_id)
    or private.can_manage_departure(departure_id)
    or private.is_admin()
  );

create view public.operations_booking_items
with (security_invoker = true)
as
select
  bi.id,
  bi.booking_id,
  b.reference,
  b.guest_name,
  b.guest_email,
  b.guest_phone,
  b.status,
  b.currency,
  b.channel,
  b.amount_due_minor,
  b.amount_paid_minor,
  b.created_at,
  bi.departure_id,
  d.starts_at,
  d.status as departure_status,
  bi.tour_option_id,
  bi.quantity,
  bi.payment_choice,
  bi.unit_price_minor,
  bi.unit_deposit_minor,
  bi.unit_price_mxn_minor,
  bi.unit_deposit_mxn_minor,
  bi.title_snapshot,
  t.id as tour_id,
  t.slug as tour_slug,
  o.id as operator_id,
  o.name as operator_name
from public.booking_items bi
join public.bookings b on b.id = bi.booking_id
join public.departures d on d.id = bi.departure_id
join public.tours t on t.id = d.tour_id
join public.operators o on o.id = t.operator_id
where private.is_admin() or private.can_manage_departure(bi.departure_id);

create view public.managed_tours
with (security_invoker = true)
as
select
  t.id,
  t.slug,
  t.title,
  t.category,
  t.location,
  t.published,
  t.featured,
  t.popular,
  t.rating_average,
  t.reviews_count,
  t.updated_at,
  o.id as operator_id,
  o.name as operator_name,
  min(d.starts_at) filter (where d.starts_at >= now() and d.status = 'scheduled') as next_departure_at,
  count(d.id) filter (where d.starts_at >= now() and d.status = 'scheduled')::integer as upcoming_departures
from public.tours t
join public.operators o on o.id = t.operator_id
left join public.departures d on d.tour_id = t.id
where private.is_admin() or private.can_manage_tour(t.id)
group by t.id, o.id, o.name;

create view public.review_moderation_queue
with (security_invoker = true)
as
select
  r.id,
  r.tour_id,
  t.title as tour_title,
  r.booking_id,
  r.customer_id,
  p.full_name as customer_name,
  r.rating,
  r.content,
  r.status,
  r.verified,
  r.published_at,
  r.created_at,
  r.updated_at
from public.reviews r
join public.tours t on t.id = r.tour_id
join public.profiles p on p.id = r.customer_id
where private.is_admin() or private.can_manage_tour(r.tour_id);

revoke all on public.operations_booking_items, public.managed_tours,
  public.review_moderation_queue from anon, authenticated;
grant select on public.operations_booking_items, public.managed_tours,
  public.review_moderation_queue to authenticated;
grant select on public.operations_booking_items, public.managed_tours,
  public.review_moderation_queue to service_role;

revoke execute on function private.available_capacity(uuid, timestamptz)
  from public, anon, authenticated;
grant execute on function private.available_capacity(uuid, timestamptz) to service_role;

revoke execute on function public.get_departure_availability(uuid, timestamptz, timestamptz)
  from public;
grant execute on function public.get_departure_availability(uuid, timestamptz, timestamptz)
  to anon, authenticated, service_role;

revoke execute on function public.create_booking(
  text, text, text, text, jsonb, public.booking_channel, text, integer
) from public, anon;
grant execute on function public.create_booking(
  text, text, text, text, jsonb, public.booking_channel, text, integer
) to authenticated, service_role;

revoke execute on function public.cancel_pending_booking(uuid) from public, anon;
grant execute on function public.cancel_pending_booking(uuid) to authenticated, service_role;

revoke execute on function public.set_profile_role(uuid, public.app_role)
  from public, anon;
grant execute on function public.set_profile_role(uuid, public.app_role)
  to authenticated, service_role;

revoke execute on function public.admin_dashboard_summary() from public, anon;
grant execute on function public.admin_dashboard_summary() to authenticated, service_role;

revoke execute on function public.admin_update_booking_status(
  uuid, public.booking_status, text
) from public, anon;
grant execute on function public.admin_update_booking_status(
  uuid, public.booking_status, text
) to authenticated, service_role;

revoke execute on function public.admin_moderate_review(uuid, public.review_status)
  from public, anon;
grant execute on function public.admin_moderate_review(uuid, public.review_status)
  to authenticated, service_role;

revoke execute on function public.admin_update_tour_editorial(uuid, boolean, boolean, boolean)
  from public, anon;
grant execute on function public.admin_update_tour_editorial(uuid, boolean, boolean, boolean)
  to authenticated, service_role;

revoke execute on function private.log_booking_status_change()
  from public, anon, authenticated;
revoke execute on function private.log_audit_change()
  from public, anon, authenticated;

commit;

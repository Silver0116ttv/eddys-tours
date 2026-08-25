begin;

select plan(19);

select ok(
  to_regtype('public.payment_choice') is not null,
  'payment choice enum exists'
);
select ok(
  to_regtype('public.booking_channel') is not null,
  'booking channel enum exists'
);
select ok(
  to_regclass('public.tour_translations') is not null,
  'tour translations table exists'
);
select ok(
  to_regclass('public.booking_events') is not null,
  'booking events table exists'
);
select ok(
  to_regclass('public.operations_booking_items') is not null,
  'operations booking view exists'
);
select ok(
  to_regclass('public.managed_tours') is not null,
  'managed tours view exists'
);
select ok(
  to_regclass('public.review_moderation_queue') is not null,
  'review moderation view exists'
);
select ok(
  to_regprocedure(
    'public.get_departure_availability(uuid,timestamptz,timestamptz)'
  ) is not null,
  'availability function exists'
);
select ok(
  to_regprocedure(
    'public.create_booking(text,text,text,text,jsonb,public.booking_channel,text,integer)'
  ) is not null,
  'atomic booking function exists'
);
select ok(
  to_regprocedure('public.admin_dashboard_summary()') is not null,
  'administrator summary function exists'
);
select ok(
  to_regprocedure(
    'public.admin_update_booking_status(uuid,public.booking_status,text)'
  ) is not null,
  'administrator booking workflow function exists'
);
select ok(
  to_regprocedure(
    'public.admin_moderate_review(uuid,public.review_status)'
  ) is not null,
  'review moderation function exists'
);
select ok(
  to_regprocedure(
    'public.admin_update_tour_editorial(uuid,boolean,boolean,boolean)'
  ) is not null,
  'tour publishing function exists'
);
select ok(
  has_function_privilege(
    'anon',
    'public.get_departure_availability(uuid,timestamptz,timestamptz)',
    'execute'
  ),
  'anonymous visitors can read safe availability totals'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.create_booking(text,text,text,text,jsonb,public.booking_channel,text,integer)',
    'execute'
  ),
  'anonymous visitors cannot call the protected booking transaction directly'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.create_booking(text,text,text,text,jsonb,public.booking_channel,text,integer)',
    'execute'
  ),
  'authenticated customers can create a booking'
);
select ok(
  not has_table_privilege('anon', 'public.booking_events', 'select'),
  'anonymous visitors cannot read booking history'
);
select ok(
  has_table_privilege('authenticated', 'public.operations_booking_items', 'select'),
  'authenticated backoffice users can query the protected operations view'
);
select ok(
  (
    select coalesce(c.reloptions, '{}') @> array['security_invoker=true']
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'operations_booking_items'
  ),
  'operations view honors underlying row-level security'
);

select * from finish();
rollback;

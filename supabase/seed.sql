-- Reproducible demo catalog, safe to re-run. Departures are generated relative to
-- today; replace them with live operator inventory before enabling checkout.

insert into public.operators (name, slug, status)
values
  ('Vallarta Off-Road Co.', 'vallarta-off-road', 'active'),
  ('Banderas Eco Cruises', 'banderas-eco-cruises', 'active'),
  ('Bahía Sail Club', 'bahia-sail-club', 'active'),
  ('Blue Marlin Divers', 'blue-marlin-divers', 'active'),
  ('Vallarta Yacht Charters', 'vallarta-yacht-charters', 'active'),
  ('South Bay Boats', 'south-bay-boats', 'active'),
  ('Canopy River', 'canopy-river', 'active')
on conflict (slug) do update
set name = excluded.name, status = excluded.status;

insert into public.tours (
  legacy_id, operator_id, slug, title, category, location, short_description,
  full_description, duration_minutes, meeting_point, included_items, excluded_items,
  requirements, rating_average, reviews_count, featured, popular, published
)
select
  'atv-sierra-madre', o.id, 'atv-sierra-madre', 'ATV Sierra Madre', 'Adventure',
  'Puerto Vallarta',
  'Rip through jungle trails and river crossings in the Sierra Madre foothills.',
  'Grab the handlebars and chase muddy trails deep into the Sierra Madre. This guided ride climbs through tropical jungle, crosses shallow rivers, and stops at a scenic mountain lookout before heading back to the coast.',
  240, 'Marina Vallarta main dock',
  array['ATV & fuel', 'Certified guide', 'Helmet & goggles', 'Bottled water'],
  array['Gratuities', 'Hotel pickup'],
  array['Valid ID', 'Minimum age 16 to drive', 'Closed-toe shoes'],
  4.9, 128, false, true, true
from public.operators o where o.slug = 'vallarta-off-road'
on conflict (slug) do update set
  title = excluded.title, short_description = excluded.short_description,
  full_description = excluded.full_description, updated_at = now();

insert into public.tours (
  legacy_id, operator_id, slug, title, category, location, short_description,
  full_description, duration_minutes, meeting_point, included_items, excluded_items,
  requirements, rating_average, reviews_count, featured, popular, published
)
select
  'marietas-islands', o.id, 'marietas-islands-adventure', 'Marietas Islands Adventure',
  'Water', 'Islas Marietas',
  'Snorkel, kayak and visit the famous Hidden Beach on a full-day expedition.',
  'A full-day expedition to the protected Marietas Islands. Snorkel over vibrant reefs, paddle a kayak into sea caves, and — conditions permitting — visit the legendary Hidden Beach tucked inside the island.',
  480, 'Punta Mita boat ramp',
  array['Boat transport', 'Snorkel gear', 'Kayak', 'Lunch & drinks', 'Guide'],
  array['National park fee', 'Gratuities'],
  array['Basic swimming ability', 'Sunscreen (reef-safe)'],
  4.8, 214, true, true, true
from public.operators o where o.slug = 'banderas-eco-cruises'
on conflict (slug) do update set
  title = excluded.title, short_description = excluded.short_description,
  full_description = excluded.full_description, updated_at = now();

insert into public.tours (
  legacy_id, operator_id, slug, title, category, location, short_description,
  full_description, duration_minutes, meeting_point, included_items, excluded_items,
  requirements, rating_average, reviews_count, featured, popular, published
)
select
  'sunset-sailing', o.id, 'sunset-sailing-cruise', 'Sunset Sailing Cruise', 'Boats',
  'Bay of Banderas',
  'Glide across Banderas Bay as the Pacific lights up at golden hour.',
  'Set sail across Banderas Bay aboard a classic catamaran as the sun dips into the Pacific. Enjoy an open bar, canapés, and unbeatable views of the coastline glowing at golden hour.',
  180, 'Los Muertos Pier',
  array['Open bar', 'Canapés', 'Live music', 'Crew'], array['Gratuities'],
  array['Arrive 30 minutes early'], 4.9, 176, false, true, true
from public.operators o where o.slug = 'bahia-sail-club'
on conflict (slug) do update set
  title = excluded.title, short_description = excluded.short_description,
  full_description = excluded.full_description, updated_at = now();

insert into public.tours (
  legacy_id, operator_id, slug, title, category, location, short_description,
  full_description, duration_minutes, meeting_point, included_items, excluded_items,
  requirements, rating_average, reviews_count, featured, popular, published
)
select
  'los-arcos-snorkeling', o.id, 'los-arcos-snorkeling', 'Los Arcos Snorkeling', 'Water',
  'Puerto Vallarta',
  'Swim among tropical fish beneath the dramatic arches of Los Arcos.',
  'Explore the Los Arcos marine sanctuary, a cluster of granite arches teeming with tropical marine life. Perfect for first-timers and families, with calm water and shallow reefs.',
  180, 'Boca de Tomatlán pier', array['Snorkel gear', 'Guide', 'Water & fruit'],
  array['Wetsuit rental', 'Gratuities'], array['Basic swimming ability'],
  4.7, 92, false, true, true
from public.operators o where o.slug = 'blue-marlin-divers'
on conflict (slug) do update set
  title = excluded.title, short_description = excluded.short_description,
  full_description = excluded.full_description, updated_at = now();

insert into public.tours (
  legacy_id, operator_id, slug, title, category, location, short_description,
  full_description, duration_minutes, meeting_point, included_items, excluded_items,
  requirements, rating_average, reviews_count, featured, popular, published
)
select
  'private-yacht', o.id, 'private-yacht-experience', 'Private Yacht Experience', 'Boats',
  'Nuevo Vallarta', 'Your own private yacht and crew for a day on the bay.',
  'Charter a private yacht with captain and crew for a fully customizable day on Banderas Bay. Anchor in secluded coves, swim, paddleboard, and cruise the coastline on your schedule.',
  360, 'Paradise Village Marina',
  array['Private yacht & crew', 'Fuel', 'Snorkel gear', 'Drinks & snacks'],
  array['Catering upgrades', 'Gratuities'], array['Booking confirmed 48h in advance'],
  5.0, 41, false, true, true
from public.operators o where o.slug = 'vallarta-yacht-charters'
on conflict (slug) do update set
  title = excluded.title, short_description = excluded.short_description,
  full_description = excluded.full_description, updated_at = now();

insert into public.tours (
  legacy_id, operator_id, slug, title, category, location, short_description,
  full_description, duration_minutes, meeting_point, included_items, excluded_items,
  requirements, rating_average, reviews_count, featured, popular, published
)
select
  'whale-watching', o.id, 'whale-watching', 'Whale Watching', 'Wildlife',
  'Bay of Banderas',
  'Seasonal humpback whale watching with marine biologists aboard.',
  'From December to March, humpback whales fill Banderas Bay. Join our small-group boat with an onboard marine biologist for a respectful, unforgettable encounter with these giants.',
  210, 'Marina Vallarta dock 2',
  array['Boat & guide', 'Marine biologist', 'Water & snacks'], array['Gratuities'],
  array['Warm layer recommended'], 4.8, 153, false, true, true
from public.operators o where o.slug = 'banderas-eco-cruises'
on conflict (slug) do update set
  title = excluded.title, short_description = excluded.short_description,
  full_description = excluded.full_description, updated_at = now();

insert into public.tours (
  legacy_id, operator_id, slug, title, category, location, short_description,
  full_description, duration_minutes, meeting_point, included_items, excluded_items,
  requirements, rating_average, reviews_count, featured, popular, published
)
select
  'yelapa-day-trip', o.id, 'yelapa-day-trip', 'Yelapa Day Trip', 'Nature', 'Yelapa',
  'Boat to a car-free village, hike to a waterfall, and relax on the beach.',
  'Escape to Yelapa, a car-free fishing village reachable only by boat. Hike to a jungle waterfall, sample local pie on the beach, and soak up the slow pace of the southern bay.',
  420, 'Los Muertos Pier',
  array['Boat transport', 'Guide', 'Beach time', 'Waterfall hike'],
  array['Lunch', 'Gratuities'], array['Comfortable walking shoes'],
  4.7, 88, false, true, true
from public.operators o where o.slug = 'south-bay-boats'
on conflict (slug) do update set
  title = excluded.title, short_description = excluded.short_description,
  full_description = excluded.full_description, updated_at = now();

insert into public.tours (
  legacy_id, operator_id, slug, title, category, location, short_description,
  full_description, duration_minutes, meeting_point, included_items, excluded_items,
  requirements, rating_average, reviews_count, featured, popular, published
)
select
  'zipline-jungle', o.id, 'zipline-jungle-adventure', 'Zipline Jungle Adventure',
  'Adventure', 'Puerto Vallarta',
  'Fly across the jungle canopy on a network of high-speed ziplines.',
  'Soar over the treetops on a circuit of ziplines strung across a jungle river canyon. Combine your flights with rappelling and a mule ride for a full afternoon of adrenaline.',
  300, 'El Nogalito trailhead',
  array['All gear & harness', 'Guides', 'Transport from meeting point', 'Snack'],
  array['Photos package', 'Gratuities'], array['Max weight 120kg', 'Closed-toe shoes'],
  4.8, 119, false, true, true
from public.operators o where o.slug = 'canopy-river'
on conflict (slug) do update set
  title = excluded.title, short_description = excluded.short_description,
  full_description = excluded.full_description, updated_at = now();

insert into public.tour_media (tour_id, url, alt_text, position)
select t.id, media.url, media.alt_text, 0
from (values
  ('atv-sierra-madre', '/images/tour-atv.webp', 'ATV tour in the Sierra Madre'),
  ('marietas-islands-adventure', '/images/tour-marietas.webp', 'Marietas Islands coastline'),
  ('sunset-sailing-cruise', '/images/tour-sunset-sailing.webp', 'Sailing at sunset in Banderas Bay'),
  ('los-arcos-snorkeling', '/images/tour-snorkeling.webp', 'Snorkeling at Los Arcos'),
  ('private-yacht-experience', '/images/tour-yacht.webp', 'Private yacht in Banderas Bay'),
  ('whale-watching', '/images/tour-whale.webp', 'Humpback whale in Banderas Bay'),
  ('yelapa-day-trip', '/images/tour-yelapa.webp', 'Yelapa beach and village'),
  ('zipline-jungle-adventure', '/images/tour-zipline.webp', 'Zipline through tropical jungle')
) as media(slug, url, alt_text)
join public.tours t on t.slug = media.slug
on conflict (tour_id, position) do update
set url = excluded.url, alt_text = excluded.alt_text;

insert into public.tour_options (
  tour_id, name, retail_price_usd_minor, retail_price_mxn_minor,
  deposit_usd_minor, deposit_mxn_minor, max_participants
)
select t.id, 'Standard', pricing.usd_minor, pricing.mxn_minor,
  pricing.deposit_usd_minor, pricing.deposit_mxn_minor, pricing.max_participants
from (values
  ('atv-sierra-madre', 8900, 160000, 3000, 54000, 8),
  ('marietas-islands-adventure', 10900, 196000, 4000, 72000, 20),
  ('sunset-sailing-cruise', 7900, 142000, 2000, 36000, 30),
  ('los-arcos-snorkeling', 6500, 117000, 2000, 36000, 16),
  ('private-yacht-experience', 39900, 718000, 12000, 216000, 10),
  ('whale-watching', 9500, 171000, 3000, 54000, 18),
  ('yelapa-day-trip', 9900, 178000, 3500, 63000, 24),
  ('zipline-jungle-adventure', 8500, 153000, 3000, 54000, 14)
) as pricing(
  slug, usd_minor, mxn_minor, deposit_usd_minor, deposit_mxn_minor, max_participants
)
join public.tours t on t.slug = pricing.slug
on conflict (tour_id, name) do update set
  retail_price_usd_minor = excluded.retail_price_usd_minor,
  retail_price_mxn_minor = excluded.retail_price_mxn_minor,
  deposit_usd_minor = excluded.deposit_usd_minor,
  deposit_mxn_minor = excluded.deposit_mxn_minor,
  max_participants = excluded.max_participants,
  active = true;

insert into public.tour_translations (
  tour_id, locale, title, short_description, full_description, meeting_point,
  included_items, excluded_items, requirements
)
select
  t.id,
  'es-MX',
  copy.title,
  copy.short_description,
  copy.full_description,
  copy.meeting_point,
  copy.included_items,
  copy.excluded_items,
  copy.requirements
from (values
  (
    'atv-sierra-madre', 'ATV Sierra Madre',
    'Recorre senderos selváticos y cruza ríos al pie de la Sierra Madre.',
    'Toma el manubrio y adéntrate por caminos de tierra en la Sierra Madre. Este recorrido guiado sube por la selva tropical, cruza ríos poco profundos y se detiene en un mirador antes de volver a la costa.',
    'Muelle principal de Marina Vallarta',
    array['ATV y combustible', 'Guía certificado', 'Casco y goggles', 'Agua embotellada'],
    array['Propinas', 'Traslado desde el hotel'],
    array['Identificación vigente', 'Edad mínima de 16 años para conducir', 'Calzado cerrado']
  ),
  (
    'marietas-islands-adventure', 'Aventura en Islas Marietas',
    'Haz snorkel, navega en kayak y visita la famosa Playa Escondida.',
    'Una expedición de día completo a las protegidas Islas Marietas. Haz snorkel sobre arrecifes llenos de vida, rema en kayak por cuevas marinas y, si las condiciones lo permiten, visita la legendaria Playa Escondida.',
    'Rampa de embarcaciones de Punta Mita',
    array['Transporte en barco', 'Equipo de snorkel', 'Kayak', 'Comida y bebidas', 'Guía'],
    array['Tarifa del parque nacional', 'Propinas'],
    array['Saber nadar', 'Protector solar biodegradable']
  ),
  (
    'sunset-sailing-cruise', 'Paseo en velero al atardecer',
    'Navega por la Bahía de Banderas mientras el Pacífico se ilumina al atardecer.',
    'Navega por la Bahía de Banderas en un catamarán clásico mientras el sol cae sobre el Pacífico. Disfruta barra libre, canapés y vistas inolvidables de la costa durante la hora dorada.',
    'Muelle de Los Muertos',
    array['Barra libre', 'Canapés', 'Música en vivo', 'Tripulación'],
    array['Propinas'], array['Llegar 30 minutos antes']
  ),
  (
    'los-arcos-snorkeling', 'Snorkel en Los Arcos',
    'Nada entre peces tropicales bajo los impresionantes arcos de piedra.',
    'Explora el santuario marino de Los Arcos, un conjunto de formaciones de granito lleno de vida tropical. Ideal para principiantes y familias, con aguas tranquilas y arrecifes poco profundos.',
    'Muelle de Boca de Tomatlán',
    array['Equipo de snorkel', 'Guía', 'Agua y fruta'],
    array['Renta de traje de neopreno', 'Propinas'], array['Saber nadar']
  ),
  (
    'private-yacht-experience', 'Experiencia en yate privado',
    'Tu propio yate con tripulación para disfrutar un día en la bahía.',
    'Renta un yate privado con capitán y tripulación para vivir un día totalmente personalizado en la Bahía de Banderas. Fondea en caletas apartadas, nada, usa el paddleboard y recorre la costa a tu ritmo.',
    'Marina de Paradise Village',
    array['Yate privado y tripulación', 'Combustible', 'Equipo de snorkel', 'Bebidas y snacks'],
    array['Mejoras de catering', 'Propinas'], array['Confirmar con 48 h de anticipación']
  ),
  (
    'whale-watching', 'Avistamiento de ballenas',
    'Observa ballenas jorobadas en temporada acompañado por biólogos marinos.',
    'De diciembre a marzo, las ballenas jorobadas llegan a la Bahía de Banderas. Únete a un grupo pequeño con un biólogo marino a bordo para vivir un encuentro respetuoso e inolvidable con estos gigantes.',
    'Muelle 2 de Marina Vallarta',
    array['Embarcación y guía', 'Biólogo marino', 'Agua y snacks'],
    array['Propinas'], array['Se recomienda llevar una prenda abrigadora']
  ),
  (
    'yelapa-day-trip', 'Excursión de un día a Yelapa',
    'Viaja en barco a un pueblo sin autos, camina a una cascada y relájate en la playa.',
    'Escápate a Yelapa, un pueblo pesquero sin autos al que solo se llega en barco. Camina hacia una cascada en la selva, prueba el famoso pay local y disfruta el ritmo tranquilo del sur de la bahía.',
    'Muelle de Los Muertos',
    array['Transporte en barco', 'Guía', 'Tiempo en la playa', 'Caminata a la cascada'],
    array['Comida', 'Propinas'], array['Calzado cómodo para caminar']
  ),
  (
    'zipline-jungle-adventure', 'Aventura de tirolesa en la selva',
    'Vuela sobre la selva en un circuito de tirolesas de alta velocidad.',
    'Vuela sobre las copas de los árboles en un circuito de tirolesas que cruza un cañón selvático. Combina el recorrido con rappel y un paseo en mula para una tarde llena de adrenalina.',
    'Inicio del sendero El Nogalito',
    array['Equipo y arnés', 'Guías', 'Transporte desde el punto de encuentro', 'Snack'],
    array['Paquete de fotos', 'Propinas'], array['Peso máximo de 120 kg', 'Calzado cerrado']
  )
) as copy(
  slug, title, short_description, full_description, meeting_point,
  included_items, excluded_items, requirements
)
join public.tours t on t.slug = copy.slug
on conflict (tour_id, locale) do update set
  title = excluded.title,
  short_description = excluded.short_description,
  full_description = excluded.full_description,
  meeting_point = excluded.meeting_point,
  included_items = excluded.included_items,
  excluded_items = excluded.excluded_items,
  requirements = excluded.requirements,
  updated_at = now();

insert into private.operator_rates (tour_option_id, currency, provider_cost_minor)
select option.id, 'USD', costs.provider_cost_minor
from (values
  ('atv-sierra-madre', 6200),
  ('marietas-islands-adventure', 7800),
  ('sunset-sailing-cruise', 5400),
  ('los-arcos-snorkeling', 4400),
  ('private-yacht-experience', 30000),
  ('whale-watching', 6600),
  ('yelapa-day-trip', 7000),
  ('zipline-jungle-adventure', 5800)
) as costs(slug, provider_cost_minor)
join public.tours t on t.slug = costs.slug
join public.tour_options option on option.tour_id = t.id and option.name = 'Standard'
on conflict (tour_option_id, currency, effective_from) do update
set provider_cost_minor = excluded.provider_cost_minor;

-- Departures are seeded relative to the day the seed runs, so the demo catalog
-- always shows upcoming availability instead of expiring on a fixed date.
insert into public.departures (tour_id, starts_at, capacity)
select
  t.id,
  (((now() at time zone 'America/Mexico_City')::date + schedule.day_offset) + schedule.local_time)
    at time zone 'America/Mexico_City',
  schedule.capacity
from (values
  ('atv-sierra-madre', 1, time '09:00', 8),
  ('atv-sierra-madre', 1, time '13:00', 8),
  ('atv-sierra-madre', 2, time '09:00', 8),
  ('atv-sierra-madre', 3, time '13:00', 8),
  ('atv-sierra-madre', 5, time '09:00', 8),
  ('marietas-islands-adventure', 1, time '08:00', 20),
  ('marietas-islands-adventure', 4, time '08:00', 20),
  ('marietas-islands-adventure', 6, time '08:00', 20),
  ('sunset-sailing-cruise', 1, time '17:00', 30),
  ('sunset-sailing-cruise', 2, time '17:00', 30),
  ('sunset-sailing-cruise', 3, time '17:00', 30),
  ('sunset-sailing-cruise', 5, time '17:00', 30),
  ('los-arcos-snorkeling', 1, time '09:00', 16),
  ('los-arcos-snorkeling', 1, time '12:00', 16),
  ('los-arcos-snorkeling', 2, time '09:00', 16),
  ('los-arcos-snorkeling', 4, time '12:00', 16),
  ('private-yacht-experience', 2, time '10:00', 10),
  ('private-yacht-experience', 3, time '10:00', 10),
  ('private-yacht-experience', 7, time '10:00', 10),
  ('whale-watching', 1, time '08:30', 18),
  ('whale-watching', 3, time '11:30', 18),
  ('whale-watching', 6, time '08:30', 18),
  ('yelapa-day-trip', 2, time '09:00', 24),
  ('yelapa-day-trip', 4, time '09:00', 24),
  ('yelapa-day-trip', 5, time '09:00', 24),
  ('zipline-jungle-adventure', 1, time '09:00', 14),
  ('zipline-jungle-adventure', 3, time '13:30', 14),
  ('zipline-jungle-adventure', 7, time '09:00', 14)
) as schedule(slug, day_offset, local_time, capacity)
join public.tours t on t.slug = schedule.slug
on conflict (tour_id, starts_at) do update
set capacity = excluded.capacity, status = 'scheduled';

# Plan de integración y salida a producción — Eddy's Tours

Estado de partida: frontend terminado (lint, typecheck, build y `check:frontend` en verde),
esquema Supabase versionado con RLS y funciones transaccionales, panel administrativo completo
en modo demo. Lo que sigue es integración y operación real, no diseño.

> Hosting: el despliegue se hace en Hostinger (Node.js Web Apps), no en Vercel. Donde este
> documento diga "Vercel" aplica lo descrito en `despliegue-hostinger.md`.

Este documento fija **decisiones**, **principios**, **fases con criterio de salida**, y los
**cambios concretos** (migraciones, endpoints, variables) que cada fase requiere. Las
estimaciones son orientativas para una persona desarrolladora a tiempo completo.

---

## 0. Resumen ejecutivo

| Bloque | Estado | Fase que lo cierra |
| --- | --- | --- |
| Baseline y decisiones | Diff sin commit; 2 decisiones abiertas | F0 |
| Supabase staging + prod, Auth, Storage | Migraciones listas, sin proyecto | F1 |
| Catálogo real (8 tours, salidas, fotos, ES/EN) | Seed histórico desactualizado | F2 |
| Checkout, reservas, consulta de solicitud, contacto | localStorage en demo | F3 |
| Stripe, webhooks, reembolsos | Sin código | F4 |
| Panel administrativo completo | 3 de 10 módulos con endpoint real | F5 |
| Correos transaccionales y de Auth | mailto / local | F6 |
| QA en staging con pagos de prueba | — | F7 |
| Dominio, backups, monitoreo, legales | Vercel vinculado | F8 |

Orden crítico: **F0 → F1 → F2 → F3 → F4 → F6 → F5 → F7 → F8.** Los correos (F6) van antes
del panel completo (F5) porque sin confirmación por correo no se puede vender aunque el
panel esté a medias; el panel puede completarse por módulos mientras se prueba en staging.

---

## 1. Decisiones de arquitectura

Cada decisión se registra aquí y, si cambia, se documenta el porqué (formato ADR corto).

### D1 — Checkout de invitado a través del servidor (resuelve el punto técnico 2)

**Decisión:** no se exige cuenta para reservar. El checkout público llama a un endpoint
propio (`POST /api/checkout`) que valida con `zod`, resuelve salidas y opciones, y ejecuta
`public.create_booking` con el cliente de **service role** (módulo `server-only`). La
función ya acepta `auth.role() = 'service_role'`; `customer_id` queda `null` y
`guest_email/guest_name/guest_phone` se llenan.

**Por qué:** en turismo, exigir registro antes de pagar reduce conversión; el webhook de
Stripe y los jobs de expiración ya necesitan service role, así que un solo mecanismo cubre
todo. RLS sigue protegiendo el acceso desde el navegador: el navegador nunca toca
`bookings` directamente.

**Consecuencias:**
- `cancel_pending_booking` y `owns_booking` asumen `auth.uid()`; se agregan variantes por
  referencia + token para invitados (ver §4).
- Consulta de solicitud (`/my-bookings`): por **referencia + correo** con límite de
  intentos, y por **enlace firmado** en el correo de confirmación (HMAC de `booking_id`
  con `BOOKING_LINK_SECRET`, sin tabla extra).
- Cuenta opcional después: si más adelante se activa Supabase Auth para viajeros, se
  vinculan reservas por correo verificado (`update bookings set customer_id = ... where
  guest_email = ... and customer_id is null`).
- Alternativa considerada: *anonymous sign-ins* de Supabase (RLS nativo, `auth.uid()`
  presente). Descartada por ahora: crea un usuario por visitante, no resuelve la consulta
  desde otro dispositivo y duplica caminos con el webhook.

### D2 — Moneda de cobro

**Decisión pendiente del negocio (bloquea F4):** la cuenta de Stripe México liquida en MXN.
Opciones:
1. Cobrar siempre en **MXN**; USD se muestra como referencia y el cobro real es el importe
   MXN del catálogo (`retail_price_mxn_minor`). Más simple, sin conversión de Stripe.
2. Cobrar en la moneda que el viajero eligió (USD o MXN). Requiere que la cuenta Stripe
   tenga habilitada presentación en USD; Stripe aplica conversión y comisión.

Recomendación: opción 1 para el lanzamiento; la base de datos ya guarda ambos importes
por partida, así que cambiar a la opción 2 después no requiere migración.

### D3 — Stripe Checkout alojado (no Elements)

Sesión de Checkout con `expires_at` = vencimiento del hold (30 min, el máximo que permite
`create_booking` y el mínimo que permite Stripe). PCI SAQ-A, 3DS, Apple/Google Pay,
localización ES/EN sin código propio. Elements queda como mejora futura si se quiere
el pago embebido.

### D4 — Correo transaccional con Resend + plantillas React Email

Un proveedor para transaccionales y para el SMTP personalizado de Supabase Auth (el SMTP
por defecto de Supabase tiene límite de pocos correos por hora y no sirve en producción).
Dominio verificado (SPF/DKIM/DMARC) antes de F6.

### D5 — Dos proyectos Supabase (staging y producción) y dos modos de Stripe

- Vercel *Preview* → Supabase **staging** + Stripe **test**.
- Vercel *Production* → Supabase **producción** + Stripe **live**.
- Local → Supabase CLI (Docker) + Stripe test con `stripe listen`.

Misma carpeta `supabase/migrations`; se aplica primero en staging, luego en producción.

### D6 — Reseñas de invitados

`reviews.customer_id` pasa a **nullable** y se agregan `reviewer_name`, `reviewer_email`.
La verificación se hace por **invitación firmada** enviada por correo después de la fecha
del tour (`review_invitations`: hash del token, `booking_id`, `tour_id`, `expires_at`,
`used_at`). La vista `review_moderation_queue` cambia a `left join profiles`.

### D7 — El contenido productivo no vive en `seed.sql`

`supabase/seed.sql` queda solo para desarrollo local. Los ocho tours reales se cargan con
un script idempotente aparte (`supabase/content/catalogo-real.sql`, no aplicado
automáticamente) o desde el editor del panel una vez conectado (F5). Las salidas se
generan con una herramienta de "salidas recurrentes", no a mano.

### D8 — Modo demo detrás de bandera

`/admin/demo` y los textos "modo demostración" siguen funcionando cuando Supabase no está
configurado, pero en producción se ocultan con `NEXT_PUBLIC_ENABLE_DEMO=false`. Así el
cliente puede seguir enseñando el demo en un preview sin exponerlo en el sitio real.

---

## 2. Principios transversales

1. **Dinero en enteros menores en el servidor** (`*_minor`). La UI usa `Price` en unidades
   mayores; la conversión ocurre solo en el borde (`lib/data/*`). Nunca se envían
   precios del navegador al servidor: el servidor los recalcula (ya lo hace
   `create_booking`).
2. **Service role solo en módulos `server-only`** (`lib/supabase/admin.ts`, nuevo). Ningún
   import desde componentes cliente. `SUPABASE_SERVICE_ROLE_KEY` nunca lleva
   `NEXT_PUBLIC_`.
3. **Validación de entrada con `zod`** en todo route handler (público y admin) y
   **validación de variables de entorno al arrancar** (`lib/env.ts`).
4. **Idempotencia**: eventos de Stripe registrados por `event.id` antes de procesarlos;
   llamadas a Stripe con `idempotencyKey`; correos con `notifications(booking_id, kind)`
   único.
5. **Migraciones inmutables**: nunca se edita una migración aplicada; cambios en archivos
   nuevos `YYYYMMDDNNNN_descripcion.sql`; cada migración con pgTAP en `supabase/tests`.
6. **Límite de intentos** en endpoints públicos que escriben (`/api/checkout`,
   `/api/bookings/lookup`, `/api/contact`): Upstash Ratelimit o reglas del Firewall de
   Vercel, más honeypot y Turnstile en contacto.
7. **Observabilidad con contexto**: logs estructurados con `reference`; Sentry en cliente y
   servidor; alertas de fallo de webhook en Stripe.
8. **Feature flag `BOOKINGS_ENABLED`**: se puede desplegar todo el código a producción con
   ventas cerradas y abrirlas sin redeploy.
9. **Zona horaria única** `America/Mexico_City` (ya en `lib/time.ts`); las salidas se
   guardan en `timestamptz` y se presentan con esa zona.
10. **CI bloqueante**: `pnpm check` + `supabase db lint` + `supabase test db` + Playwright
    del flujo de reserva contra un preview.

---

## 3. Fases

### F0 — Baseline y preparación (1 día)

**Objetivo:** congelar el frontend terminado y dejar el repo listo para trabajo por PR.

- Commit del diff actual como `feat: frontend terminado para revisión` y tag
  `v0.1.0-frontend`. Confirmar que `.vercel/` y `.env.local` están en `.gitignore`.
- Proteger `main`: PR obligatorio, CI verde, sin push directo.
- Dependencias nuevas: `zod`, `stripe`, `resend`, `@react-email/components`,
  `@upstash/ratelimit` + `@upstash/redis` (o alternativa elegida), `@sentry/nextjs`,
  `@playwright/test` (dev). Leer `node_modules/next/dist/docs/` antes de tocar route
  handlers, `proxy.ts` o caché: esta versión de Next difiere de la documentación previa.
- `lib/env.ts` con esquema `zod` de todas las variables (§6) y fallo temprano en build si
  falta una obligatoria en producción.
- Registrar D1–D8 en `docs/decisiones/` (un archivo corto por decisión).
- Cerrar D2 con el negocio.

**Salida:** `main` protegido, CI verde, tag creado, decisiones escritas.

### F1 — Supabase real: staging y producción (1–2 días)

**Objetivo:** que `/admin` funcione con una cuenta real contra staging desde un preview.

1. Crear proyectos `eddys-tours-staging` y `eddys-tours-prod` (misma región, la más cercana
   a la región de funciones de Vercel para minimizar latencia; anotar la elegida).
2. `pnpm dlx supabase link --project-ref <staging>` → `pnpm dlx supabase db push`.
   Antes, en local: `pnpm supabase:reset`, `pnpm supabase:lint`, `pnpm supabase:test`.
3. Auth (en ambos proyectos):
   - Desactivar registro público (los administradores se invitan desde el dashboard).
   - SMTP personalizado (Resend) — sin esto los correos de invitación/recuperación fallan.
   - `Site URL` y `Redirect URLs`: dominio de producción, `*.vercel.app` del proyecto,
     `http://localhost:3000`; incluir `/admin/reset-password`.
   - Política de contraseña ≥ 12 caracteres; considerar MFA TOTP para administradores.
   - Invitar al primer administrador, promover con el `update public.profiles` del README,
     verificar que `set_profile_role` funciona desde esa sesión para el segundo.
4. Storage: bucket `tour-media` (público de lectura, escritura solo `private.is_admin()`
   vía políticas en `storage.objects`; límite de tamaño y tipos `image/*`).
5. `pnpm supabase:types` y commit de `database.types.ts`.
6. Vercel: variables por entorno (§6). Preview apunta a staging.
7. `next.config.mjs`: `images.remotePatterns` para `<ref>.supabase.co/storage/v1/object/public/**`.

**Salida:** login real en un preview, `GET /api/admin/dashboard` responde 200 con sesión
admin y 401/403 sin ella; `check:frontend` en verde contra el preview.

### F2 — Catálogo real (2–3 días, depende de que el negocio entregue contenido)

**Objetivo:** el sitio público lee los ocho tours reales desde Supabase.

1. Recolectar del negocio, por tour: título y textos ES/EN, categoría, ubicación, duración,
   punto de encuentro, incluye/no incluye/requisitos, precio USD y MXN, anticipo, mínimo y
   máximo de personas, operador, costo de proveedor (`private.operator_rates`), fotos
   (mínimo 4, con texto alternativo), horarios y capacidad por salida, temporada.
2. Script `supabase/content/catalogo-real.sql` idempotente (`on conflict (slug)`), con
   `tour_translations` para `es-MX`. Subir fotos a Storage con `scripts/upload-media.mjs`
   (reutiliza `optimize-images.mjs` para generar WebP antes de subir).
3. **Ampliar el catálogo en código** para que el carrito pueda reservar:
   - `Tour` gana `optionId` y `departures: { id, startsAt, remaining }[]`
     (`lib/tours.ts`, `lib/data/catalog.ts`).
   - `CartItem` gana `departureId` y `tourOptionId`; `addItem` los toma de la salida
     elegida; `isCartItem` los valida al restaurar.
   - El selector de fecha/hora en `tour-detail` y `trip` elige una salida, no un par
     texto/texto.
   - Reducir `CATALOG_REVALIDATE_SECONDS` o etiquetar `revalidateTag('tour-catalog')`
     desde el panel al guardar un tour (F5).
4. Reemplazar `lib/data/fallback-catalog.ts` con contenido neutro claramente marcado como
   muestra (sigue siendo el respaldo si Supabase no responde) o mantener los ocho reales
   como fallback si el negocio lo autoriza.
5. `app/sitemap.ts` y `robots.ts` con slugs reales.

**Salida:** `/tours` y `/tours/[slug]` renderizan desde staging con salidas reales;
`get_departure_availability` devuelve capacidad restante; Lighthouse sin regresión.

### F3 — Checkout, reservas, consulta y contacto reales (3–5 días) — resuelve el punto técnico 1

**Objetivo:** una solicitud crea una reserva `pending_payment` con hold de inventario en
Supabase, se puede consultar y expira sola.

Migración `202609xx0001_guest_checkout.sql` (detalle en §4):
- `contact_messages`, `notifications`, `stripe_events`.
- `public.expire_pending_bookings()` + `pg_cron` cada 5 min.
- `public.get_booking_for_guest(reference, email)` (service role) que devuelve reserva,
  partidas y eventos sin datos internos.
- `public.cancel_booking_as_guest(booking_id)` (service role).
- `private.available_capacity` ya ignora holds vencidos; solo se añade el cierre de estado.

Código:
- `lib/supabase/admin.ts` (`server-only`, service role).
- `POST /api/checkout`: `zod` → cargar catálogo → validar que cada línea tiene
  `departureId/tourOptionId` de un tour publicado → `create_booking(hold_minutes = 30)` →
  responder `{ reference, expiresAt, amountDueMinor, currency }`. Si `BOOKINGS_ENABLED`
  es falso, 503 con mensaje claro. Con límite de intentos por IP.
- `components/travel/trip.tsx`: paso 2 llama al endpoint; el modo `saveDemoRequest` queda
  solo cuando `!isSupabaseConfigured()`. Manejar errores de disponibilidad
  ("Not enough availability") con mensaje por línea y sugerir otra salida.
- `POST /api/bookings/lookup` (referencia + correo, rate limit) y
  `GET /api/bookings/:reference?token=` (enlace firmado) → `my-bookings.tsx` deja de leer
  `readDemoRequests` cuando hay Supabase.
- `POST /api/bookings/:reference/cancel` con token, solo si `pending_payment`.
- `POST /api/contact`: `zod` + honeypot + Turnstile → `contact_messages` → correo al
  buzón del negocio (F6). `information.tsx` deja el `mailto` solo como respaldo.
- Página `/checkout/success?ref=` y `/checkout/expired` (las usará Stripe en F4).

Pruebas:
- pgTAP: expiración libera hold, `get_booking_for_guest` no expone `customer_notes` de
  otro correo, `cancel_booking_as_guest` rechaza estados no cancelables.
- Playwright: catálogo → carrito → checkout → referencia visible → consulta por
  referencia + correo.
- Prueba de concurrencia manual: dos navegadores compiten por el último lugar; uno recibe
  error de disponibilidad.

**Salida:** reserva real creada, visible en `/admin/bookings`, expira a los 30 min sin
pago y libera capacidad.

### F4 — Stripe: cobro, webhooks, reembolsos (3–5 días)

**Objetivo:** pago con tarjeta confirma la reserva automáticamente; sin pago, expira;
reembolso desde el panel.

Migración `202609xx0002_payments.sql`:
- `public.confirm_booking_payment(booking_id, payment_intent_id, amount_minor, currency)`
  (service role): inserta `payments`, suma `amount_paid_minor`, pasa a `confirmed`,
  borra holds, registra evento. Idempotente por `stripe_payment_intent_id`.
- `public.record_refund(payment_intent_id, refunded_minor, full boolean)`: actualiza
  `payments.refunded_minor/status` y `bookings.status` (`refunded` si total).
- `public.fail_booking_payment(booking_id, reason)`: devuelve a `pending_payment` o
  cancela si el hold ya venció.

Código:
- `POST /api/checkout` (extendido): tras `create_booking`, crea Checkout Session con
  `client_reference_id = booking_id`, `metadata { reference }`, `customer_email`,
  `expires_at = expires_at del hold`, `line_items` por partida en la moneda de D2,
  `success_url = /checkout/success?ref=&session_id={CHECKOUT_SESSION_ID}`,
  `cancel_url = /checkout?ref=` (el hold sigue vivo hasta expirar). Guardar
  `stripe_checkout_session_id` en `bookings` (columna nueva).
- `POST /api/webhooks/stripe` (raw body, verificación de firma, `stripe_events` para
  idempotencia). Eventos: `checkout.session.completed`,
  `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`,
  `checkout.session.expired`, `charge.refunded`, `charge.dispute.created`. Responder 200
  rápido; trabajo pesado (correo) después de confirmar en base de datos.
- `POST /api/admin/bookings/:id/refund` `{ amountMinor?, reason }` → `stripe.refunds.create`
  con `idempotencyKey` → la base se actualiza por webhook, no en el handler.
- "Cobrar saldo" para anticipos: `POST /api/admin/bookings/:id/balance-link` genera una
  nueva Checkout Session por `amount_due_minor - amount_paid_minor` y la envía por correo.
- Nonce CSP en `proxy.ts` con `js.stripe.com`, `checkout.stripe.com`, dominio de Supabase
  y Vercel Analytics (cierra el pendiente anotado en `next.config.mjs`).

Pruebas:
- `stripe listen --forward-to localhost:3000/api/webhooks/stripe` con tarjetas de prueba
  (éxito, 3DS, rechazo), `stripe trigger checkout.session.expired`, reenvío del mismo
  evento (debe ser no-op).
- Playwright: pago de prueba completo hasta `confirmed` y correo (F6) en bandeja de
  pruebas.

**Salida:** matriz pago/expira/reembolso/disputa cubierta; panel muestra `payments` reales.

### F6 — Correos y notificaciones (2–3 días; se hace antes que F5)

**Objetivo:** cada transición de estado tiene su correo, en el idioma del viajero.

- Dominio verificado en Resend; remitente `reservas@…`, respuesta a `hola@eddystours.mx`.
- Plantillas React Email ES/EN: solicitud recibida (con enlace de pago y vencimiento),
  reserva confirmada (voucher: referencia, salida, punto de encuentro, qué llevar,
  política de cancelación, enlace firmado a `/my-bookings`), solicitud vencida,
  cancelación, reembolso, recordatorio 24 h antes, invitación a reseña 24 h después,
  aviso interno de nueva reserva y de nuevo contacto.
- `lib/email/send.ts`: escribe en `notifications(booking_id, kind)` **antes** de enviar
  (unicidad evita duplicados si el webhook se reintenta) y guarda `provider_id`.
- Programados: `pg_cron` → `net.http_post` a `POST /api/jobs/reminders` con
  `CRON_SECRET` (o Vercel Cron), que consulta salidas en 24 h y reservas completadas
  hace 24 h.
- Supabase Auth con SMTP de Resend; plantillas de invitación y recuperación con la marca.
- Idioma: guardar `locale` en `bookings` (columna nueva) al crear la reserva.

**Salida:** bandeja de pruebas recibe todos los correos en staging; ninguno se duplica al
reenviar un evento de Stripe.

### F5 — Panel administrativo completo (8–12 días)

**Objetivo:** ningún módulo devuelve "estará disponible cuando se conecte" fuera del demo.

Migración `202609xx0003_admin_operations.sql`: `operator_payouts`, `site_settings`,
`review_invitations`, `reviews.customer_id` nullable (D6), `departure_templates` (para
generar salidas recurrentes), `public.admin_save_tour(payload jsonb)` (tour +
traducciones + opción + medios en una transacción), `public.admin_generate_departures(
tour_id, template, from, to)`, `public.admin_create_booking(...)` (`channel = 'admin'`).

Por módulo (endpoint + adaptador en `lib/data/admin-workspace.ts` + UI existente):

| Módulo | Falta | Endpoint |
| --- | --- | --- |
| Tours | CRUD completo, traducciones, precios, fotos (subida a Storage con URL firmada), salidas, vista previa real, `revalidateTag('tour-catalog')` al guardar | `POST/PUT /api/admin/tours`, `POST /api/admin/tours/:id/media`, `POST /api/admin/tours/:id/departures` |
| Reservaciones | Detalle con `booking_events` y `payments`, reserva manual, cobrar saldo, reembolso, nota interna | `GET /api/admin/bookings/:id`, `POST /api/admin/bookings`, refund y balance-link (F4) |
| Calendario | Salidas con capacidad y ocupación por día; cancelar salida (notifica y reembolsa) | `GET /api/admin/departures?from&to`, `PATCH /api/admin/departures/:id` |
| Cobros | Leer `payments` reales, filtros por estado y fecha, exportar CSV | `GET /api/admin/payments` |
| Pagos a operadores | `operator_payouts` calculados desde `private.operator_rates` × partidas confirmadas; marcar pagado con comprobante (Storage) | `GET/POST/PATCH /api/admin/payouts` |
| Contactos | `contact_messages` con estado nuevo/contactado/cerrado; responder abre correo | `GET/PATCH /api/admin/contacts` |
| Operadores | CRUD + `operator_members` (invitar usuario operador) | `GET/POST/PATCH /api/admin/operators` |
| Reseñas | Ya existe moderación; añadir reenvío de invitación y respuesta pública | `POST /api/admin/reviews/:id/invite` |
| Configuración | `site_settings` (datos del negocio, política, moneda por defecto, `bookings_enabled`) | `GET/PUT /api/admin/settings` |

Además:
- Sustituir la carga única de 100 filas por colección en `liveWorkspace()` por carga por
  sección con paginación y búsqueda del servidor (los endpoints ya paginan).
- Tipar los formularios por colección en lugar del `AdminRecord` genérico donde el
  formulario real lo exija (tours y reservaciones al menos).
- Todos los handlers con `zod` y `requireAdmin()`; auditoría ya cubierta por triggers.
- `/admin/demo` detrás de `NEXT_PUBLIC_ENABLE_DEMO` (D8).

**Salida:** un administrador puede crear un tour con fotos, generar salidas, recibir una
reserva, cobrar, reembolsar, contestar un contacto y pagar a un operador sin tocar la base.

### F7 — QA integral en staging (3–5 días)

- Matriz: Chrome/Safari/Firefox, iOS/Android, ES/EN, USD/MXN, anticipo/total, 1 y varios
  tours, último lugar en competencia, expiración, reembolso parcial y total, disputa,
  sesión admin vencida, usuario sin rol admin, operador.
- Automatizado en CI: `pnpm check`, `supabase db lint`, `supabase test db`,
  Playwright contra el preview del PR (login admin con cuenta de staging en secretos).
- Accesibilidad (axe en Playwright), Lighthouse ≥ 90 en móvil para inicio, catálogo y
  detalle; `check:frontend` con `FRONTEND_TEST_URL` del preview.
- Revisión de seguridad: pgTAP de RLS por rol (anon, customer, operator, admin), ningún
  secreto en bundle cliente (`next build` + búsqueda de `SUPABASE_SERVICE_ROLE_KEY`),
  cabeceras y CSP, `pnpm audit`, límites de intentos verificados con carga sintética.
- Restauración de respaldo de staging a un proyecto temporal (ensayo de recuperación).

**Salida:** informe de QA con incidencias cerradas; CI en verde con e2e.

### F8 — Producción (2–3 días + ventana de lanzamiento)

1. Supabase producción: migraciones aplicadas, `pg_cron` y `pg_net` activos, plan Pro
   con PITR, alertas de uso, `catalogo-real.sql` aplicado, primer admin promovido.
2. Stripe live: claves, webhook live apuntando al dominio, alertas de fallo de webhook,
   política de reembolso y términos visibles (Stripe lo exige), descriptor de cargo.
3. Vercel producción: dominio y DNS, HSTS ya presente, variables live, `BOOKINGS_ENABLED=false`
   hasta el smoke test, Vercel Analytics, log drain, Sentry con release y source maps.
4. Monitoreo: Sentry (errores), uptime externo sobre `/` y `/api/health` (nuevo),
   alerta si no llega ningún evento de Stripe en X horas con reservas pendientes,
   panel de Supabase (conexiones, tamaño).
5. Legales definitivos: aviso de privacidad (LFPDPPP), términos, política de reserva y
   cancelación coherente con reembolsos de Stripe, aviso de cookies si se activa analítica
   con cookies.
6. Runbook (`docs/runbook.md`): webhook fallido → reenviar desde Stripe; reembolso
   manual; agregar/quitar admin; rotar claves; restaurar respaldo; qué hacer si una salida
   se cancela.
7. Lanzamiento: `BOOKINGS_ENABLED=true`, compra real mínima + reembolso, revisar correos,
   revisar `payments` y `booking_events`. Ventana de vigilancia 48 h.

**Salida:** checklist de §9 completo y firmado.

---

## 4. Cambios en base de datos (nuevas migraciones)

| Migración | Objetos |
| --- | --- |
| `guest_checkout` (F3) | `contact_messages(id, name, email, subject, message, status, locale, ip_hash, created_at)`; `notifications(id, booking_id, kind, recipient, provider_id, created_at, unique(booking_id, kind))`; `stripe_events(id text pk, type, received_at, processed_at, payload jsonb)`; `bookings.locale`, `bookings.stripe_checkout_session_id`; `expire_pending_bookings()` + `cron.schedule`; `get_booking_for_guest(text, text)`; `cancel_booking_as_guest(uuid)`; RLS: admin lee/actualiza `contact_messages`, nadie más desde el navegador |
| `payments` (F4) | `confirm_booking_payment(...)`, `record_refund(...)`, `fail_booking_payment(...)`; índice `payments(stripe_payment_intent_id)` ya único; `bookings` gana `paid_at` |
| `admin_operations` (F5) | `operator_payouts`, `site_settings`, `review_invitations`, `departure_templates`; `reviews.customer_id` nullable + `reviewer_name/email`; `review_moderation_queue` con `left join`; `admin_save_tour`, `admin_generate_departures`, `admin_create_booking`; políticas de `storage.objects` para `tour-media` y `payout-receipts` |

Todas con `security definer`, `set search_path = ''`, `revoke ... from public, anon` y
`grant` explícito, siguiendo el patrón de las migraciones existentes. Cada una con su
archivo pgTAP.

## 5. Endpoints del servidor

Públicos (rate limit + `zod`): `POST /api/checkout`, `POST /api/bookings/lookup`,
`GET /api/bookings/:reference`, `POST /api/bookings/:reference/cancel`, `POST /api/contact`,
`GET /api/health`.

Webhooks/jobs (firma o `CRON_SECRET`): `POST /api/webhooks/stripe`, `POST /api/jobs/reminders`,
`POST /api/jobs/review-invitations`.

Admin (`requireAdmin()`): los existentes más los de la tabla de F5.

## 6. Variables de entorno

| Variable | Ámbito | Desde |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | público | existente |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | público | F1 |
| `SUPABASE_SERVICE_ROLE_KEY` | servidor | F3 |
| `BOOKINGS_ENABLED` | servidor | F3 |
| `BOOKING_LINK_SECRET` | servidor | F3 |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | servidor | F3 |
| `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | servidor / público | F3 |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | servidor | F4 |
| `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_BUSINESS_INBOX` | servidor | F6 |
| `CRON_SECRET` | servidor | F6 |
| `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN` | mixto | F8 |
| `NEXT_PUBLIC_ENABLE_DEMO` | público | F5 |

`lib/env.ts` valida todo esto; `.env.example` se actualiza en cada fase.

## 7. Pruebas y CI

- Unitarias (Vitest, opcional): cálculo de totales, resolución de salidas, firma de enlaces.
- pgTAP: una suite por migración; RLS por rol.
- Playwright: reserva completa con Stripe test; login admin y cambio de estado.
- CI: job `quality` (existente) + job `database` (Supabase CLI con Docker: `db reset`,
  `db lint`, `test db`) + job `e2e` en PR contra el preview de Vercel.

## 8. Operación

- Respaldos: PITR en producción; ensayo de restauración trimestral.
- Alertas: Sentry, uptime, Stripe webhooks, Supabase (CPU/disco/conexiones), Resend
  (rebotes).
- Rotación de claves: service role y Stripe anualmente o ante incidente; documentado en
  el runbook.
- Datos personales: retención de `contact_messages` y reservas canceladas definida en el
  aviso de privacidad; endpoint interno de borrado por correo para atender solicitudes ARCO.

## 9. Checklist de go-live

- [ ] Migraciones aplicadas en producción y pgTAP en verde contra staging
- [ ] Primer administrador promovido; MFA activo
- [ ] Catálogo real cargado; salidas generadas al menos 8 semanas adelante
- [ ] `SUPABASE_SERVICE_ROLE_KEY` ausente del bundle cliente (verificado)
- [ ] Webhook live de Stripe recibe y procesa eventos de prueba en vivo
- [ ] Correos de confirmación, expiración y reembolso recibidos en producción
- [ ] Dominio con HTTPS, HSTS, CSP sin errores en consola
- [ ] Sentry recibe un error de prueba; uptime configurado
- [ ] PITR activo; restauración ensayada en staging
- [ ] Aviso de privacidad, términos y política de cancelación publicados
- [ ] Runbook escrito y compartido con el negocio
- [ ] `BOOKINGS_ENABLED=true` tras compra real mínima + reembolso exitoso

## 10. Riesgos y mitigaciones

| Riesgo | Mitigación |
| --- | --- |
| El negocio tarda en entregar contenido (F2) | Empezar F3/F4 con datos de staging; F2 es paralelizable |
| Cuenta Stripe sin USD (D2) | Lanzar en MXN; el esquema ya guarda ambos importes |
| Webhook caído → reservas pagadas sin confirmar | Idempotencia + reenvío desde Stripe + alerta si hay `pending_payment` con `checkout_session_id` y pago exitoso |
| Sobreventa en el último lugar | `create_booking` bloquea la salida con `for update`; probado en F3 |
| Correos de Auth no llegan | SMTP personalizado en F1, no al final |
| Panel genérico (`AdminRecord`) frena el CRUD real | Tipar tours y reservaciones primero; el resto puede seguir genérico |
| Refactor del carrito rompe restauración de `localStorage` | Versionar la clave (`cart.v2`) y migrar o descartar lo viejo |

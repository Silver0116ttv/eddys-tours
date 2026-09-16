# Eddy's Tours

Responsive tour marketplace for Puerto Vallarta, built with Next.js, React, TypeScript,
Tailwind CSS, and a Supabase-ready backend.

## Requirements

- Node.js 24
- pnpm 11.19.0

Node 24 ships with Corepack, which installs the pnpm version pinned in
`package.json`. If your shell does not recognize `pnpm`, enable it once and reopen the
terminal:

```bash
corepack enable pnpm
```

## Local development

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000`.

Copy `.env.example` to `.env.local`. The storefront continues to use the bundled catalog
until both public Supabase values are present.

## Frontend terminado y demostración

El catálogo de muestra contiene **ocho tours, uno por categoría**. La fuente es
`lib/data/fallback-catalog.ts`; no es inventario real. Las vistas públicas incluyen
catálogo con filtros, detalle y galería, favoritos, itinerario de varios tours,
solicitud en tres pasos, consulta de solicitudes, destinos, categorías, información,
ayuda, contacto y políticas. Incluyen español e inglés y precios en MXN y USD.

El acceso del personal está en `/admin/login`. Las rutas `/admin` requieren una
sesión con rol administrador. `/admin/demo` es un espacio separado de datos
ficticios para probar resumen, tours, reservaciones, calendario, cobros, pagos a
operadores, contactos, operadores, reseñas y configuración sin configurar Supabase.
El editor de tours incluye contenido, precios, fotos de muestra, salidas y vista previa.

En demostración, solicitudes, mensajes y cambios administrativos se guardan en el
navegador. Una solicitud de `/checkout` aparece en reservaciones del panel de
demostración del mismo navegador y puede consultarse en `/my-bookings` con su
referencia y correo. No se envían correos ni se reserva inventario ni se hacen cargos.
La consulta local de solicitudes sirve para probar la interfaz, no como autenticación.

La siguiente etapa es la integración de datos y servicios reales:

- Sustituir `lib/demo-requests.ts` por creación y consulta autorizada de solicitudes,
  contactos y reservas en servidor, con precios y disponibilidad validados allí.
- Conectar las operaciones completas de `components/admin/workspace.tsx` y
  `tour-editor.tsx` con el catálogo, almacenamiento de imágenes, operadores, pagos
  y configuración persistente. Las operaciones reales existentes están limitadas
  a los endpoints documentados abajo; el resto está disponible en demostración.
- Configurar Supabase Auth y recuperación de contraseña, y verificar los roles y
  permisos con cuentas reales. Conectar proveedores de cobro y correo cuando se
  active la operación comercial.
- Reemplazar los ejemplos y revisar textos comerciales, precios y disponibilidad.
  El seed histórico de Supabase aún no refleja la selección nueva de un tour por
  categoría; revisarlo antes de cargar la base de datos.

Con la aplicación iniciada, `pnpm check:frontend` comprueba rutas públicas,
categorías y protección del área administrativa. Puede usarse otro servidor con
la variable `FRONTEND_TEST_URL`. Los controles de código son `pnpm check`.

## Supabase backend

The versioned backend is in `supabase/` and includes:

- customers, operators, and administrator roles
- tours, media, public prices, departures, and inventory holds
- bookings, booking items, payments, verified reviews, and favorites
- private provider costs and audit logs
- Row Level Security policies for every table exposed through the Data API
- atomic booking creation with server-calculated prices and expiring inventory holds
- English and Mexican Spanish tour content managed from the same catalog
- protected operational views for bookings, tours, reviews, and administrator metrics

The storefront reads live remaining capacity through the database instead of displaying
raw departure capacity. When Supabase is not configured, the public site continues to use
its bundled demonstration catalog.

### Administrator data API

Administrator views should use these authenticated same-origin endpoints instead of
querying sensitive tables from the browser:

- `GET /api/admin/dashboard`
- `GET /api/admin/bookings?page=1&pageSize=25&status=confirmed&search=REFERENCE`
- `GET /api/admin/tours?page=1&pageSize=25&search=TITLE`
- `GET /api/admin/reviews?page=1&pageSize=25&status=pending&search=TOUR`
- `PATCH /api/admin/bookings/:id` with `{ "status": "confirmed", "note": "..." }`
- `PATCH /api/admin/tours/:id` with `{ "published": true, "featured": false, "popular": true }`
- `PATCH /api/admin/reviews/:id` with `{ "status": "published" }`

All four endpoints require a valid Supabase session whose `profiles.role` is `admin`.
The underlying operational views use `security_invoker`, so Row Level Security remains
active even when a panel reads a combined dataset.

Local Supabase requires Docker Desktop. Once Docker is running:

```bash
pnpm supabase:start
pnpm supabase:reset
```

Copy the local API URL and publishable key printed by Supabase into `.env.local`, then
restart `pnpm dev`. Regenerate TypeScript types after schema changes with:

```bash
pnpm supabase:types
```

Validate the schema and its access rules with:

```bash
pnpm supabase:lint
pnpm supabase:test
```

To connect a new hosted project, authenticate and link it first, review the target, and
then push the versioned migration:

```bash
pnpm dlx supabase login
pnpm dlx supabase link --project-ref YOUR_PROJECT_REF
pnpm dlx supabase db push
```

After the first administrator signs up, promote that account once from the Supabase SQL
Editor. Replace the example email before running it:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'admin@example.com');
```

Subsequent role changes should call the protected `set_profile_role` database function
from an authenticated administrator session.

The seed file contains an earlier eight-tour demo catalog and sample departures. Apply it
only after reviewing the dates and replacing them with real operator availability. Add the
two public Supabase variables to Vercel after the hosted database is ready. The service-role
key must remain server-only and is not required for public catalog reads. Production keeps
serving fallback data until `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are configured in Vercel.

## Quality checks

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Run all checks with:

```bash
pnpm check
```

## Images

Source PNG files in `public/images` are kept locally and ignored by Git. Generate the deployable WebP assets with:

```bash
pnpm optimize:images
```

Generated UI components are committed to the repository, so the `shadcn` CLI is not a runtime dependency. Use `pnpm dlx shadcn@latest` only when adding or updating generated components.

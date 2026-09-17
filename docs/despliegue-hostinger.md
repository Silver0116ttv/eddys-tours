# Despliegue en Hostinger y lanzamiento — Eddy's Tours

Fecha: 2026-09-17. Punto de partida: commit `55ef445` en `main`, repositorio local y GitHub
sincronizados, `pnpm build` en verde (≈15 s con Node 24.14 y pnpm 11.19).

Esta guía sustituye, para hosting, las referencias a Vercel de `plan-produccion.md` (§F8).
Todo lo demás del plan (Supabase, Stripe, correos) sigue igual.

---

## 0. Hechos verificados antes de escribir la guía

| Hecho | Detalle | Consecuencia |
| --- | --- | --- |
| La app necesita un servidor Node | `next build` marca como dinámicas `/tours`, `/tours/[slug]`, `/admin/*` y 7 endpoints `/api/admin/*`, y activa el Proxy (middleware) de Supabase | No sirve el hosting web compartido "normal" (PHP/estático) ni `output: 'export'`. Hay que usar **Node.js Web Apps** de Hostinger |
| El negocio **ya tiene dominio** | `eddystourspv.com`: registrado vía Wix el 2025-06-12, vence 2027-06-12, DNS en `ns12/ns13.wixdns.net`, sitio Wix en inglés con `/`, `/about`, `/contact`, `/book-online`. **Sin registros MX** → no hay correo con dominio; el contacto público es un Gmail personal | No comprar un dominio nuevo "desde cero": migrar este. Planear redirecciones 301 y correo con dominio |
| `eddystours.com` es de **otra empresa** | Registrado desde 1998 (Network Solutions); agencia hispanohablante de cruceros y paquetes | Nunca estará disponible. Hay colisión de marca: firmar siempre como **"Eddy's Tours Puerto Vallarta"** |
| `eddytours.com` está en reventa (HugeDomains); `eddystours.net` registrado (GoDaddy, vence 2026-12-27) | — | No pagar precio de reventa |
| **Disponibles hoy** | `eddystours.mx`, `eddystours.com.mx`, `eddystoursvallarta.com`, `eddystoursvallarta.mx`, `eddystourspv.mx`, `eddystours.travel`, `eddystours.tours`, `eddystours.co` | Registrar los defensivos que se decidan (§2.2) |
| El código usaba `hola@eddystours.mx` en 19 sitios | …y **nadie ha registrado `eddystours.mx`** | Decisión tomada: el correo es **`hola@eddystourspv.com`** y ya está centralizado en `lib/site.ts` (§3.2). Registrar igualmente el `.mx` como defensivo |
| `@vercel/analytics` en `app/layout.tsx` | Solo funciona en Vercel; en Hostinger daba 404 | Sustituido por GA4 (§3.1) |
| `NEXT_PUBLIC_SITE_URL` vacío → `http://localhost:3000` | `lib/site.ts` | Definirla en Hostinger es **obligatorio**: canonical, `robots.txt`, `sitemap.xml` y Open Graph dependen de ella |
| No había imagen Open Graph | — | Generada en `app/opengraph-image.jpg` (§3.4) |
| Checkout en modo demostración | `components/travel/trip.tsx` guarda en `localStorage` y no envía nada | Puente implementado: botones "Enviar por WhatsApp / correo" con el itinerario prellenado (§3.6) |
| El sitio Wix actual lleva `noindex` | `<meta name="robots" content="noindex">` e `indexSite: false` en su configuración | Google nunca lo indexó: no hay posicionamiento que heredar. El valor del dominio es su antigüedad y lo impreso; las redirecciones 301 siguen siendo correctas pero no urgentes |
| Contacto real (tomado del footer del Wix) | Tel./WhatsApp `+52 322 151 7643`, Facebook `facebook.com/cazanova70`; correo público era un Gmail personal | Ya cargado en `lib/site.ts`; el Gmail no se usa en el sitio nuevo |
| Imágenes | Solo `.webp` en git; los `.png` están ignorados y ningún código los referencia | Desplegar desde GitHub funciona sin pasos extra |
| Placeholders de contacto | `lib/data/admin-workspace.ts:106` tiene `+52 000 000 0000`; hay `placeholder-logo.*` en `public/` | Sustituir por datos y logo reales (§3.5) |

---

## 1. Qué contratar en Hostinger (y qué no)

> El plan ya está contratado. Esta sección queda como referencia de **qué producto usar
> dentro de hPanel** (Web Apps / Node.js) y de cuándo convendría subir de plan.

### 1.1 Producto correcto: "Web Apps hosting" (Node.js)

Hostinger despliega apps Node desde GitHub, detecta Next.js, ejecuta el build y mantiene el
proceso vivo. Está incluido en los planes **Business Web Hosting** (en la web de hoy aparece
como **"Unlimited"**) y en **Cloud Startup / Professional / Enterprise**. Node disponible:
18, 20, 22 y **24** (el que pide `package.json`). Detecta pnpm por `pnpm-lock.yaml`.

| | Business / "Unlimited" | Cloud Startup |
| --- | --- | --- |
| Precio visto hoy | ≈ USD 3.99/mes en promoción (48 meses), renueva ≈ 16.99 | ≈ USD 7.99/mes (48 meses), renueva ≈ 25.99 |
| Recursos | ≈ 3 GB RAM, 2 núcleos (según Hostinger), 5 web apps | 4 GB RAM, 4 núcleos, 10 web apps, **IP dedicada**, soporte prioritario |
| Incluye | Dominio 1 año, SSL gestionado, CDN, correo 1 año (buzones ilimitados), backups diarios, WAF/DDoS | Lo mismo |

**Recomendación: Cloud Startup.** Motivos: `next build` de Next 16 + TypeScript cabe en 3 GB
pero sin margen; la IP dedicada ayuda a la reputación del correo y a futuras listas blancas
(Stripe/Supabase); y el negocio va a vender en línea, no es un folleto. Si el presupuesto
manda, "Unlimited" arranca bien y se sube de plan sin migrar.

Sobre el plazo: la promoción exige prepago largo. Contratar 48 meses solo si está claro que el
negocio seguirá ahí; a 12 o 24 meses el precio mensual sube pero el compromiso es menor.
Comprobar precios en el checkout: cambian cada mes.

### 1.2 Lo que NO hay que contratar

- **Single / Premium**: no tienen Node.js.
- **VPS**: funciona, pero administras Nginx, PM2, parches y firewall. Solo si el plan
  gestionado se queda corto (no es el caso).
- **Website Builder / Horizons**: son constructores, no sirven para este código.
- **Dominio nuevo "principal"**: el `.com` ya existe en Wix (§2).

### 1.3 Dominio gratis del plan

Suele cubrir `.com/.net/.org` y similares; el `.mx` normalmente **no** entra en la promoción.
Usar el dominio gratis para `eddystoursvallarta.com` (defensivo, §2.2). El `.mx` se compra
aparte (Hostinger lo vende; si no, Akky/NIC México o GoDaddy MX, ≈ MXN 300–450/año).

---

## 2. Dominio y marca

### 2.1 Decisión: `eddystourspv.com` sigue siendo el dominio principal

- Ya tiene 15 meses de antigüedad, está en Google, en redes y probablemente impreso.
- "PV" es la abreviatura que usa el turista de EE. UU. y Canadá (mercado principal de
  Vallarta) y el `.com` es lo que ese turista teclea por defecto.
- Diferencia del `eddystours.com` ajeno.

**Canónico: `https://www.eddystourspv.com` (con www).** Wix publica hoy `og:url` con `www`, así
que conservar `www` mantiene las señales existentes. El apex (`eddystourspv.com`) redirige 301
al `www`. Por tanto: `NEXT_PUBLIC_SITE_URL=https://www.eddystourspv.com`.

### 2.2 Dominios defensivos (todos redirigen 301 al principal, conservando la ruta)

| Dominio | Acción | Por qué |
| --- | --- | --- |
| `eddystours.mx` | **Registrar hoy** (≈ MXN 300–450/año) | Es el nombre "natural" de la marca en México; evita que un tercero lo tome y redirige al principal |
| `eddystoursvallarta.com` | Registrar con el dominio gratis del plan | Es lo que teclea quien recuerda "Eddy's Tours Vallarta"; protege la marca |
| `eddystours.com.mx` | Opcional | Bajo tráfico; solo si sobra presupuesto |
| `eddytours.com`, `.net`, `.travel`, `.tours` | **No** | Reventa cara o TLD que nadie teclea |

Regla: **un solo dominio indexable**. Los demás nunca sirven contenido; solo redirigen.

### 2.3 Si algún día se cambia de nombre (criterios)

Corto; sin guiones; sin apóstrofo (no existe en DNS: "eddystours", nunca "eddy's"); fácil de
dictar por teléfono y WhatsApp; con "Vallarta" o "PV" para distinguirse de `eddystours.com`;
`.com` primero y `.mx` defensivo; comprobar antes que los handles `@eddystourspv` están libres
o son propios en Instagram, Facebook y TikTok; y buscar la marca en el **IMPI** (clase 39,
servicios de turismo) porque ya hay otro "Eddy's Tours" operando: registrar la marca en México
cuesta ≈ MXN 3,000 y evita disputas futuras.

### 2.4 Correo con dominio (imprescindible antes de lanzar)

Hoy no hay MX en el dominio y el sitio Wix muestra un Gmail personal: resta confianza y
complica Google Business y los correos transaccionales (plan §F6).

1. Dominio del correo (decidido): **`@eddystourspv.com`**. Es el valor de
   `siteConfig.email` en `lib/site.ts`.
2. Crear en hPanel → Correo: `hola@` (contacto), `reservas@` (transaccional/Resend más
   adelante) y un alias `admin@` para altas en servicios. Hostinger Email es gratis 1 año;
   después ≈ USD 1/buzón/mes. Google Workspace (≈ USD 7/usuario/mes) si prefieren Gmail.
3. Hostinger genera MX, SPF y DKIM si el DNS está en Hostinger (§6, opción B). Añadir DMARC:
   `_dmarc TXT "v=DMARC1; p=quarantine; rua=mailto:admin@eddystourspv.com"`.
4. Actualizar el código (§3.2) y la firma/perfiles.

---

## 3. Cambios de código antes de subir

Estado: **hechos en la rama `hostinger-launch`** (2026-09-17), con `pnpm lint`, `typecheck`,
`build` y `check:frontend` en verde. Queda pendiente lo marcado como "falta".

### 3.1 Vercel Analytics → Google Analytics 4 (hecho)

`@vercel/analytics` se retiró; `app/layout.tsx` monta `<GoogleAnalytics>` de
`@next/third-parties` solo si existe `NEXT_PUBLIC_GA_ID`. Los textos de privacidad ya dicen
"Google Analytics". **Falta:** crear la propiedad GA4 y poner el `G-…` en Hostinger (§5.3).

### 3.2 Contacto centralizado en `lib/site.ts` (hecho)

`siteConfig.email = 'heribertoestrella25@gmail.com'` (el Gmail que ya usa Eddy; cuando exista
`hola@eddystourspv.com`, cambiar esa única línea), `phone = '+52 322 151 7643'`,
`whatsapp = '523221517643'` y `facebook`. Footer (iconos de WhatsApp y Facebook, teléfono),
página de contacto (bloque WhatsApp / Teléfono), políticas, página de error, panel y checkout
usan `mailtoUrl()` / `whatsappUrl()`. Si algún día el enlace `wa.me` no abriera el chat,
probar la forma antigua de móvil mexicano `5213221517643`.

### 3.3 Redirecciones en `next.config.mjs` (hecho)

`eddystourspv.com/*` → `https://www.eddystourspv.com/*` (308) y `/book-online` → `/tours`.
`/about` y `/contact` existen con la misma ruta y no necesitan redirección. Los dominios
defensivos se redirigen desde el panel de Hostinger (§6.4), no aquí.

### 3.4 Imagen Open Graph (hecho)

`scripts/og-image.mjs` genera `app/opengraph-image.jpg` (1200×630, 67 KB) a partir de
`public/images/story-sunset-v2.webp` con el nombre y el dominio; `pnpm og:image` la regenera.
**Falta:** cuando haya una foto real de un tour, cambiar la ruta de origen en el script y
volver a generarla. Probar tras el deploy con https://developers.facebook.com/tools/debug/ y
enviando el enlace por WhatsApp.

### 3.5 Datos reales (falta)

- Logo real en `components/logo.tsx` y borrar `public/placeholder-*` si no se usan.
- Dirección y horario reales (el número ya está).
- Textos de `/privacy` y `/booking-policy` revisados por el negocio (§9).
- Fotos: sustituir las generadas por fotos propias en cuanto existan; los tours se venden con
  fotos reales de la lancha, el guía y el grupo, y Google Business exige fotos propias.

### 3.6 Puente comercial hasta el checkout real (hecho; plan §F3–F4 sigue pendiente)

El paso 3 del checkout guarda la solicitud en el navegador (referencia `DEMO-…`) y ofrece
**"Enviar por WhatsApp"** (principal, si hay número) y **"Enviar por correo"**, ambos con el
itinerario completo prellenado: referencia, datos del viajero, tours, fechas, personas,
total y anticipo. El texto deja claro que la reserva se confirma por respuesta del equipo y
que no hay cobro. Es como se cierran hoy las ventas en Vallarta y no requiere backend.

### 3.7 Detalles menores

- `Strict-Transport-Security` ya lleva `preload`; **no** enviar el dominio a hstspreload.org
  hasta que todos los subdominios (webmail, etc.) sirvan HTTPS.
- `README.md` y `plan-produccion.md` ya remiten a Hostinger (hecho).
- Flujo de ramas: Hostinger redespliega **cada push a la rama conectada**. Conectar `main` y
  trabajar siempre en ramas + PR; nunca commitear directo a `main`.

---

## 4. Supabase: qué hace falta para producción

Sin variables de Supabase, la tienda usa el catálogo de muestra y `/admin/login` no puede
iniciar sesión (los `/api/admin/*` responden 503). Se puede lanzar así como escaparate
(§3.6 opción 1) y activar Supabase después sin tocar el hosting.

Cuando se cree el proyecto en supabase.com (plan §F1):

1. `pnpm dlx supabase link --project-ref …` y `pnpm dlx supabase db push`.
2. Authentication → URL Configuration: `Site URL = https://www.eddystourspv.com`;
   `Redirect URLs` = `https://www.eddystourspv.com/**` y el subdominio temporal de Hostinger
   mientras se prueba. Sin esto, el enlace de recuperación de contraseña de `/admin` no vuelve.
3. Copiar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` a Hostinger (§5.3)
   y **redesplegar** (son variables de build).
4. Promover al primer administrador con el SQL del `README.md`.
5. `SUPABASE_SERVICE_ROLE_KEY` **no** se configura todavía: ningún código la usa. Añadirla solo
   cuando exista el endpoint que la necesite.

Hostinger tiene un "asistente de conexión" para Supabase en la pantalla de variables; es solo
un atajo para pegar las mismas dos variables.

---

## 5. Despliegue paso a paso en hPanel

### 5.1 Antes de tocar Hostinger

- [ ] §3 hecho y en `main`; `pnpm check` en verde.
- [ ] Activar 2FA en Hostinger, GitHub y Google (todo el negocio cuelga de esas tres cuentas).
- [ ] Guardar contraseñas en un gestor compartido con el dueño del negocio.

### 5.2 Crear la web app

1. hPanel → **Websites → Add website → Deploy web app** (Node.js).
2. **Import Git repository** → autorizar GitHub (cuenta `Silver0116ttv`) y dar acceso al
   repositorio; elegir rama `main`.
3. Revisar la detección: Framework **Next.js**, Node **24.x**, gestor **pnpm** (por
   `pnpm-lock.yaml`), build **`pnpm build`**, output **`.next`**. No hace falta "entry file":
   el preset de Next.js ejecuta `next start`, que respeta el `PORT` que inyecta Hostinger.
4. Todavía **no** conectar el dominio real: dejar el subdominio temporal
   `*.hostingersite.com` para probar.

### 5.3 Variables de entorno (pantalla "Environment variables")

| Variable | Valor | Cuándo |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://www.eddystourspv.com` (en la prueba: la URL temporal) | Siempre. **Build-time**: cambiarla exige redesplegar |
| `NEXT_PUBLIC_GA_ID` | `G-…` | Tras §3.1 y crear la propiedad GA4 |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` | Cuando exista Supabase producción |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` | Ídem |
| `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_*` | — | **No** todavía |
| `NODE_ENV`, `PORT` | los pone Hostinger | No tocar |

Nunca pegar secretos en el repositorio ni en el chat de soporte.

### 5.4 Primer deploy y verificación

1. Deploy → esperar el build (unos minutos: instala, compila, arranca) → leer el log.
2. Desde tu máquina:

```bash
FRONTEND_TEST_URL=https://<temporal>.hostingersite.com corepack pnpm check:frontend
```

   Comprueba 27 rutas públicas, las 8 categorías y que `/admin/*` y `/api/admin/*` rechazan
   anónimos.
3. A mano: cambiar idioma ES/EN, moneda MXN/USD, abrir un tour, favoritos, itinerario, el
   puente de WhatsApp (§3.6), `/admin/login`, `/robots.txt`, `/sitemap.xml`, página 404.
4. Revisar en el navegador que no hay errores en consola ni recursos 404 (p. ej. el script de
   Vercel si §3.1 quedó pendiente).

### 5.5 Problemas típicos

| Síntoma | Causa | Arreglo |
| --- | --- | --- |
| Build muere sin error claro | Memoria | Variable `NODE_OPTIONS=--max-old-space-size=2560`; si persiste, subir a Cloud Startup |
| "pnpm not found" / usa npm | No detectó el lockfile | Build command: `npx pnpm@11 install --frozen-lockfile && npx pnpm@11 build` |
| Build falla descargando fuentes | `next/font/google` necesita red en el build | Reintentar; si el entorno bloquea red, pasar las dos fuentes a `next/font/local` |
| 403 tras redesplegar | Hostinger regenera `.htaccess` | Redesplegar; no editar `.htaccess` a mano |
| App arranca y cae | Falta variable o puerto | Revisar log; no fijar `PORT` a mano |
| Canonical/sitemap apuntan a localhost | Falta `NEXT_PUBLIC_SITE_URL` | Definirla y redesplegar |
| `/admin/login` devuelve 503 | Sin Supabase | Esperado hasta §4 |

---

## 6. Conectar `eddystourspv.com` sin caída (Wix → Hostinger)

### 6.1 Preparación (24–48 h antes)

- [ ] Exportar del sitio Wix todo lo aprovechable: textos, fotos originales, reseñas, lista de
  tours y precios, y hacer capturas de cada página.
- [ ] En Wix → Dominios → DNS: bajar el TTL de los registros `A` y `CNAME` a **300 s** (así el
  cambio propaga en minutos, no en horas).
- [ ] Confirmar acceso al correo del titular del dominio en Wix (recibe las confirmaciones).
- [ ] Sitio nuevo verificado en el subdominio temporal (§5.4).

### 6.2 Elegir cómo apuntar el dominio

**Opción B — mover los nameservers a Hostinger (recomendada).** DNS, SSL, correo y
verificaciones quedan en un solo panel y Hostinger genera MX/SPF/DKIM solo.
En Wix → Dominios → `eddystourspv.com` → Avanzado → Nameservers: poner los que muestre
hPanel (habitualmente `ns1.dns-parking.com` y `ns2.dns-parking.com`). Wix avisará de que el
sitio Wix se desconecta: es lo que queremos.

**Opción A — dejar el DNS en Wix y cambiar registros.** Solo si por alguna razón no se quieren
mover nameservers: en Wix, sustituir los `A` de `@` por la IP que indique hPanel, cambiar el
`CNAME www` a lo que indique hPanel, y añadir a mano los MX/TXT del correo.

### 6.3 Conectar en Hostinger

1. hPanel → la web app → **Domain → Connect domain** → `eddystourspv.com` (incluye `www`).
   Si el dominio se había añadido antes como "website" normal, hay que eliminarlo de ahí
   primero (limitación documentada por Hostinger).
2. Esperar propagación (con TTL 300 s, minutos; verificar con `nslookup www.eddystourspv.com`
   o https://dnschecker.org).
3. SSL: Hostinger emite el certificado solo al detectar el DNS; forzar HTTPS en el panel.
4. Cambiar `NEXT_PUBLIC_SITE_URL` al dominio definitivo y **redesplegar**.
5. Volver a correr `check:frontend` contra `https://www.eddystourspv.com` y comprobar que
   `http://eddystourspv.com/book-online` acaba en `https://www.eddystourspv.com/tours` (301).

### 6.4 Dominios defensivos

En hPanel → Dominios → cada defensivo → **Redirección** 301 a `https://www.eddystourspv.com`
(conservando ruta). No añadirlos como "websites".

### 6.5 Después: transferir el dominio de Wix a Hostinger (opcional, semana 2–3)

Consolida la facturación y evita depender de Wix. El dominio cumple los requisitos (más de 60
días registrado, sin transferencias recientes).

1. Wix → Dominios → Avanzado → **Transferir fuera de Wix** → desbloquear y pedir el código
   EPP/auth (llega al correo del titular).
2. Hostinger → Dominios → **Transferir dominio** → pegar el código y pagar (≈ USD 10–15; suma un
   año a la fecha de vencimiento).
3. Aprobar el correo de confirmación; tarda 5–7 días. El DNS no cambia si ya está en Hostinger.
4. Solo entonces cancelar el plan Premium de Wix. **No** cancelar la suscripción del dominio en
   Wix antes de que la transferencia termine.

---

## 7. Lista de verificación de salida a producción

- [ ] `https://www.eddystourspv.com` carga con candado; `http://` y apex redirigen 301.
- [ ] `view-source:` → `<link rel="canonical">`, `og:url`, `og:image` con el dominio real.
- [ ] `/robots.txt` apunta a `https://www.eddystourspv.com/sitemap.xml`.
- [ ] Prueba en móvil real (iOS y Android): menú, idioma, moneda, WhatsApp.
- [ ] PageSpeed Insights móvil ≥ 85 en portada y un tour; corregir imágenes si no.
- [ ] Enlace enviado por WhatsApp muestra foto y título.
- [ ] Correo `hola@` recibe y envía (probar a Gmail y a Outlook; revisar carpeta de spam).
- [ ] GA4 registra la visita en tiempo real.
- [ ] UptimeRobot (gratis) vigilando `https://www.eddystourspv.com` cada 5 min con alerta por
  correo/Telegram.
- [ ] Backup: Hostinger diario (comprobar que aparece en el panel); Supabase cuando exista.

---

## 8. Marketing de lanzamiento (semana 1)

### 8.1 Google (donde está la demanda de "puerto vallarta tours")

1. **Search Console**: verificar por DNS (TXT en Hostinger, cubre todos los subdominios),
   enviar `sitemap.xml`, revisar "Cobertura" a los 3–4 días. Al ser el mismo dominio no hace
   falta "Cambio de dirección"; sí revisar que las URL antiguas devuelven 301.
2. **Google Business Profile**: reclamar/crear "Eddy's Tours Puerto Vallarta", categoría
   principal "Tour operator" (secundarias: "Boat tour agency", "Fishing charter"), web
   `https://www.eddystourspv.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp`,
   WhatsApp, horario, fotos reales, y publicar cada semana. Generar el enlace corto de reseñas y
   ponerlo en un QR para entregar al final de cada tour: las reseñas son el factor nº 1 del
   mapa local.
3. **Bing Webmaster Tools**: importar desde Search Console (2 min; tráfico de EE. UU.).
4. **Datos estructurados** (siguiente sprint): JSON-LD `LocalBusiness` en el layout y
   `Product`/`TouristTrip` con precio y reseñas en `/tours/[slug]`; habilita precios y
   estrellas en el resultado de Google.
5. **Idiomas**: hoy el cambio ES/EN es en cliente con `lang="en"` fijo, así que Google indexa
   solo inglés. Para posicionar en español hacen falta rutas `/es/...` con `hreflang`; anotarlo
   como fase posterior, no bloquea el lanzamiento (el turista principal busca en inglés).

### 8.2 Redes y WhatsApp

- Alinear handles `@eddystourspv` en Instagram, Facebook y TikTok; poner la URL nueva en las
  bios y fijar un post "nueva web".
- **WhatsApp Business** (no el personal): catálogo con los 8 tours, respuestas rápidas
  (precio, punto de encuentro, política de cancelación), horario, mensaje de ausencia, y el
  enlace `wa.me` que usa el sitio (§3.6).
- Instalar Meta Pixel solo cuando se vaya a pagar publicidad; hasta entonces GA4 basta.

### 8.3 Distribución y reseñas

- **TripAdvisor** (ficha gratuita) y, si se quiere volumen, **Viator/GetYourGuide** (comisión
  20–30 %): sirven para captar al turista que no conoce la marca; la web propia es donde se
  reserva sin comisión. Incentivo de reserva directa (p. ej. 10 % o traslado gratis).
- Pedir reseña en Google al terminar el tour (QR) y responder a todas.

### 8.4 Contenido y temporadas

- Alta temporada nov–abr; ballenas dic–mar; spring break marzo. Publicar el contenido de
  ballenas en octubre, no en diciembre.
- Dos artículos al mes en inglés ("best things to do in Puerto Vallarta", "Marietas Islands
  guide"...) enlazando a los tours: es el SEO que sí mueve reservas.
- Fotos y video vertical reales de cada tour para IG/TikTok; el catálogo generado no sirve
  para anuncios.

### 8.5 Publicidad de pago (después del mes 1)

"Puerto Vallarta tours" en Google Ads es caro (competencia de OTAs). Empezar por GBP + SEO +
video orgánico; después remarketing en Meta a quien visitó un tour sin escribir. Nunca antes
de tener reseñas y el checkout/WhatsApp funcionando.

---

## 9. Legal y regulatorio (México)

- **Aviso de Privacidad** (LFPDPPP): `/privacy` debe nombrar al responsable (razón social o
  persona física) y su domicilio, los datos que se recaban, finalidades, derechos ARCO y
  correo para ejercerlos, y las transferencias (Supabase/EE. UU., Stripe, Google Analytics).
  Versión corta en el formulario/WhatsApp y completa en la página.
- **Términos y política de cancelación**: `/booking-policy` existe; que el negocio la firme
  (plazos, reembolsos, clima, no-show).
- **Precios**: en MXN con impuestos incluidos y visibles (Profeco). El selector USD es
  referencial; decirlo.
- **Registro Nacional de Turismo (RNT)**: obligatorio para prestadores de servicios turísticos
  (Ley General de Turismo). Verificar que el negocio está inscrito y mostrar el número en el
  pie de página: da confianza y lo piden las OTAs.
- **Seguro de responsabilidad civil** y, para lanchas, permisos de la capitanía: no es web,
  pero aparece en las reseñas y en las OTAs.
- **Facturación (CFDI)**: si un cliente mexicano la pide, tener el proceso; enlazarlo en ayuda.
- Marca en el **IMPI** (§2.3).

---

## 10. Operación y costos

| Concepto | Costo aproximado | Renovación / dueño |
| --- | --- | --- |
| Hostinger Cloud Startup | USD 7.99/mes promo (≈ 25.99 al renovar) | Fecha de contratación |
| `eddystourspv.com` (Wix hoy) | ≈ USD 20/año | **2027-06-12** |
| `eddystours.mx` | ≈ MXN 300–450/año | Fecha de registro |
| `eddystoursvallarta.com` | gratis 1 año, luego ≈ USD 15/año | Fecha del plan |
| Correo Hostinger | gratis 1 año, luego ≈ USD 1/buzón/mes | Fecha del plan |
| Supabase | gratis → Pro USD 25/mes cuando haya reservas reales | Plan §F1 |
| GA4, Search Console, GBP, UptimeRobot | gratis | — |

- Poner **las renovaciones en un calendario** con aviso 30 días antes: un dominio caducado
  tumba web y correo a la vez.
- El titular de dominios, hosting, Google y GitHub debe ser el **negocio** (correo
  `admin@eddystourspv.com`), no una cuenta personal del desarrollador; el desarrollador entra
  como usuario adicional.
- Backups: Hostinger diario; probar una restauración una vez. Los datos reales vivirán en
  Supabase, cuyos backups dependen del plan.
- Monitoreo: UptimeRobot ahora; Sentry cuando haya checkout real (plan §F8).

---

## 11. Cronograma sugerido

| Día | Tareas |
| --- | --- |
| 1 | 2FA en Hostinger; registrar `eddystours.mx`; dominio gratis `eddystoursvallarta.com`; crear `hola@`/`reservas@` y entregar el acceso a Eddy; fusionar `hostinger-launch` en `main` |
| 2 | Deploy al subdominio temporal (§5); `check:frontend`; pruebas móviles; bajar TTL en Wix |
| 3 | Cambiar nameservers (§6.2 B); conectar dominio; SSL; `NEXT_PUBLIC_SITE_URL` definitivo; redespliegue; verificación §7 |
| 4 | Search Console, GA4, Bing, Google Business, redes, WhatsApp Business (§8) |
| 5–7 | Reseñas/QR, TripAdvisor, revisar Search Console; corregir lo que salga |
| Semana 2–3 | Supabase producción (§4, plan §F1–F2); transferir dominio fuera de Wix (§6.5); cancelar plan de sitio Wix |
| Después | Plan §F3 en adelante (checkout, Stripe, correos), JSON-LD, rutas `/es` con `hreflang` |

---

Fuentes consultadas el 2026-09-17: [Creating a Node.js App — Hostinger Docs](https://docs.hostinger.com/node.js/creating-an-app),
[How to add a Node.js web app in Hostinger](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/),
[Next.js Hosting — Hostinger](https://www.hostinger.com/web-apps-hosting/nextjs-hosting),
[Web Apps Hosting — Hostinger](https://www.hostinger.com/web-apps-hosting),
[Which Hostinger plan do you need for a Next.js app?](https://wacrm.tech/blog/hostinger-plan-for-nextjs),
RDAP (`rdap.org`) y whois de NIC México (`whois.mx`) para la disponibilidad de dominios.

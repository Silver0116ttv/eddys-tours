'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  LoaderCircle,
  ShieldCheck,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/logo'

export function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [reset, setReset] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  return (
    <main id="main" className="grid min-h-svh lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-ocean-deep lg:block">
        <Image
          src="/images/dest-puerto-vallarta.webp"
          alt="La costa de Puerto Vallarta"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#123844] via-[#123844]/30 to-[#123844]/20" />
        <div className="absolute inset-0 flex flex-col justify-between p-14">
          <Link href="/">
            <Logo tone="light" />
          </Link>
          <div className="max-w-lg text-white">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm">
              <MapPinIcon />
              Puerto Vallarta, México
            </span>
            <h1 className="text-6xl font-bold leading-[1.04] tracking-tight">
              Detrás de cada gran aventura.
            </h1>
            <p className="mt-6 max-w-sm text-lg leading-8 text-white/80">
              Tu equipo, tus experiencias y todo lo que hace posible un viaje
              inolvidable.
            </p>
          </div>
          <p className="text-sm text-white/60">
            Eddy’s Tours · Espacio de trabajo
          </p>
        </div>
      </section>
      <section className="flex flex-col px-6 py-8 sm:px-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver al sitio
        </Link>
        <div className="mx-auto my-auto w-full max-w-[400px] py-16">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <div className="mb-6 grid size-12 place-items-center rounded-2xl bg-ocean/10 text-ocean">
            <LockKeyhole className="size-6" />
          </div>
          <h2 className="text-4xl font-bold tracking-tight">
            {reset ? 'Recupera tu acceso' : 'Bienvenido de vuelta.'}
          </h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            {reset
              ? 'Te enviaremos un enlace para crear una nueva contraseña.'
              : 'Ingresa a tu cuenta para gestionar las experiencias de Eddy’s Tours.'}
          </p>
          <form
            className="mt-8 space-y-5"
            onSubmit={async (e) => {
              e.preventDefault()
              setMessage('')
              if (!configured) {
                setMessage(
                  'El acceso del equipo aún no está habilitado. Puedes explorar el diseño con datos de demostración.',
                )
                return
              }
              setBusy(true)
              const data = new FormData(e.currentTarget)
              try {
                const supabase = createClient()
                if (reset) {
                  const { error } = await supabase.auth.resetPasswordForEmail(
                    String(data.get('email')),
                    {
                      redirectTo: `${window.location.origin}/admin/reset-password`,
                    },
                  )
                  if (error) throw error
                  setMessage(
                    'Si existe una cuenta con ese correo, recibirás las instrucciones de recuperación.',
                  )
                } else {
                  const { error } = await supabase.auth.signInWithPassword({
                    email: String(data.get('email')),
                    password: String(data.get('password')),
                  })
                  if (error) {
                    setMessage(
                      'No pudimos iniciar sesión. Revisa tu correo y contraseña.',
                    )
                    return
                  }
                  router.replace('/admin/overview')
                  router.refresh()
                }
              } catch {
                setMessage(
                  'No pudimos conectar con el servicio de acceso. Intenta de nuevo.',
                )
              } finally {
                setBusy(false)
              }
            }}
          >
            <label className="field">
              Correo electrónico
              <input
                type="email"
                name="email"
                required
                autoComplete="username"
                placeholder="tu@correo.com"
              />
            </label>
            {!reset && (
              <label className="field">
                Contraseña
                <span className="relative">
                  <input
                    name="password"
                    type={visible ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    style={{ paddingRight: 48 }}
                    placeholder="Tu contraseña"
                  />
                  <button
                    type="button"
                    aria-label={
                      visible ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    }
                    onClick={() => setVisible(!visible)}
                    className="absolute right-3 top-3.5 text-muted-foreground"
                  >
                    {visible ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </span>
              </label>
            )}
            <button
              type="button"
              className="text-sm font-semibold text-ocean"
              onClick={() => {
                setReset(!reset)
                setMessage('')
              }}
            >
              {reset ? 'Volver a iniciar sesión' : '¿Olvidaste tu contraseña?'}
            </button>
            {message && (
              <p
                role="status"
                className="rounded-xl bg-[#edf4f5] p-4 text-sm leading-6"
              >
                {message}
              </p>
            )}
            <button
              disabled={busy}
              type="submit"
              className="action-primary w-full"
            >
              {busy ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <>
                  {reset ? 'Enviar enlace de recuperación' : 'Iniciar sesión'}
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>
          <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4" />
            Acceso exclusivo para personal autorizado
          </div>
          <div className="mt-8 border-t pt-6">
            <p className="text-sm leading-6 text-muted-foreground">
              Explora el panel con información ficticia.
            </p>
            <Link
              className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-ocean"
              href="/admin/demo"
            >
              Ver demostración <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          ¿Necesitas una cuenta? Contacta al administrador de tu equipo.
        </p>
      </section>
    </main>
  )
}
function MapPinIcon() {
  return <span className="size-2 rounded-full bg-turquoise" />
}

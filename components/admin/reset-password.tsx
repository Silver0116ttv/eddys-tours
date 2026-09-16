'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
export function ResetPassword() {
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('Verificando el enlace…')
  useEffect(() => {
    async function verify() {
      if (!isSupabaseConfigured()) {
        setMessage(
          'La recuperación aún no está habilitada. Contacta al administrador.',
        )
        return
      }
      try {
        const client = createClient()
        const code = new URLSearchParams(window.location.search).get('code')
        if (code) {
          const { error } = await client.auth.exchangeCodeForSession(code)
          if (error) throw error
          window.history.replaceState(null, '', '/admin/reset-password')
        }
        const { data, error } = await client.auth.getUser()
        if (error || !data.user) throw new Error('Expired')
        setReady(true)
        setMessage('Elige una contraseña de al menos 10 caracteres.')
      } catch {
        setMessage(
          'El enlace venció o no es válido. Solicita uno nuevo desde el inicio de sesión.',
        )
      }
    }
    void verify()
  }, [])
  return (
    <main
      id="main"
      className="grid min-h-svh place-items-center bg-[#edf4f5] p-6"
    >
      <form
        className="surface w-full max-w-md space-y-5"
        onSubmit={async (e) => {
          e.preventDefault()
          const form = new FormData(e.currentTarget)
          if (form.get('password') !== form.get('confirm')) {
            setMessage('Las contraseñas deben coincidir.')
            return
          }
          setBusy(true)
          try {
            const { error } = await createClient().auth.updateUser({
              password: String(form.get('password')),
            })
            if (error) throw error
            setReady(false)
            setMessage(
              'Contraseña actualizada. Ya puedes entrar con tu nueva contraseña.',
            )
          } catch {
            setMessage('No pudimos actualizar la contraseña. Intenta de nuevo.')
          } finally {
            setBusy(false)
          }
        }}
      >
        <h1 className="text-3xl font-bold">Nueva contraseña</h1>
        <p role="status" className="text-sm leading-6 text-muted-foreground">
          {message}
        </p>
        {ready && (
          <>
            <label className="field">
              Nueva contraseña
              <input
                required
                type="password"
                name="password"
                autoComplete="new-password"
                minLength={10}
              />
            </label>
            <label className="field">
              Confirma tu contraseña
              <input
                required
                type="password"
                name="confirm"
                autoComplete="new-password"
                minLength={10}
              />
            </label>
            <button disabled={busy} className="action-primary w-full">
              {busy ? 'Guardando…' : 'Guardar contraseña'}
            </button>
          </>
        )}
        <Link
          href="/admin/login"
          className="block text-center text-sm font-semibold text-ocean"
        >
          Volver al inicio de sesión
        </Link>
      </form>
    </main>
  )
}

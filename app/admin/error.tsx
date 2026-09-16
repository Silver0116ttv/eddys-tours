'use client'
import Link from 'next/link'
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="grid min-h-screen place-items-center p-6">
      <div className="surface max-w-md">
        <h1 className="text-2xl font-bold">No pudimos cargar la operación</h1>
        <p className="my-5 leading-7 text-muted-foreground">
          Intenta nuevamente. Si tu sesión venció, vuelve a iniciar sesión.
        </p>
        <button className="action-primary" onClick={reset}>
          Reintentar
        </button>
        <Link className="action-secondary ml-3" href="/admin/login">
          Iniciar sesión
        </Link>
      </div>
    </main>
  )
}

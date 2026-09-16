export default function Loading() {
  return (
    <main
      id="main"
      className="min-h-screen bg-[#f3f6f7] p-10"
      aria-busy="true"
      aria-label="Cargando administración"
    >
      <div className="mx-auto max-w-5xl animate-pulse motion-reduce:animate-none">
        <div className="mb-10 h-12 w-64 rounded-xl bg-slate-200" />
        <div className="grid gap-5 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-white" />
          ))}
        </div>
        <div className="mt-8 h-96 rounded-xl bg-white" />
      </div>
    </main>
  )
}

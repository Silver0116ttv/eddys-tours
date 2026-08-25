export default function ToursLoading() {
  return (
    <main className="min-h-screen bg-background px-4 pb-20 pt-32 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1440px] animate-pulse">
        <div className="h-12 w-2/3 rounded-xl bg-muted md:w-1/3" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="aspect-[3/4] rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    </main>
  )
}

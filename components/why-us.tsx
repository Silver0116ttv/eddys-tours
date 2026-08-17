import { ShieldCheck, Wallet, MapPinned, Headphones } from "lucide-react"

const points = [
  {
    icon: ShieldCheck,
    title: "Verified local operators",
    body: "Every guide and boat is vetted in person. We only list operators we'd send our own family with.",
  },
  {
    icon: Wallet,
    title: "Book now, pay a deposit",
    body: "Lock in your spot with a small deposit and pay the balance later. No surprises at checkout.",
  },
  {
    icon: MapPinned,
    title: "Built by locals",
    body: "We live here. From hidden beaches to the best taco stop, our picks come from real experience.",
  },
  {
    icon: Headphones,
    title: "Real support, 7 days a week",
    body: "Message us anytime before or during your trip. A local human always answers.",
  },
]

export function WhyUs() {
  return (
    <section id="about" className="scroll-mt-24 py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_2fr] lg:gap-16">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
              Why Eddy&apos;s
            </span>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-foreground text-balance md:text-5xl">
              A local team you can actually trust
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground text-pretty">
              Eddy&apos;s Tours started as one guide with one boat. Today we connect travelers with
              the best operators across Banderas Bay — and we still treat every booking personally.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {points.map((point) => (
              <div key={point.title} className="flex flex-col gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                  <point.icon className="size-5" />
                </div>
                <h3 className="font-sans text-lg font-semibold text-foreground">{point.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{point.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

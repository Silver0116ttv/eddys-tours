import { Logo } from "@/components/logo"
import { Camera, Globe, Mail, MessageCircle, Phone } from "lucide-react"

const columns = [
  {
    title: "Experiences",
    links: ["Adventure", "Water & Snorkeling", "Boat Cruises", "Nature & Wildlife", "Family Trips"],
  },
  {
    title: "Destinations",
    links: ["Puerto Vallarta", "Nuevo Vallarta", "Sayulita", "Punta Mita", "Yelapa"],
  },
  {
    title: "Company",
    links: ["About Eddy's", "Become a Partner", "Careers", "Press", "Blog"],
  },
  {
    title: "Support",
    links: ["Help Center", "Booking Policy", "Cancellations", "Contact Us", "Safety"],
  },
]

export function SiteFooter() {
  return (
    <footer id="footer" className="scroll-mt-24 border-t border-border bg-secondary">
      <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Handpicked tours and experiences across Banderas Bay, booked with local people who
              love this coast.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[Camera, MessageCircle, Globe].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex size-9 items-center justify-center rounded-full bg-background text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <Icon className="size-4" />
                  <span className="sr-only">Social link</span>
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-sans text-sm font-semibold text-foreground">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
            <a href="tel:+523221234567" className="flex items-center gap-2 hover:text-foreground">
              <Phone className="size-4" />
              +52 322 123 4567
            </a>
            <a href="mailto:hola@eddystours.mx" className="flex items-center gap-2 hover:text-foreground">
              <Mail className="size-4" />
              hola@eddystours.mx
            </a>
          </div>
          <p>© {new Date().getFullYear()} Eddy&apos;s Tours. Puerto Vallarta, Jalisco, México.</p>
        </div>
      </div>
    </footer>
  )
}

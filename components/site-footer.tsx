'use client'

import { Camera, Globe, Mail, MessageCircle, Phone } from 'lucide-react'
import { Logo } from '@/components/logo'
import { useI18n } from '@/components/use-i18n'

const columns = [
  {
    title: 'footer.experiences' as const,
    links: [['Adventure', 'Aventura'], ['Water & Snorkeling', 'Agua y snorkel'], ['Boat Cruises', 'Paseos en barco'], ['Nature & Wildlife', 'Naturaleza y vida silvestre'], ['Family Trips', 'Viajes en familia']],
  },
  {
    title: 'footer.destinations' as const,
    links: [['Puerto Vallarta', 'Puerto Vallarta'], ['Nuevo Vallarta', 'Nuevo Vallarta'], ['Sayulita', 'Sayulita'], ['Punta Mita', 'Punta Mita'], ['Yelapa', 'Yelapa']],
  },
  {
    title: 'footer.company' as const,
    links: [["About Eddy's", "Conoce a Eddy's"], ['Become a Partner', 'Sé nuestro socio'], ['Careers', 'Empleo'], ['Press', 'Prensa'], ['Blog', 'Blog']],
  },
  {
    title: 'footer.support' as const,
    links: [['Help Center', 'Centro de ayuda'], ['Booking Policy', 'Políticas de reservación'], ['Cancellations', 'Cancelaciones'], ['Contact Us', 'Contáctanos'], ['Safety', 'Seguridad']],
  },
]

/** Point each `href` at the live profile before launch. */
const socialLinks = [
  { label: 'Instagram', href: '#', icon: Camera },
  { label: 'WhatsApp', href: '#', icon: MessageCircle },
  { label: 'TripAdvisor', href: '#', icon: Globe },
]

export function SiteFooter() {
  const { language, t } = useI18n()
  return (
    <footer id="footer" className="scroll-mt-24 border-t border-border bg-secondary">
      <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {t('footer.body')}
            </p>
            <ul className="mt-5 flex items-center gap-3">
              {socialLinks.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    className="flex size-9 items-center justify-center rounded-full bg-background text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <social.icon className="size-4" aria-hidden="true" />
                    <span className="sr-only">{social.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="font-sans text-sm font-semibold text-foreground">{t(column.title)}</h3>
              <ul className="mt-4 space-y-3">
                {column.links.map(([englishLabel, spanishLabel]) => (
                  <li key={englishLabel}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {language === 'ES' ? spanishLabel : englishLabel}
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
              <Phone className="size-4" aria-hidden="true" />
              +52 322 123 4567
            </a>
            <a
              href="mailto:hola@eddystours.mx"
              className="flex items-center gap-2 hover:text-foreground"
            >
              <Mail className="size-4" aria-hidden="true" />
              hola@eddystours.mx
            </a>
          </div>
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  )
}

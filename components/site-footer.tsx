'use client'

import Link from 'next/link'
import { Mail, MessageCircle, Phone } from 'lucide-react'
import { Logo } from '@/components/logo'
import { useI18n } from '@/components/use-i18n'

type FooterLink = readonly [englishLabel: string, spanishLabel: string, href: string]

interface FooterColumn {
  title: 'footer.experiences' | 'footer.destinations' | 'footer.company' | 'footer.support'
  links: FooterLink[]
}

const columns: FooterColumn[] = [
  {
    title: 'footer.experiences' as const,
    links: [
      ['Adventure', 'Aventura', '/tours?category=Adventure'],
      ['Water & Snorkeling', 'Agua y snorkel', '/tours?category=Water'],
      ['Boat Cruises', 'Paseos en barco', '/tours?category=Boats'],
      ['Nature & Wildlife', 'Naturaleza y vida silvestre', '/tours?category=Nature'],
      ['Wildlife', 'Vida silvestre', '/tours?category=Wildlife'],
    ],
  },
  {
    title: 'footer.destinations' as const,
    links: [
      ['Puerto Vallarta', 'Puerto Vallarta', '/tours?destination=Puerto%20Vallarta'],
      ['Nuevo Vallarta', 'Nuevo Vallarta', '/tours?destination=Nuevo%20Vallarta'],
      ['Sayulita', 'Sayulita', '/tours?destination=Sayulita'],
      ['Punta Mita', 'Punta Mita', '/tours?destination=Punta%20Mita'],
      ['Yelapa', 'Yelapa', '/tours?destination=Yelapa'],
    ],
  },
  {
    title: 'footer.company' as const,
    links: [
      ["About Eddy's", "Conoce a Eddy's", '/#about'],
      ['Become a Partner', 'Sé nuestro socio', 'mailto:hola@eddystours.mx?subject=Partner%20with%20Eddy%27s%20Tours'],
      ['Careers', 'Empleo', 'mailto:hola@eddystours.mx?subject=Careers%20at%20Eddy%27s%20Tours'],
      ['Press', 'Prensa', 'mailto:hola@eddystours.mx?subject=Press%20inquiry'],
    ],
  },
  {
    title: 'footer.support' as const,
    links: [
      ['Help Center', 'Centro de ayuda', 'mailto:hola@eddystours.mx?subject=Booking%20help'],
      ['Booking Policy', 'Políticas de reservación', '/booking-policy'],
      ['Cancellations', 'Cancelaciones', '/booking-policy#cancellations'],
      ['Contact Us', 'Contáctanos', 'mailto:hola@eddystours.mx'],
      ['Safety', 'Seguridad', '/booking-policy#safety'],
    ],
  },
]

const socialLinks = [
  { label: 'WhatsApp', href: 'https://wa.me/523221234567', icon: MessageCircle },
  { label: 'Email', href: 'mailto:hola@eddystours.mx', icon: Mail },
  { label: 'Phone', href: 'tel:+523221234567', icon: Phone },
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
                {column.links.map(([englishLabel, spanishLabel, href]) => (
                  <li key={englishLabel}>
                    {href.startsWith('/') ? (
                      <Link
                        href={href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {language === 'ES' ? spanishLabel : englishLabel}
                      </Link>
                    ) : (
                      <a
                        href={href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {language === 'ES' ? spanishLabel : englishLabel}
                      </a>
                    )}
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

import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { DM_Sans, Inter } from 'next/font/google'
import { CartProvider } from '@/components/cart/cart-context'
import { LanguageSync } from '@/components/language-sync'
import { getSiteUrl, siteConfig } from '@/lib/site'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: siteConfig.title,
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    'Puerto Vallarta tours',
    'Banderas Bay experiences',
    'Sayulita tours',
    'yacht rental Puerto Vallarta',
    'ATV Sierra Madre',
    'Marietas Islands',
  ],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Eddy's Tours — Tours & Experiences in Puerto Vallarta",
    description:
      'Discover unforgettable experiences across Puerto Vallarta and the Bay of Banderas.',
    url: '/',
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Eddy's Tours — Tours & Experiences in Puerto Vallarta",
    description:
      'Discover unforgettable experiences across Puerto Vallarta and the Bay of Banderas.',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f7f5ef',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${inter.variable} bg-background`}>
      <body className="antialiased">
        <CartProvider>
          <LanguageSync />
          {children}
        </CartProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

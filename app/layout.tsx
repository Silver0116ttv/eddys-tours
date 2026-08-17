import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { DM_Sans, Inter } from 'next/font/google'
import { CartProvider } from '@/components/cart/cart-context'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: "Eddy's Tours — Tours & Experiences in Puerto Vallarta, Mexico",
  description:
    'Discover unforgettable tours and experiences across Puerto Vallarta and the Bay of Banderas — ATV, yacht, snorkeling, whale watching, sailing and more. Book local, hand-picked adventures.',
  generator: 'v0.app',
  keywords: [
    'Puerto Vallarta tours',
    'Banderas Bay experiences',
    'Sayulita tours',
    'yacht rental Puerto Vallarta',
    'ATV Sierra Madre',
    'Marietas Islands',
  ],
  openGraph: {
    title: "Eddy's Tours — Tours & Experiences in Puerto Vallarta",
    description:
      'Discover unforgettable experiences across Puerto Vallarta and the Bay of Banderas.',
    type: 'website',
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
        <CartProvider>{children}</CartProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

'use client'

import { useFavorites } from './use-favorites'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { TourCard } from '@/components/tour-card'
import { useI18n } from '@/components/use-i18n'
import { PageIntro } from './page-shell'
import type { Tour } from '@/lib/tours'

export function Favorites({ tours }: { tours: Tour[] }) {
  const { ids } = useFavorites()
  const { language } = useI18n()
  const es = language === 'ES'
  const saved = tours.filter((tour) => ids.includes(tour.id))
  return (
    <>
      <PageIntro
        title={es ? 'Tus próximas aventuras.' : 'Your next adventures.'}
        description={
          es
            ? 'Guarda lo que te inspira y arma un viaje a tu medida. Tus favoritos se conservan en este navegador.'
            : 'Save what inspires you and make the trip your own. Favorites are saved in this browser.'
        }
      />
      <div className="travel-container py-12">
        {saved.length ? (
          <>
            <p className="mb-6 text-muted-foreground">
              {saved.length}{' '}
              {es ? saved.length === 1 ? 'experiencia guardada' : 'experiencias guardadas' : saved.length === 1 ? 'saved experience' : 'saved experiences'}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {saved.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <Heart className="size-12 text-ocean" />
            <h2>
              {es
                ? 'Un viaje empieza con una idea'
                : 'Every trip starts with an idea'}
            </h2>
            <p>
              {es
                ? 'Toca el corazón de cualquier tour para encontrarlo aquí.'
                : 'Tap the heart on any tour to find it here.'}
            </p>
            <Link className="action-primary" href="/tours">
              {es ? 'Descubrir tours' : 'Discover tours'}
            </Link>
          </div>
        )}
      </div>
    </>
  )
}

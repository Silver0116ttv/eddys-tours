'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { useI18n } from '@/components/use-i18n'

const chapters = [
  {
    image: "/images/story-ocean.webp",
    kicker: "The Bay",
    title: "Where the Pacific turns turquoise",
    body: "Banderas Bay is one of the largest and deepest bays in the world — a playground of hidden coves, coral reefs, and water so clear you can count the fish below your boat.",
    kickerES: 'La bahía',
    titleES: 'Donde el Pacífico se vuelve turquesa',
    bodyES: 'La Bahía de Banderas es una de las más grandes y profundas del mundo: un paraíso de caletas escondidas, arrecifes y agua tan clara que puedes contar los peces desde el barco.',
  },
  {
    image: "/images/story-jungle.webp",
    kicker: "The Jungle",
    title: "A rainforest that starts at the sand",
    body: "Minutes from the beach, the Sierra Madre erupts into dense green canopy. Chase waterfalls, cross rope bridges, and ride trails that only the locals know.",
    kickerES: 'La selva',
    titleES: 'Una selva tropical que comienza en la arena',
    bodyES: 'A pocos minutos de la playa, la Sierra Madre se convierte en una densa selva. Persigue cascadas, cruza puentes colgantes y recorre senderos que solo conocen los locales.',
  },
  {
    image: "/images/story-sierra.webp",
    kicker: "The Mountains",
    title: "Old silver towns in the clouds",
    body: "Climb into the cool highlands to San Sebastián del Oeste, a colonial mining town frozen in time, where the coffee is grown a few steps from where it's poured.",
    kickerES: 'Las montañas',
    titleES: 'Antiguos pueblos mineros entre las nubes',
    bodyES: 'Sube hacia el clima fresco de San Sebastián del Oeste, un pueblo minero colonial detenido en el tiempo, donde el café crece a pocos pasos de donde se sirve.',
  },
  {
    image: "/images/story-sunset-v2.webp",
    kicker: "The Sunset",
    title: "The show that ends every day",
    body: "There's a reason people gather on the Malecón each evening. When the sun drops into the Pacific, the whole sky catches fire — and the best seats are out on the water.",
    kickerES: 'El atardecer',
    titleES: 'El espectáculo que cierra cada día',
    bodyES: 'Hay una razón por la que todos se reúnen en el Malecón cada tarde. Cuando el sol cae sobre el Pacífico, el cielo se enciende y los mejores lugares están en el agua.',
  },
]

function Chapter({
  chapter,
  index,
}: {
  chapter: (typeof chapters)[number]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  // Keep a generous image bleed above and below the card. The previous
  // 0-to-124% layer moved as much as 12% from the top edge, exposing the white
  // card background near the end of the scroll. A centered bleed plus a
  // gentler offset preserves the parallax without ever uncovering the frame.
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"])
  const reversed = index % 2 === 1

  return (
    <div
      ref={ref}
      className="grid items-stretch gap-0 overflow-hidden rounded-3xl border border-border bg-card shadow-sm md:grid-cols-2"
    >
      <div
        className={`relative min-h-[280px] overflow-hidden md:min-h-[460px] ${
          reversed ? "md:order-2" : ""
        }`}
      >
        <motion.div style={{ y }} className="absolute inset-x-0 -inset-y-[12%]">
          <Image
            src={chapter.image || "/placeholder.svg"}
            alt={chapter.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </motion.div>
      </div>

      <div className="flex flex-col justify-center gap-4 p-8 md:p-12 lg:p-16">
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
          {chapter.kicker}
        </span>
        <h3 className="font-display text-3xl leading-tight text-foreground text-balance md:text-4xl">
          {chapter.title}
        </h3>
        <p className="max-w-md leading-relaxed text-muted-foreground">{chapter.body}</p>
      </div>
    </div>
  )
}

export function Storytelling() {
  const { language, t } = useI18n()
  return (
    <section id="story" className="scroll-mt-24 bg-secondary py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
            {t('story.eyebrow')}
          </span>
          <h2 className="mt-4 font-display text-4xl leading-tight text-foreground text-balance md:text-5xl">
            {t('story.title')}
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground text-pretty">
            {t('story.subtitle')}
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-6 md:mt-16 md:gap-10">
          {chapters.map((chapter, i) => (
            <Chapter
              key={chapter.title}
              chapter={
                language === 'ES'
                  ? { ...chapter, kicker: chapter.kickerES, title: chapter.titleES, body: chapter.bodyES }
                  : chapter
              }
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

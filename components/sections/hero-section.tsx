"use client"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { AnimateOnScroll } from "@/components/gsap/animate-on-scroll"

export function HeroSection() {
  return (
    <section className="bg-slate-800 text-white">
      <div className="mx-auto max-w-6xl">
        <Image
          src="/hero-bg.png"
          alt="Hero Image"
          width={1800}
          height={600}
          className="w-full h-auto object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
          priority
        />
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <AnimateOnScroll y={32}>
            <h1 className="text-pretty text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
              Discover top brands. One place.
            </h1>
            <p className="mt-3 max-w-2xl text-slate-100/90 leading-relaxed text-base sm:text-lg">
              Shop curated selections across footwear, apparel, accessories, electronics and home.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Button className="bg-amber-400 text-slate-900 hover:bg-amber-300 w-full sm:w-auto">
                Shop new arrivals
              </Button>
              <Button variant="secondary" className="bg-white text-slate-900 hover:bg-slate-100 w-full sm:w-auto">
                View deals
              </Button>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  )
}

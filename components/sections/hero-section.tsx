"use client"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { AnimateOnScroll } from "@/components/gsap/animate-on-scroll"

export function HeroSection() {
  return (
    <section className="bg-slate-800 text-white">
      <div className="mx-auto max-w-6xl p-2">
        <Image src="/hero-bg.png" alt="Hero Image" width={1800} height={600} />
        <AnimateOnScroll y={32}>
          <h1 className="text-pretty text-3xl md:text-4xl font-semibold">Discover top brands. One place.</h1>
          <p className="mt-3 max-w-lg text-slate-100/90 leading-relaxed">
            Shop curated selections across footwear, apparel, accessories, electronics and home.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Button className="bg-amber-400 text-slate-900 hover:bg-amber-300">Shop new arrivals</Button>
            <Button variant="secondary" className="bg-white text-slate-900 hover:bg-slate-100">
              View deals
            </Button>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}

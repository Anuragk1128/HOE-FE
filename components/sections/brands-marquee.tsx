"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { fetchBrands, type Brand as ApiBrand } from "@/lib/api"

export function BrandsMarquee() {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [brands, setBrands] = useState<ApiBrand[]>([])

  useEffect(() => {
    fetchBrands().then(setBrands).catch(() => setBrands([]))
    if (!trackRef.current) return
    const ctx = gsap.context(() => {
      gsap.to(".brand-pill", {
        xPercent: -100,
        repeat: -1,
        ease: "none",
        duration: 20,
      })
    }, trackRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="relative overflow-hidden" ref={trackRef} aria-label="Brand marquee">
          <div className="flex gap-4 whitespace-nowrap will-change-transform">
            {[...brands, ...brands].map((b, i) => (
              <span
                key={`${b._id}-${i}`}
                className="brand-pill inline-block rounded-full border px-4 py-2 text-sm text-slate-700"
              >
                {b.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

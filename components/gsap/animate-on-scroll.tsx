"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

interface AnimateOnScrollProps {
  children: React.ReactNode
  y?: number
  duration?: number
  delay?: number
  once?: boolean
}

export function AnimateOnScroll({ children, y = 24, duration = 0.6, delay = 0, once = true }: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current

    const ctx = gsap.context(() => {
      gsap.set(el, { autoAlpha: 0, y })
      ScrollTrigger.create({
        trigger: el,
        start: "top 80%",
        once,
        onEnter: () => {
          gsap.to(el, { autoAlpha: 1, y: 0, duration, delay, ease: "power3.out" })
        },
      })
    }, ref)

    return () => {
      ctx.revert()
      ScrollTrigger.refresh()
    }
  }, [y, duration, delay, once])

  return <div ref={ref}>{children}</div>
}

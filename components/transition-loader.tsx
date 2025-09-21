"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"

export default function TransitionLoader({ durationMs = 2000 }: { durationMs?: number }) {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const firstLoadRef = useRef(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (firstLoadRef.current) {
      // Skip initial render so only subsequent route changes trigger this loader
      firstLoadRef.current = false
      return
    }
    setVisible(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setVisible(false), durationMs)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [pathname, durationMs])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <Image
          src="/Hoe logo original.png"
          alt="House Of Evolve"
          width={96}
          height={96}
          priority
          className="w-20 h-auto sm:w-24 md:w-28 lg:w-32"
        />
        <div className="mt-4 flex items-center gap-2" aria-label="Loading" role="status">
          <span
            className="h-2 w-2 rounded-full animate-bounce"
            style={{ backgroundColor: "var(--foreground)", animationDelay: "0s" }}
          />
          <span
            className="h-2 w-2 rounded-full animate-bounce"
            style={{ backgroundColor: "var(--foreground)", animationDelay: "0.15s" }}
          />
          <span
            className="h-2 w-2 rounded-full animate-bounce"
            style={{ backgroundColor: "var(--foreground)", animationDelay: "0.3s" }}
          />
        </div>
      </div>
    </div>
  )
}

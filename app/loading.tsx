"use client"

import Image from "next/image"

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9997] flex items-center justify-center bg-background">
      <div className="flex flex-col items-center">
        <Image
          src="/logo.png"
          alt="House Of Evolve"
          width={128}
          height={128}
          priority
          className="w-24 h-auto sm:w-28 md:w-32 lg:w-36"
        />
        <div className="mt-6 flex items-center gap-2" aria-label="Loading" role="status">
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

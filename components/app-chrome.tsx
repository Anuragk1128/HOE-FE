"use client"

import { usePathname } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import Footer from "@/components/footer"
import GlobalLoader from "@/components/global-loader"
import TransitionLoader from "@/components/transition-loader"

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")

  if (isAdmin) return <>{children}</>

  return (
    <div className="min-h-screen flex flex-col">
      <GlobalLoader durationMs={5000} />
      <TransitionLoader durationMs={2000} />
      <SiteHeader />
      <main className="flex-1">
      {children}
      </main>
      <Footer />
    </div>
  )
}



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
    <>
      <GlobalLoader durationMs={5000} />
      <TransitionLoader durationMs={2000} />
      <SiteHeader />
      {children}
      <Footer />
    </>
  )
}



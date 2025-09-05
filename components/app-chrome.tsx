"use client"

import { usePathname } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import Footer from "@/components/footer"

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")

  if (isAdmin) return <>{children}</>

  return (
    <>
      <SiteHeader />
      {children}
      <Footer />
    </>
  )
}



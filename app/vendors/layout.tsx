"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { VendorAuthProvider, useVendorAuth } from "@/contexts/vendor-auth-context"
import { Button } from "@/components/ui/button"

function VendorLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, logout, loading } = useVendorAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated && pathname !== "/vendors/login") {
      router.replace("/vendors/login")
    }
  }, [isAuthenticated, loading, router, pathname])

  const onLogout = () => {
    logout()
    router.replace("/vendors/login")
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[240px_1fr]">
      <aside className="border-r bg-white">
        <div className="h-14 flex items-center px-4 font-semibold border-b">Vendor Panel</div>
        <nav className="px-2 py-4 space-y-1 text-sm">
          <Link href="/vendors" className="block rounded px-2 py-2 hover:bg-slate-100">
            Dashboard
          </Link>
          <Link href="/vendors/products" className="block rounded px-2 py-2 hover:bg-slate-100">
            Products
          </Link>
          <div className="pt-4">
            {isAuthenticated ? (
              <Button className="w-full" variant="outline" size="sm" onClick={onLogout}>
                Logout
              </Button>
            ) : (
              <Button asChild className="w-full" variant="outline" size="sm">
                <Link href="/vendors/login">Login</Link>
              </Button>
            )}
          </div>
        </nav>
      </aside>
      <div>
        <header className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <div className="text-sm text-slate-600">Vendor Portal</div>
          </div>
        </header>
        {children}
      </div>
    </div>
  )
}

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <VendorAuthProvider>
      <VendorLayoutContent>{children}</VendorLayoutContent>
    </VendorAuthProvider>
  )
}
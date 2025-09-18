"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { clearAdminToken, getAdminToken } from "@/lib/api"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    const token = getAdminToken()
    setAuthed(!!token)
    if (!token && pathname !== "/admin/login") {
      router.replace("/admin/login")
    }
  }, [router, pathname])

  const onLogout = () => {
    clearAdminToken()
    setAuthed(false)
    router.replace("/admin/login")
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[240px_1fr]">
      <aside className="border-r bg-white">
        <div className="h-14 flex items-center px-4 font-semibold border-b">Admin</div>
        <nav className="px-2 py-4 space-y-1 text-sm">
          <Link href="/admin" className="block rounded px-2 py-2 hover:bg-slate-100">Dashboard</Link>
          <Link href="/admin/brands" className="block rounded px-2 py-2 hover:bg-slate-100">Brands</Link>
          <Link href="/admin/vendors" className="block rounded px-2 py-2 hover:bg-slate-100">Vendors</Link>
          <Link href="/admin/categories" className="block rounded px-2 py-2 hover:bg-slate-100">Categories</Link>
          <Link href="/admin/subcategories" className="block rounded px-2 py-2 hover:bg-slate-100">Subcategories</Link>
          <Link href="/admin/products" className="block rounded px-2 py-2 hover:bg-slate-100">Products</Link>
          <Link href="/admin/bulk-upload-products" className="block rounded px-2 py-2 hover:bg-slate-100">Bulk Upload Products</Link>
          <Link href="/admin/orders" className="block rounded px-2 py-2 hover:bg-slate-100">Orders</Link>
          <div className="pt-4">
            {authed ? (
              <Button className="w-full" variant="outline" size="sm" onClick={onLogout}>Logout</Button>
            ) : (
              <Button asChild className="w-full" variant="outline" size="sm">
                <Link href="/admin/login">Login</Link>
              </Button>
            )}
          </div>
        </nav>
      </aside>
      <div>
        <header className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <div className="text-sm text-slate-600">Admin Panel</div>
          </div>
        </header>
        {children}
      </div>
    </div>
  )
}



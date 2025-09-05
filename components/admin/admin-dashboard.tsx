"use client"

import { useEffect, useMemo, useState } from "react"
// import { PRODUCTS } from "@/data/products"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatINR } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { fetchBrands, type Brand } from "@/lib/api"

export function AdminDashboard() {
  const [brand, setBrand] = useState<string>("All")
  const [q, setQ] = useState("")
  const [brands, setBrands] = useState<Brand[]>([])
  const [loadingBrands, setLoadingBrands] = useState(false)
  const [brandsError, setBrandsError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const run = async () => {
      setLoadingBrands(true)
      setBrandsError(null)
      try {
        const data = await fetchBrands()
        if (mounted) setBrands(data)
      } catch (err: any) {
        if (mounted) setBrandsError(err?.message || "Failed to load brands")
      } finally {
        if (mounted) setLoadingBrands(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [])

  const groups = useMemo(() => {
    const byBrand = new Map<string, number>()
    const brandNames = ["All", ...(brands?.map((b) => b.name) ?? [])] as string[]
    brandNames.forEach((b) => byBrand.set(b, 0))
    return byBrand
  }, [brands])

  // const list: Product[] = useMemo(() => {
  //   // Dashboard no longer surfaces products; return empty list for grid below
  //   return []
  // }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-slate-600">Manage brands, vendors, categories, subcategories, products.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="#brands">Brands</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="#vendors">Vendors</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="#categories">Categories</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="#subcategories">Subcategories</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="#products">Products</Link>
          </Button>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <Tabs value={brand} onValueChange={setBrand} className="w-full">
          <TabsList className="flex flex-wrap">
            {(["All", ...(brands?.map((b) => b.name) ?? [])] as string[]).map((b) => (
              <TabsTrigger
                key={b}
                value={b}
                className="data-[state=active]:bg-slate-800 data-[state=active]:text-white"
              >
                {b}
                <Badge variant="secondary" className="ml-2">{groups.get(b) ?? 0}</Badge>
              </TabsTrigger>
            ))}
          </TabsList>
          {(["All", ...(brands?.map((b) => b.name) ?? [])] as string[]).map((b) => (
            <TabsContent key={b} value={b}>
              {/* Content renders below with filter; using list from state */}
            </TabsContent>
          ))}
        </Tabs>

        <div className="w-64 shrink-0">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search in selection..." />
        </div>
      </div>

      {loadingBrands && (
        <div className="mt-4 text-sm text-slate-600">Loading brands…</div>
      )}
      {brandsError && (
        <div className="mt-4 text-sm text-red-600">{brandsError}</div>
      )}

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              Product management moved to the Products page. Use the sidebar link to view and manage products.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

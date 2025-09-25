"use client"

import { useEffect, useMemo, useState, use } from "react"
import Image from "next/image"
import Link from "next/link"
import { fetchProductsBySlugs, fetchProductsByCategory, type SlugProduct, API_BASE_URL } from "@/lib/api"

type CollectionKey = "under-999" | "under-2000" | "under-3000" | "gymwear" | "necklaces" | "earrings" |"sportswear"| "bangles"

// Map collection slug -> brand/category/subcategory slugs
const COLLECTION_MAP: Record<CollectionKey, { brandSlug: string; categorySlug: string; subcategorySlug: string; title: string; useCategory?: boolean }> = {
  "under-999": { brandSlug: "", categorySlug: "", subcategorySlug: "", title: "Under ₹999" },
  "under-2000": { brandSlug: "", categorySlug: "", subcategorySlug: "", title: "Under ₹2000" },
  "under-3000": { brandSlug: "", categorySlug: "", subcategorySlug: "", title: "Under ₹3000" },
  "gymwear": { brandSlug: "sportswear", categorySlug: "men", subcategorySlug: "gym", title: "Gymwear" },
  "necklaces": { brandSlug: "ira", categorySlug: "necklace", subcategorySlug: "", title: "Necklaces", useCategory: true },
  "earrings": { brandSlug: "ira", categorySlug: "earrings", subcategorySlug: "", title: "Earrings", useCategory: true },
  "sportswear": {brandSlug: "sportswear", categorySlug:"women",subcategorySlug:"sports", title:"Sportswear"},
  "bangles":{brandSlug:"ira",categorySlug:"bangles",subcategorySlug:"round-bangles",title:"Bangles"}
}

export default function CollectionsPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const [products, setProducts] = useState<SlugProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const key = resolvedParams.slug as CollectionKey
  const config = COLLECTION_MAP[key]

  useEffect(() => {
    async function run() {
      if (!config) {
        setError("Collection not found")
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        // Special case: Under price → fetch all and filter client-side
        if (key === "under-999" || key === "under-2000" || key === "under-3000") {
          const res = await fetch(`${API_BASE_URL}/products`, { headers: { Accept: 'application/json' } })
          if (!res.ok) throw new Error('Failed to fetch products')
          const raw = await res.json()
          const list: SlugProduct[] = Array.isArray(raw) ? raw : (raw?.data ?? [])
          const threshold = key === 'under-999' ? 999 : key === 'under-2000' ? 2000 : 3000
          setProducts(list.filter((p) => Number(p?.price ?? 0) < threshold))
        } else if (config.useCategory) {
          // Use category-level fetching for necklaces and earrings
          const data = await fetchProductsByCategory({
            brandSlug: config.brandSlug,
            categorySlug: config.categorySlug
          })
          setProducts(data)
        } else {
          const data = await fetchProductsBySlugs(config)
          setProducts(data)
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load collection")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [config])

  const title = useMemo(() => {
    if (key === 'under-999') return 'Under ₹999'
    if (key === 'under-2000') return 'Under ₹2000'
    if (key === 'under-3000') return 'Under ₹3000'
    return config?.title || 'Collection'
  }, [config, key])

  if (loading) return <div className="container mx-auto px-4 py-12">Loading…</div>
  if (error) return <div className="container mx-auto px-4 py-12 text-red-600">{error}</div>

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 "> {title}</h1>
      {products.length === 0 ? (
        <div className="text-2xl font-bold text-center flex flex-col items-center justify-center">
          <h2>Coming Soon...</h2>
          <Image 
            src="https://res.cloudinary.com/deamrxfwp/image/upload/v1757165705/hero-bg_yscglj.png"
            alt="Coming Soon"
            width={400}
            height={400}
            className="mt-4"
            />
          </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <Link key={p._id} href={`/products/${p._id}`} className="group border rounded-lg overflow-hidden hover:shadow-sm">
              <div className="aspect-square bg-gray-100 relative">
                {p.images?.[0] ? (
                  <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                )}
              </div>
              <div className="p-3">
                <div className="font-medium truncate">{p.title}</div>
                <div className="text-sm text-gray-700 mt-1">₹{Number(p.price || 0).toLocaleString('en-IN')}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
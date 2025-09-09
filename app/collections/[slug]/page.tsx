"use client"

import { useEffect, useMemo, useState, use } from "react"
import Image from "next/image"
import Link from "next/link"
import { fetchProductsBySlugs, type SlugProduct } from "@/lib/api"

type CollectionKey = "sports-wear" | "gymwear" | "necklaces" | "earrings"

// Map collection slug -> brand/category/subcategory slugs
const COLLECTION_MAP: Record<CollectionKey, { brandSlug: string; categorySlug: string; subcategorySlug: string; title: string }> = {
  "sports-wear": { brandSlug: "sportswear", categorySlug: "women", subcategorySlug: "sports", title: "Sports Wear" },
  "gymwear": { brandSlug: "sportswear", categorySlug: "men", subcategorySlug: "gym", title: "gym" },
  "necklaces": { brandSlug: "ira", categorySlug: "necklace", subcategorySlug: "round-necklace", title: "Necklaces" },
  "earrings": { brandSlug: "ira", categorySlug: "earrings", subcategorySlug: "drop-earring", title: "Earrings" },
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
        const data = await fetchProductsBySlugs(config)
        setProducts(data)
      } catch (e: any) {
        setError(e?.message || "Failed to load collection")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [config])

  const title = useMemo(() => config?.title || "Collection", [config])

  if (loading) return <div className="container mx-auto px-4 py-12">Loading…</div>
  if (error) return <div className="container mx-auto px-4 py-12 text-red-600">{error}</div>

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      {products.length === 0 ? (
        <div>No products found.</div>
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
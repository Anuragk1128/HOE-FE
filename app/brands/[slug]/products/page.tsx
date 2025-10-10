"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { fetchAllProductsByBrand, type SlugProduct } from "@/lib/api"
import { ProductCard } from "@/components/products/product-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Product } from "@/data/products"

export default function BrandProductsPage() {
  const params = useParams()
  const slug = params.slug as string
  const [products, setProducts] = useState<SlugProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Map brand slugs to their display names
  const brandNames: Record<string, string> = {
    'ira': 'IRA',
    'sportswear': 'Jerseymise'
  }

  const brandName = brandNames[slug] || slug.charAt(0).toUpperCase() + slug.slice(1)

  // Map brand slugs to their logos
  const getBrandLogo = (brandSlug: string) => {
    switch (brandSlug) {
      case 'ira':
        return '/IRA-LOGO.png'
      case 'sportswear':
        return '/JERSEYMISE_LOGO_WHITE_BG.svg'
      default:
        return null
    }
  }

  const brandLogo = getBrandLogo(slug)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const data = await fetchAllProductsByBrand(slug)
        // Filter out products that are out of stock or archived
        const activeProducts = data.filter(product => 
          product.stock > 0 && product.status === 'active'
        )
        console.log(`Fetched ${data.length} products for brand: ${slug}, ${activeProducts.length} active and in stock`)
        setProducts(activeProducts)
      } catch (err) {
        console.error("Failed to fetch products:", err)
        setError("Failed to load products. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [slug])

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center">
        <div className="rounded-md bg-red-50 p-4">
          <h3 className="text-sm font-medium text-red-800">{error}</h3>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-800 hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-7xl px-4 py-8">
        {/* Header with Brand Logo and Info */}
        <div className="mb-8">
          <Link href="/brands" className="text-orange-500 hover:underline font-medium mb-4 inline-block">
            &larr; Back to Brands
          </Link>
          
          <div className="flex items-center gap-6 mb-6">
            {brandLogo && (
              <div className="relative h-20 w-32 flex-shrink-0">
                <Image
                  src={brandLogo}
                  alt={`${brandName} logo`}
                  fill
                  className="object-contain"
                  sizes="128px"
                />
              </div>
            )}
            <div>
              <p className="text-slate-600">
                Explore our complete collection of {brandName.toLowerCase()} products
              </p>
            </div>
          </div>

          {!loading && (
            <div className="text-sm text-slate-600">
              {products.length} product{products.length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product as Product} />
            ))}
          </div>
        ) : (
          <div className="col-span-full py-12 text-center">
            <p className="text-slate-500">No products found for this brand.</p>
          </div>
        )}
      </section>
    </main>
  )
}


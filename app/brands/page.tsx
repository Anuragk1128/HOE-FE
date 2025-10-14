"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Brand, fetchBrands } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

function BrandCard({ brand }: { brand: Brand }) {
  // Map brand slugs to their respective images
  const getBrandImage = (brandSlug: string) => {
    // Use brand slug directly for mapping
    switch (brandSlug) {
      case 'ira':
        return '/IRA-LOGO.png' // IRA brand logo
      case 'sportswear':
        return '/JERSEYMISE_LOGO_WHITE_BG.svg' // JerseyMise brand logo
    // Default fallback
    }
  }

  return (
    <article id={`brand-${brand.slug}`} className="group rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md">
      <Link href={`/brands/${brand.slug}`} className="block">
        <div className="flex h-48 items-center justify-center overflow-hidden rounded-md bg-slate-50 p-4">
          <div className="relative h-full w-full">
            <Image
              src={getBrandImage(brand.slug) || ''}
              alt={`${brand.name} logo`}
              fill
              className="object-contain transition group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        </div>
        <h2 className="mt-3 text-lg font-medium text-slate-900">{brand.name}</h2>
        {brand.description && (
          <p className="mt-1 text-sm text-slate-600 line-clamp-2">{brand.description}</p>
        )}
      </Link>
    </article>
  )
}

function BrandCardSkeleton() {
  return (
    <div className="space-y-4 rounded-lg border bg-white p-4">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  )
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadBrands = async () => {
      try {
        setLoading(true)
        const data = await fetchBrands()
        setBrands(data)
      } catch (err) {
        console.error("Failed to fetch brands:", err)
        setError("Failed to load brands. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadBrands()
  }, [])

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
    <main>
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-baseline justify-between gap-2">
          <h1 className="text-2xl font-semibold">Brands</h1>
          {!loading && (
            <div className="text-sm text-slate-600">
              {brands.length} brand{brands.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            // Show skeleton loaders while loading
            Array(6).fill(0).map((_, i) => <BrandCardSkeleton key={i} />)
          ) : brands.length > 0 ? (
            brands.map((brand) => (
              <BrandCard key={brand._id} brand={brand} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-slate-500">No brands found.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
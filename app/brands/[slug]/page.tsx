"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchCategoriesByBrandSlug, type Category } from "@/lib/api"

function CategoryCard({ category, brandSlug }: { category: Category; brandSlug: string }) {
  return (
    <Link 
      href={`/brands/${brandSlug}/${category.slug}`}
      className="group block overflow-hidden rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex h-48 items-center justify-center overflow-hidden rounded-md bg-slate-50">
        <div className="relative h-full w-full">
          <Image
            src={category.image || '/placeholder.svg'}
            alt={`${category.name} category`}
            fill
            className={`object-cover transition group-hover:scale-[1.02] ${!category.image ? 'bg-slate-200' : ''}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={false}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = '/placeholder.svg';
            }}
          />
        </div>
      </div>
      <h2 className="mt-3 text-lg font-medium text-slate-900">{category.name}</h2>
    </Link>
  )
}

function CategoryCardSkeleton() {
  return (
    <div className="space-y-4 rounded-lg border bg-white p-4">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-6 w-3/4" />
    </div>
  )
}

// Add the 'use client' directive at the top of the file if not already present

function BrandCategoriesPageContent({ slug }: { slug: string }) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [brandName, setBrandName] = useState("")

  // Map of known brand slugs to their display names
  const brandNames: Record<string, string> = {
    'ira': 'Ira',
    'sportswear': 'Jerseymise'
  }

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true)
        const data = await fetchCategoriesByBrandSlug(slug)
        setCategories(data)
        
        // Set the brand name based on the slug
        setBrandName(brandNames[slug] || slug.charAt(0).toUpperCase() + slug.slice(1))
      } catch (err) {
        console.error("Failed to fetch categories:", err)
        setError("Failed to load categories. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [slug])

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center">
        <div className="rounded-md bg-red-50 p-4">
          <h3 className="text-sm font-medium text-red-800">{error}</h3>
          <button
            onClick={() => router.refresh()}
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
        <div className="mb-8">
          <Link href="/brands" className="text-amber-600 hover:underline">
            &larr; Back to Brands
          </Link>
          <h1 className="mb-4 text-3xl font-bold text-slate-900">
            {brandName} Categories
          </h1>
          <p className="text-slate-600">
            Browse our collection of {brandName.toLowerCase()} products
          </p>
          {!loading && (
            <div className="text-sm text-slate-600">
              {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
            // Show skeleton loaders while loading
            Array(4).fill(0).map((_, i) => <CategoryCardSkeleton key={i} />)
          ) : categories.length > 0 ? (
            categories.map((category) => (
              <CategoryCard 
                key={category._id} 
                category={category} 
                brandSlug={slug} 
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-slate-500">No categories found for this brand.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

// This is a Server Component that passes the params to the Client Component
export default function BrandCategoriesPage({ params }: { params: { slug: string } }) {
  // In Next.js 13+, params is already available synchronously in Server Components
  return <BrandCategoriesPageContent slug={params.slug} />
}

export const dynamic = 'force-dynamic'

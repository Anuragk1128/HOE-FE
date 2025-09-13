"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  image: string
  brandSlug: string
  brandName: string
}

const defaultCategories = [
  {
    name: "Shoes",
    description: "Performance footwear for running, training, and trails.",
    image: "/running-shoe-on-white.png",
    brandName: "All Brands"
  },
  {
    name: "Apparel",
    description: "Comfortable, technical clothing for sport and lifestyle.",
    image: "/athletic-t-shirt-folded.png",
    brandName: "All Brands"
  },
  {
    name: "Accessories",
    description: "Bags and essentials to complement your daily carry.",
    image: "/backpack-on-white.png",
    brandName: "All Brands"
  }
]

export default function Category() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        // Fetch categories from both brands
        const [iraResponse, sportswearResponse] = await Promise.all([
          fetch('https://hoe-be.onrender.com/api/brands/ira/categories'),
          fetch('https://hoe-be.onrender.com/api/brands/sportswear/categories')
        ])

        const [iraData, sportswearData] = await Promise.all([
          iraResponse.json(),
          sportswearResponse.json()
        ])

        // Log responses for debugging
        console.log('Ira response:', iraData);
        console.log('Sportswear response:', sportswearData);

        // Handle the response structure where data is directly in the response
        const processCategories = (data: any, brandSlug: string, brandName: string) => {
          // If data is an array, use it directly
          if (Array.isArray(data)) {
            return data.map((cat: any) => ({
              ...cat,
              brandSlug,
              brandName
            }));
          }
          // If data has a data property that's an array, use that
          if (data.data && Array.isArray(data.data)) {
            return data.data.map((cat: any) => ({
              ...cat,
              brandSlug,
              brandName
            }));
          }
          // If no valid data found, return empty array
          return [];
        };

        // Combine and deduplicate categories
        const combinedCategories = [
          ...processCategories(iraData, 'ira', 'Ira'),
          ...processCategories(sportswearData, 'sportswear', 'Jerseymise')
        ];

        // Remove duplicates by category name
        const uniqueCategories = Array.from(
          new Map(combinedCategories.map(item => [item.name, item])).values()
        )

        setCategories(uniqueCategories)
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError('Failed to load categories. Please try again later.')
        // Fallback to default categories
        setCategories(defaultCategories as any)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-baseline justify-between gap-2">
          <h1 className="text-2xl font-semibold">Categories</h1>
          {!loading && (
            <div className="text-sm text-slate-600">
              {categories.length} {categories.length === 1 ? 'category' : 'categories'} available
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Show skeleton loaders while loading
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-white p-4">
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))
          ) : categories.length > 0 ? (
            // Show actual categories
            categories.map((category) => (
              <article 
                key={`${category._id || category.name}-${category.brandSlug}`}
                className="group rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <Link href={`/categories/${category.brandSlug}/${category.slug || category.name.toLowerCase()}`} className="block">
                  <div className="overflow-hidden rounded-md bg-slate-50 aspect-square">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={`${category.name} category`}
                        width={800}
                        height={600}
                        className="h-full w-full object-cover group-hover:opacity-80 transition-opacity"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-slate-400">No image</span>
                      </div>
                    )}
                  </div>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    {category.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                      {category.brandName}
                    </span>
                  </div>
                </Link>
              </article>
            ))
          ) : (
            // Fallback if no categories are found
            <div className="col-span-full text-center py-12">
              <p className="text-slate-500">No categories found.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
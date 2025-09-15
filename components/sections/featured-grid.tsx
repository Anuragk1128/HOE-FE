"use client"

import { useEffect, useState } from 'react'
import { Product } from "@/data/products"
import { ProductCard } from "@/components/products/product-card"
import { AnimateOnScroll } from "@/components/gsap/animate-on-scroll"

export function FeaturedGrid() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        const response = await fetch('https://hoe-be.onrender.com/api/products')
        const data = await response.json()
        if (data.success) {
          // Get up to 8 featured products or products with high ratings
          const featuredProducts = data.data
            .filter((p: Product) => p.tags?.includes("featured") || p.status === "active")
            .slice(0, 8)
          setFeatured(featuredProducts)
        }
      } catch (error) {
        console.error('Failed to fetch featured products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  return (
    <section className="bg-white w-full overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <AnimateOnScroll y={16}>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Featured Products</h2>
          </AnimateOnScroll>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, idx) => (
              <div key={idx} className="h-72 sm:h-80 bg-gray-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((p, idx) => (
              <div key={p._id} className="w-full h-full">
                <AnimateOnScroll y={24} delay={idx * 0.05}>
                  <ProductCard product={p} />
                </AnimateOnScroll>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

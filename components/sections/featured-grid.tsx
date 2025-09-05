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
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900">Featured</h2>
        </div>
        {loading ? (
          <div className="mt-6 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((p, idx) => (
              <AnimateOnScroll key={p._id} y={24} delay={idx * 0.05}>
                <ProductCard product={p} />
              </AnimateOnScroll>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

"use client"

import { useEffect, useState } from 'react'
import { Product } from "@/data/products"
import { ProductCard } from "@/components/products/product-card"
import { AnimateOnScroll } from "@/components/gsap/animate-on-scroll"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star } from "lucide-react"
import Link from "next/link"

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
    <section className="bg-gradient-to-b from-gray-50 to-white w-full overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20 bg-gradient-to-b from-slate-600 to-slate-800">
        {/* Enhanced Header Section */}
        <div className="text-center mb-12 md:mb-16">
          <AnimateOnScroll y={20}>
            <div className="inline-flex items-center space-x-2 bg-orange-100 text-accent-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Star className="w-4 h-4 fill-current" />
              <span>Featured Collection</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Handpicked for You
            </h2>
            <p className="text-white text-lg max-w-2xl mx-auto leading-relaxed">
              Discover our most loved products, carefully selected by our team and highly rated by customers
            </p>
          </AnimateOnScroll>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {[...Array(8)].map((_, idx) => (
              <div key={idx} className="group">
                <div className="bg-gray-200 animate-pulse rounded-2xl h-80 sm:h-96 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {featured.map((product, idx) => (
                <div key={product._id} className="w-full h-full">
                  <AnimateOnScroll y={30} delay={idx * 0.08}>
                    <ProductCard product={product} />
                  </AnimateOnScroll>
                </div>
              ))}
            </div>

            {/* View All Products CTA */}
            <AnimateOnScroll y={20} delay={0.4}>
              <div className="text-center mt-16">
                <Link href="/products">
                  <Button 
                    size="lg" 
                    className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    View All Products
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </div>
            </AnimateOnScroll>
          </>
        )}
      </div>
    </section>
  )
}

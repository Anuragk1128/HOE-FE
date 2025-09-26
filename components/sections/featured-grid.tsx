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
            .slice(0, 10)
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
    <section className="w-full bg-gradient-to-b from-gray-300 to-gray-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        {/* Enhanced Header Section */}
        <div className="text-center mb-6 md:mb-8">
          <AnimateOnScroll y={20}>
            <div className="inline-flex items-center space-x-2 bg-orange-100 text-accent-400 px-2 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="w-2 h-2 fill-current" />
              <span>Featured Collection</span>
            </div>
         
          </AnimateOnScroll>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {[...Array(10)].map((_, idx) => (
              <div key={idx} className="group h-full w-full">
                <div className="bg-gray-200 animate-pulse rounded-2xl h-48 sm:h-56 md:h-60 lg:h-64 w-full"></div>
                <div className="space-y-3 mt-4">
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Products Grid - CSS Grid with auto-fit to eliminate empty spaces */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {featured.map((product, idx) => (
                <div key={product._id} className="w-full">
                  <AnimateOnScroll y={30} delay={idx * 0.08}>
                    <div className="h-full w-full">
                      <ProductCard product={product} />
                    </div>
                  </AnimateOnScroll>
                </div>
              ))}
            </div>

            {/* View All Products CTA */}
            <AnimateOnScroll y={20} delay={0.4}>
              <div className="text-center mt-12 md:mt-16">
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

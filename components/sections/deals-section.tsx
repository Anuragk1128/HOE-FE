"use client"

import { useEffect, useState } from 'react'
import { Product } from "@/data/products"
import { ProductCard } from "@/components/products/product-card"
import { AnimateOnScroll } from "@/components/gsap/animate-on-scroll"

export function DealsSection() {
  const [deals, setDeals] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDeals() {
      try {
        const response = await fetch('https://hoe-be.onrender.com/api/products')
        const data = await response.json()
        if (data.success) {
          const saleProducts = data.data
            .filter((p: Product) => p.tags?.includes("sale") || p.status === "active")
            .slice(0, 4)
          setDeals(saleProducts)
        }
      } catch (error) {
        console.error('Failed to fetch deals:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDeals()
  }, [])

  if (loading) {
    return (
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-6">Deals</h2>
          <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!deals.length) return null

  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900">Deals</h2>
        </div>
        <div className="mt-6 grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {deals.map((p, idx) => (
            <AnimateOnScroll key={p._id} y={24} delay={idx * 0.05}>
              <ProductCard product={{
                _id: p._id,
                title: p.title,
                brandId: p.brandId,
                categoryId: p.categoryId,
                price: p.price,
                description: p.description,
                images: p.images,
                stock: p.stock,
                status: p.status,
                tags: p.tags,
                compareAtPrice: p.compareAtPrice,
                attributes: p.attributes,
                subcategoryId: p.subcategoryId,
                slug: p.slug,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
                gstRate: p.gstRate
              }} />
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}

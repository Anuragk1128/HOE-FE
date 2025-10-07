'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Product } from '@/data/products'
import { ProductCard } from '@/components/products/product-card'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('https://hoe-be.onrender.com/api/products')
        const data = await response.json()
        if (data.success) {
          setProducts(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
      }
      setLoading(false)
    }

    fetchProducts()
  }, [])

  const filtered = useMemo(() => {
    const q = (searchParams.get('q') || '').trim().toLowerCase()
    const category = (searchParams.get('category') || '').trim()

    return products.filter((p) => {
      // Only show active products (exclude archived)
      const isActive = p.status === 'active'
      if (!isActive) return false

      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.sku ? p.sku.toLowerCase().includes(q) : false)

      // Category/collection filters
      let matchesCategory = true
      if (category && category !== 'All') {
        const catName = typeof p.categoryId === 'string' ? '' : (p.categoryId?.name || '')
        const inNamedCategory = catName.toLowerCase() === category.toLowerCase()

        const price = p.price || 0
        const inUnder999 = category === 'Under ₹999' && price <= 999
        const inUnder2000 = category === 'Under ₹2000' && price <= 2000
        const inUnder3000 = category === 'Under ₹3000' && price <= 3000

        // Common collections by tag/category keyword
        const keywords = category.toLowerCase()
        const inKeyword =
          p.tags?.some((t) => t.toLowerCase() === keywords) ||
          p.title.toLowerCase().includes(keywords) ||
          catName.toLowerCase().includes(keywords)

        matchesCategory = inNamedCategory || inUnder999 || inUnder2000 || inUnder3000 || inKeyword
      }

      return matchesQuery && matchesCategory
    })
  }, [products, searchParams])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">All Products</h1>
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-baseline justify-between gap-2 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">All Products</h1>
        <div className="text-sm text-slate-600">
          {filtered.length} {filtered.length === 1 ? 'product' : 'products'} found
        </div>
      </div>
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>  
    </div>
  )
}

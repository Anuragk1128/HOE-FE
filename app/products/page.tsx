'use client'

import { useEffect, useState } from 'react'
import { Product } from '@/data/products'
import Link from 'next/link'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <Link href={`/products/${product._id}`} key={product._id}>
            <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img src={product.images[0]} alt={product.title} className="w-full h-64 object-cover" />
              <div className="p-4">
                <h2 className="text-lg font-semibold">{product.title}</h2>
                <p className="text-gray-600 mt-2">${product.price}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

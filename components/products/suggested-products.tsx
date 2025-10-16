'use client'

import { useEffect, useState } from 'react'
import { ProductCard } from './product-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingBag } from 'lucide-react'
import { Product } from '@/data/products'
import { fetchAllProductsByBrand } from '@/lib/api'

interface SuggestedProductsProps {
  currentProduct: Product | null
  currentProductId: string
}

export function SuggestedProducts({ currentProduct, currentProductId }: SuggestedProductsProps) {
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentProduct) return

    const fetchSuggestedProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get current product's brand name
        const brandName = typeof currentProduct.brandId === 'object'
          ? currentProduct.brandId?.name?.toLowerCase()
          : null

        // Map brand names to their slugs
        const brandSlugMap: { [key: string]: string } = {
          'jerseymise': 'sportswear',
          'ira': 'ira'
        }

        const brandSlug = brandName ? brandSlugMap[brandName] : null

        if (!brandSlug) {
          console.log('Brand slug not found for brand:', brandName)
          setSuggestedProducts([])
          return
        }

        // Fetch products using the specific brand endpoint
        const brandProducts = await fetchAllProductsByBrand(brandSlug)

        if (brandProducts && brandProducts.length > 0) {
          // Filter out current product, inactive products, out-of-stock products, and limit to 6
          const filteredProducts = brandProducts
            .filter((p: any) => p._id !== currentProductId)
            .filter((p: any) => {
              // Only show active products with stock
              return (p.isActive === true || p.isActive === undefined) &&
                     (p.status === 'active' || p.status === undefined || p.status === null) &&
                     (p.stock > 0)
            })
            .slice(0, 6)

          // Cast to Product[] for compatibility with ProductCard
          setSuggestedProducts(filteredProducts as Product[])

          console.log(`Found ${filteredProducts.length} active products for brand ${brandSlug} (filtered from ${brandProducts.length} total products)`)
        } else {
          console.log('No products found for brand slug:', brandSlug)
          setSuggestedProducts([])
        }

      } catch (error) {
        console.error('Failed to fetch suggested products:', error)
        setError('Failed to load suggested products')
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestedProducts()
  }, [currentProduct, currentProductId])

  // Get the brand name for the title
  const getBrandName = () => {
    if (typeof currentProduct?.brandId === 'object') {
      return currentProduct.brandId?.name
    }
    return 'this brand'
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">More from {getBrandName()}</h2>
        <p className="text-sm text-gray-600">Loading active products...</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <CardContent className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{error}</p>
      </div>
    )
  }

  // No products state
  if (suggestedProducts.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <ShoppingBag className="w-6 h-6 text-gray-600" />
        <h2 className="text-2xl font-bold text-gray-900">More from {getBrandName()}</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {suggestedProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  )
}

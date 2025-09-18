"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatINR } from "@/lib/utils"
import { Product } from "@/data/products"
import Link from "next/link"
import { useCart } from "@/contexts/cart-context"
import { toast } from "sonner"
import { Heart, ShoppingCart, Star, Eye } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  // Extract brand info directly from product data
  const brand = typeof product.brandId === 'object' && product.brandId !== null
    ? product.brandId as { _id: string; name: string; slug: string }
    : null

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
  const discountPercentage = hasDiscount 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    addToCart(product._id, 1)
    
    toast.success('Added to cart!', {
      position: 'top-center',
      duration: 2000,
      className: 'bg-green-500 text-white'
    })
  }

  return (
    <div className="group h-full">
      <Link href={`/products/${product._id}`} className="block h-full">
        <Card className="h-full flex flex-col overflow-hidden bg-white border-0 shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-2xl">
          {/* Image Section */}
          <div className="relative overflow-hidden rounded-t-2xl">
            <div className="relative aspect-square bg-gray-50">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  className={`object-cover transition-all duration-700 group-hover:scale-110 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-gray-400 text-center">
                    <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <span className="text-sm">No image</span>
                  </div>
                </div>
              )}
              
              {/* Loading skeleton */}
              {!imageLoaded && product.images?.[0] && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 z-10">
                {hasDiscount && (
                  <Badge className="bg-red-500 hover:bg-red-500 text-white font-bold px-2 py-1 rounded-full">
                    -{discountPercentage}%
                  </Badge>
                )}
              </div>

              {/* Action Buttons Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-9 w-9 bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
                    onClick={handleWishlistToggle}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
                  </Button>
                </div>

                {/* Quick Add to Cart - Appears on Hover */}
                <div className="absolute inset-x-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                  <Button
                    className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 rounded-xl shadow-lg backdrop-blur-sm border border-gray-200"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Quick Add
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <CardHeader className="px-4 py-4 pb-2 flex-shrink-0">
            {/* Brand */}
            {brand?.name && (
              <Badge variant="outline" className="text-xs font-medium w-fit mb-2">
                {brand.name}
              </Badge>
            )}

            {/* Product Title */}
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-gray-700 transition-colors">
              {product.title}
            </h3>

            {/* Rating */}
            <div className="flex items-center space-x-1 mt-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3 h-3 ${
                      i < (product.rating || 0) 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                ({product.numReviews || 0})
              </span>
            </div>
          </CardHeader>

          {/* Footer Section */}
          <CardFooter className="px-4 py-4 pt-2 mt-auto">
            <div className="w-full">
              {/* Price */}
              <div className="flex items-baseline space-x-2 mb-3">
                <span className="font-bold text-lg text-gray-900">
                  {formatINR(product.price || 0)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatINR(product.compareAtPrice)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    product.stock && product.stock > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className={`text-xs font-medium ${
                    product.stock && product.stock > 0 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {product.stock && product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                {/* Mobile Add to Cart Button */}
                <Button
                  size="sm"
                  className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium text-xs sm:hidden"
                  onClick={handleAddToCart}
                >
                  Add
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </div>
  )
}

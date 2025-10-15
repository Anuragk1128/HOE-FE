"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatINR } from "@/lib/utils"
import { Product } from "@/data/products"
import Link from "next/link"
import { useCart } from "@/contexts/cart-context"
import { toast } from "sonner"
import { Heart, ShoppingCart, Eye } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import { useWishlist } from "@/contexts/wishlist-context"

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const { addToWishlist, isInWishlist } = useWishlist()
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const brand = typeof product.brandId === 'object' && product.brandId !== null
    ? product.brandId as { _id: string; name: string; slug: string }
    : null

  // GST calculations (same as product page)
  const gstRate = typeof product.gstRate === 'number' ? product.gstRate : 0
  const gstAmount = Math.max(0, (product.price || 0) * (gstRate / 100))
  const totalWithGst = (product.price || 0) + gstAmount

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > totalWithGst
  const discountPercentage = hasDiscount 
    ? Math.round(((product.compareAtPrice - totalWithGst) / product.compareAtPrice) * 100)
    : 0
  
  const isOutOfStock = product.stock <= 0

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      if (isInWishlist(product._id)) {
        toast.info('Already in wishlist')
        return
      }
      await addToWishlist(product._id)
    } catch (err) {
      console.error(err)
      toast.error('Failed to update wishlist')
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isOutOfStock) {
      toast.error('This product is out of stock', {
        position: 'top-center',
        duration: 2000,
        className: 'bg-red-500 text-white'
      })
      return
    }
    
    addToCart(product._id, 1)
    toast.success('Added to cart!', {
      position: 'top-center',
      duration: 2000,
      className: 'bg-green-500 text-white'
    })
  }

  return (
    <div className="group h-full w-full">
      <Link href={`/products/${product._id}`} className="block h-full w-full">
        <div className="h-full w-full flex flex-col bg-white  hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ">
          
          {/* Image Section - Responsive aspect ratio */}
          <div className="relative w-full aspect-square overflow-hidden">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className={`object-cover transition-all duration-700 group-hover:scale-105 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                } ${isOutOfStock ? 'blur-sm' : ''}`}
                onLoad={() => setImageLoaded(true)}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <Eye className="w-8 h-8 text-gray-400" />
              </div>
            )}
            
            {!imageLoaded && product.images?.[0] && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}

            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Badge variant="destructive" className="bg-red-600 text-white font-semibold px-3 py-1">
                  Out of Stock
                </Badge>
              </div>
            )}

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-7 w-7 bg-white/90 hover:bg-white shadow-md"
                  onClick={handleWishlistToggle}
                >
                  <Heart className={`w-3 h-3 ${isInWishlist(product._id) ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
                </Button>
              </div>

              <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <Button
                  className={`w-full font-medium py-1.5 text-xs shadow-md ${
                    isOutOfStock 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-white/95 hover:bg-white text-gray-900'
                  }`}
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                >
                  <ShoppingCart className="w-3 h-3 mr-1.5" />
                  Quick Add
                </Button>
              </div>
            </div>
          </div>

          {/* Content Section - Simplified with only title and price */}
          <div className="flex-1 bg-white p-3 flex flex-col justify-between">
            
            {/* Title - Fixed height for consistency */}
            <div className="mb-3">
              <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-gray-700 transition-colors min-h-[2.5rem]">
                {product.title}
              </h3>
            </div>

            {/* Price */}
            <div className="flex-shrink-0">
              <div className="flex items-baseline space-x-2">
                <span className="font-bold text-base text-gray-900">
                  {formatINR(totalWithGst)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatINR(product.compareAtPrice)}
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>
      </Link>
    </div>
  )
}

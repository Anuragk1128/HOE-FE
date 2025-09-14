"use client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatINR } from "@/lib/utils"
import { Product } from "@/data/products"
import Link from "next/link"

export function ProductCard({ product }: { product: Product }) {
  // Extract brand info directly from product data
  // Handle both string and object types for brandId
  const brand = typeof product.brandId === 'object' && product.brandId !== null 
    ? product.brandId as { _id: string; name: string; slug: string }
    : null;

  return (
    <div className="h-full group">
      <Link href={`/products/${product._id}`} className="block h-full">
        <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:ring-1 hover:ring-blue-200 border-0 shadow-sm bg-white">
          {/* Header Section - Title and Meta Info */}
          <CardHeader className="p-2 sm:p-3 md:p-4 pb-2 space-y-1 sm:space-y-2 flex-shrink-0">
            <CardTitle className="text-xs sm:text-sm md:text-base font-semibold leading-tight text-slate-900">
              <span className="line-clamp-2 h-[2rem] sm:h-[2.5rem] md:h-[3rem] flex items-start">
                {product.title}
              </span>
            </CardTitle>

            {/* Brand Info */}
            <div className="flex items-center justify-between text-xl sm:text-bold text-slate-800 h-4 sm:h-5">
              <div className="flex-1 min-w-0">
                <span className="truncate block">
                  {brand?.name || 'Brand'}
                </span>
              </div>
            </div>
          </CardHeader>

          {/* Content Section - Full Width Image Only */}
          <CardContent className="p-0 flex-grow flex flex-col">
            {/* Full Width Product Image */}
            <div className="relative w-full aspect-square bg-slate-50 overflow-hidden flex-shrink-0">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                  <span className="text-slate-400">No image available</span>
                </div>
              )}
            </div>
          </CardContent>

          {/* Footer Section - Price and Action */}
          <CardFooter className="p-2 sm:p-3 md:p-4 pt-2 sm:pt-3 mt-auto border-t border-slate-100 flex-shrink-0">
            <div className="w-full flex items-center justify-between gap-1 sm:gap-2 md:gap-3 h-8 sm:h-9 md:h-10">
              {/* Price */}
              <div className="flex-shrink-0 min-w-0">
                <span className="font-bold text-sm sm:text-base md:text-lg text-slate-900 tracking-tight">
                  {formatINR(product.price || 0)}
                </span>
              </div>

              {/* Add to Cart Button */}
              <Button
                size="sm"
                className="bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white text-xs sm:text-xs md:text-sm px-2 sm:px-3 md:px-4 h-7 sm:h-8 md:h-9 font-medium transition-colors duration-200 flex-shrink-0 whitespace-nowrap"
                aria-label={`Add ${product.title} to cart`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Add to cart logic here
                  console.log('Adding to cart:', product._id);
                }}
              >
                <span className="hidden sm:inline">Add to cart</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </div>
  )
}

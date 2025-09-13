"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatINR } from "@/lib/utils"
import { Product } from "@/data/products"
import Link from "next/link"

interface Brand {
  _id: string;
  name: string;
}

interface Category {
  _id: string;
  name: string;
}

export function ProductCard({ product }: { product: Product }) {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrandAndCategory = async () => {
      try {
        const [brandRes, categoryRes] = await Promise.all([
          fetch(`https://hoe-be.onrender.com/api/brands/${product.brandId}`),
          fetch(`https://hoe-be.onrender.com/api/categories/${product.categoryId}`)
        ]);

        const [brandData, categoryData] = await Promise.all([
          brandRes.json(),
          categoryRes.json()
        ]);

        if (brandData.success) setBrand(brandData.data);
        if (categoryData.success) setCategory(categoryData.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandAndCategory();
  }, [product.brandId, product.categoryId]);

  return (
    <div className="h-full group">
      <Link href={`/products/${product._id}`} className="block h-full">
        <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:ring-1 hover:ring-blue-200 border-0 shadow-sm bg-white">
          {/* Header Section - Title and Meta Info */}
          <CardHeader className="p-3 md:p-4 pb-2 space-y-2">
            <CardTitle className="text-sm md:text-base font-semibold leading-tight text-slate-900">
              <span className="line-clamp-2 min-h-[2.5rem] md:min-h-[3rem] flex items-start">
                {product.title}
              </span>
            </CardTitle>

            {/* Brand and Category Info */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex-1 min-w-0">
                {loading ? (
                  <div className="h-3 bg-slate-100 rounded w-3/4 animate-pulse"></div>
                ) : (
                  <span className="truncate block">
                    {[brand?.name, category?.name].filter(Boolean).join(' • ') || 'Product'}
                  </span>
                )}
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
          <CardFooter className="p-3 md:p-4 pt-3 mt-auto border-t border-slate-100">
            <div className="w-full flex items-center justify-between gap-3">
              {/* Price */}
              <div className="flex-shrink-0">
                <span className="font-bold text-base md:text-lg text-slate-900 tracking-tight">
                  {formatINR(product.price || 0)}
                </span>
              </div>

              {/* Add to Cart Button */}
              <Button
                size="sm"
                className="bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white text-xs md:text-sm px-3 md:px-4 h-8 md:h-9 font-medium transition-colors duration-200 flex-shrink-0"
                aria-label={`Add ${product.title} to cart`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Add to cart logic here
                  console.log('Adding to cart:', product._id);
                }}
              >
                Add to cart
              </Button>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </div>
  )
}

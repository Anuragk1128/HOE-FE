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
        // Fetch brand
        const brandRes = await fetch(`https://hoe-be.onrender.com/api/brands/${product.brandId}`);
        const brandData = await brandRes.json();
        if (brandData.success) setBrand(brandData.data);

        // Fetch category
        const categoryRes = await fetch(`https://hoe-be.onrender.com/api/categories/${product.categoryId}`);
        const categoryData = await categoryRes.json();
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
        <Card className="h-full flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md hover:ring-2 hover:ring-blue-500">
          <CardHeader className="p-4 sm:p-5 pb-2 sm:pb-3">
            <CardTitle className="text-pretty text-base sm:text-lg font-medium leading-snug line-clamp-2 h-12 flex items-center">
              {product.title}
            </CardTitle>
            <div className="min-h-[20px] text-xs sm:text-sm text-slate-500 mt-1">
              {loading ? (
                <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
              ) : (
                <span className="line-clamp-1">
                  {[brand?.name, category?.name].filter(Boolean).join(' • ') || ' '}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0 pb-3 flex-grow">
            <div className="relative w-full aspect-square bg-gray-50 rounded-md overflow-hidden mb-3 sm:mb-4">
              <img
                src={product.images?.[0] || "/placeholder.svg"}
                alt={product.title}
                className="w-full h-full object-contain p-2 sm:p-4 transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 sm:line-clamp-3 min-h-[2.5rem] sm:min-h-[3.75rem]">
              {product.description || 'No description available.'}
            </p>
          </CardContent>
          <CardFooter className="p-4 sm:p-5 pt-0 mt-auto">
            <div className="w-full flex items-center justify-between">
              <div className="font-bold text-base sm:text-lg text-slate-900">
                {formatINR(product.price || 0)}
              </div>
              <Button 
                asChild
                size="sm" 
                className="bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm px-3 sm:px-4 h-8 sm:h-9 z-10"
                aria-label={`Add ${product.title} to cart`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Add to cart logic here
                }}
              >
                <span>Add to cart</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </div>
  )
}

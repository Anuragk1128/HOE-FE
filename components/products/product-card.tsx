"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatINR } from "@/lib/utils"
import { Product } from "@/data/products"

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-pretty text-base">{product.title}</CardTitle>
        <div className="text-sm text-slate-600">{product.brandId} • {product.categoryId}</div>
      </CardHeader>
      <CardContent>
        <img
          src={product.images?.[0] || "/placeholder.svg"}
          alt={`${product.title} product image`}
          className="w-full h-48 object-contain"
        />
        <p className="mt-3 text-sm text-slate-600 line-clamp-3">{product.description}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="font-semibold text-slate-900">{formatINR(product.price || 0)}</div>
        <Button className="bg-slate-800 hover:bg-slate-700">Add to cart</Button>
      </CardFooter>
    </Card>
  )
}

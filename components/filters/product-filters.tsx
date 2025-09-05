"use client"

import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { formatINR } from "@/lib/utils"

export interface ProductFiltersState {
  brands: string[]
  categories: string[]
  priceMin: number
  priceMax: number
}

const DEFAULT_MIN = 0
const DEFAULT_MAX = 300

interface Brand {
  _id: string;
  name: string;
}

interface Category {
  _id: string;
  name: string;
}

export function ProductFilters({
  onChange,
  initial,
}: {
  onChange: (state: ProductFiltersState) => void
  initial?: Partial<ProductFiltersState>
}) {
  const [brands, setBrands] = useState<string[]>(initial?.brands ?? [])
  const [categories, setCategories] = useState<string[]>(initial?.categories ?? [])
  const [price, setPrice] = useState<number[]>([initial?.priceMin ?? DEFAULT_MIN, initial?.priceMax ?? DEFAULT_MAX])
  const [brandsList, setBrandsList] = useState<Brand[]>([])
  const [categoriesList, setCategoriesList] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFilters() {
      try {
        // Fetch brands
        const brandsResponse = await fetch('https://hoe-be.onrender.com/api/brands')
        const brandsData = await brandsResponse.json()
        if (brandsData.success) {
          setBrandsList(brandsData.data)
        }

        // Fetch categories
        const categoriesResponse = await fetch('https://hoe-be.onrender.com/api/categories')
        const categoriesData = await categoriesResponse.json()
        if (categoriesData.success) {
          setCategoriesList(categoriesData.data)
        }
      } catch (error) {
        console.error('Failed to fetch filters:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFilters()
  }, [])

  useEffect(() => {
    onChange({
      brands,
      categories,
      priceMin: price[0],
      priceMax: price[1],
    })
  }, [brands, categories, price, onChange])

  function toggle(list: string[], value: string, setter: (v: string[]) => void) {
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value])
  }

  function reset() {
    setBrands([])
    setCategories([])
    setPrice([DEFAULT_MIN, DEFAULT_MAX])
  }

  return (
    <aside className="w-full md:w-64 shrink-0 bg-white border rounded-lg p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Filters</h3>
        <Button variant="ghost" onClick={reset} className="text-slate-700">
          Reset
        </Button>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-medium text-slate-700">Brands</h4>
        <div className="space-y-2">
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            brandsList.map((brand) => (
              <div key={brand._id} className="flex items-center gap-2">
                <Checkbox
                  id={`brand-${brand._id}`}
                  checked={brands.includes(brand._id)}
                  onCheckedChange={() => toggle(brands, brand._id, setBrands)}
                />
                <Label htmlFor={`brand-${brand._id}`}>{brand.name}</Label>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-medium text-slate-700">Categories</h4>
        <div className="space-y-2">
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            categoriesList.map((category) => (
              <div key={category._id} className="flex items-center gap-2">
                <Checkbox
                  id={`cat-${category._id}`}
                  checked={categories.includes(category._id)}
                  onCheckedChange={() => toggle(categories, category._id, setCategories)}
                />
                <Label htmlFor={`cat-${category._id}`}>{category.name}</Label>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-medium text-slate-700">Price</h4>
        <div className="px-1">
          <Slider
            min={DEFAULT_MIN}
            max={DEFAULT_MAX}
            step={5}
            value={price}
            onValueChange={(v) => setPrice(v as number[])}
          />
          <div className="mt-2 text-sm text-slate-600">
            {formatINR(price[0], { maximumFractionDigits: 0 })} - {formatINR(price[1], { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>
    </aside>
  )
}

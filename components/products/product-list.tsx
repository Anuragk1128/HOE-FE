"use client"

import { useMemo, useState, useCallback, useEffect } from "react"
import { fetchStorefrontProducts, type AdminProduct, fetchBrands, type Brand, fetchCategoriesByBrandSlug, fetchSubcategoriesByBrandAndCategorySlug } from "@/lib/api"
import { ProductCard } from "./product-card"
import { ProductFilters, type ProductFiltersState } from "@/components/filters/product-filters"

export function ProductList() {
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<ProductFiltersState>({ brands: [], categories: [], priceMin: 0, priceMax: 300 })
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [brandSlug, setBrandSlug] = useState<string>("")
  const [categorySlug, setCategorySlug] = useState<string>("")
  const [subcategorySlug, setSubcategorySlug] = useState<string>("")

  useEffect(() => {
    const load = async () => {
      // Default load: first brand/category/subcategory if available
      const brands = await fetchBrands()
      if (brands.length === 0) return
      setBrandSlug(brands[0].slug)
      const cats = await fetchCategoriesByBrandSlug(brands[0].slug)
      if (cats.length === 0) return
      setCategorySlug(cats[0].slug)
      const subs = await fetchSubcategoriesByBrandAndCategorySlug(brands[0].slug, cats[0].slug)
      if (subs.length === 0) return
      setSubcategorySlug(subs[0].slug)
      const items = await fetchStorefrontProducts({ brand: brands[0].slug, category: cats[0].slug, subcategory: subs[0].slug })
      setProducts(items)
    }
    load().catch(() => setProducts([]))
  }, [])

  useEffect(() => {
    const load = async () => {
      if (!brandSlug || !categorySlug || !subcategorySlug) return
      const items = await fetchStorefrontProducts({ brand: brandSlug, category: categorySlug, subcategory: subcategorySlug })
      setProducts(items)
    }
    load().catch(() => {})
  }, [brandSlug, categorySlug, subcategorySlug])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      const matchesQ = !q || p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
      const matchesBrand = filters.brands.length ? filters.brands.includes(p.brandId?.name || "") : true
      const matchesCat = filters.categories.length ? filters.categories.includes(p.categoryId?.name || "") : true
      const matchesPrice = (p.price || 0) >= filters.priceMin && (p.price || 0) <= filters.priceMax
      return matchesQ && matchesBrand && matchesCat && matchesPrice
    })
  }, [search, filters, products])

  const handleHeaderSearch = useCallback((q: string) => setSearch(q), [])

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      {/* Connected header search via custom event handler */}
      {/* In page.tsx we pass this callback to SiteHeader; using a simple global setter would also work.
          We'll expose a custom event emitter through window for simplicity if needed.
      */}
      <div className="grid grid-cols-1 md:grid-cols-[16rem_1fr] gap-6">
        <ProductFilters onChange={setFilters} />
        <div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold">Products</h2>
            <div className="text-sm text-slate-600">{filtered.length} items</div>
          </div>
          <div className="mt-4 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Helper to bind header search to ProductList without global state libraries
export function createHeaderSearchBinder() {
  let setSearchFn: ((q: string) => void) | null = null
  return {
    register(fn: (q: string) => void) {
      setSearchFn = fn
    },
    trigger(q: string) {
      setSearchFn?.(q)
    },
  }
}

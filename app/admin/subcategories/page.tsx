"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  fetchBrands,
  type Brand,
  fetchCategoriesByBrandSlug,
  type Category,
  fetchSubcategoriesByBrandAndCategorySlug,
  type Subcategory,
  createSubcategory,
} from "@/lib/api"

export default function AdminSubcategoriesPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [brandSlug, setBrandSlug] = useState<string>("")
  const [categories, setCategories] = useState<Category[]>([])
  const [categorySlug, setCategorySlug] = useState<string>("")
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])

  const [loadingBrands, setLoadingBrands] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingSubcategories, setLoadingSubcategories] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [image, setImage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const selectedBrand = useMemo(() => brands.find((b) => b.slug === brandSlug) || null, [brands, brandSlug])
  const selectedCategory = useMemo(
    () => categories.find((c) => c.slug === categorySlug) || null,
    [categories, categorySlug],
  )

  useEffect(() => {
    const run = async () => {
      setLoadingBrands(true)
      setError(null)
      try {
        const b = await fetchBrands()
        setBrands(b)
        if (b.length > 0) setBrandSlug(b[0].slug)
      } catch (err: any) {
        setError(err?.message || "Failed to load brands")
      } finally {
        setLoadingBrands(false)
      }
    }
    run()
  }, [])

  useEffect(() => {
    const run = async () => {
      if (!brandSlug) return
      setLoadingCategories(true)
      setError(null)
      try {
        const cats = await fetchCategoriesByBrandSlug(brandSlug)
        setCategories(cats)
        if (cats.length > 0) setCategorySlug(cats[0].slug)
      } catch (err: any) {
        setError(err?.message || "Failed to load categories")
      } finally {
        setLoadingCategories(false)
      }
    }
    run()
  }, [brandSlug])

  useEffect(() => {
    const run = async () => {
      if (!brandSlug || !categorySlug) return
      setLoadingSubcategories(true)
      setError(null)
      try {
        const subs = await fetchSubcategoriesByBrandAndCategorySlug(brandSlug, categorySlug)
        setSubcategories(subs)
      } catch (err: any) {
        setError(err?.message || "Failed to load subcategories")
      } finally {
        setLoadingSubcategories(false)
      }
    }
    run()
  }, [brandSlug, categorySlug])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!selectedBrand || !selectedCategory) {
      setError("Select a brand and category first")
      return
    }
    if (!name || !slug) {
      setError("Name and slug are required")
      return
    }
    try {
      setSubmitting(true)
      await createSubcategory({
        brandId: selectedBrand._id,
        categoryId: selectedCategory._id,
        name,
        slug,
        image,
      })
      setName("")
      setSlug("")
      setImage("")
      const subs = await fetchSubcategoriesByBrandAndCategorySlug(brandSlug, categorySlug)
      setSubcategories(subs)
      setSuccess("Subcategory created successfully")
    } catch (err: any) {
      setError(err?.message || "Failed to create subcategory")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Subcategories</h1>
      <p className="text-sm text-slate-600">Manage subcategories per category.</p>

      <div className="mt-6 grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Select Brand & Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <select
                  id="brand"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={brandSlug}
                  onChange={(e) => setBrandSlug(e.target.value)}
                  disabled={loadingBrands}
                >
                  {brands.map((b) => (
                    <option key={b._id} value={b.slug}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  disabled={loadingCategories}
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              {loadingSubcategories ? (
                <div className="text-sm text-slate-600">Loading subcategories…</div>
              ) : subcategories.length === 0 ? (
                <div className="text-sm text-slate-600">No subcategories for this category.</div>
              ) : (
                <ul className="space-y-2">
                  {subcategories.map((s) => (
                    <li key={s._id} className="flex items-center justify-between border rounded p-2">
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-slate-600">{s.slug}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Subcategory</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input id="image" value={image} onChange={(e) => setImage(e.target.value)} />
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
              {success && <div className="text-sm text-green-600">{success}</div>}
              <Button type="submit" disabled={submitting || !selectedBrand || !selectedCategory}>
                {submitting ? "Creating..." : "Create subcategory"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



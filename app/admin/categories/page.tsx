"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { fetchBrands, type Brand, fetchCategoriesByBrandSlug, type Category, createCategory } from "@/lib/api"

export default function AdminCategoriesPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [brandSlug, setBrandSlug] = useState<string>("")
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingBrands, setLoadingBrands] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [image, setImage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const selectedBrand = useMemo(() => brands.find((b) => b.slug === brandSlug) || null, [brands, brandSlug])

  useEffect(() => {
    const run = async () => {
      setLoadingBrands(true)
      setError(null)
      try {
        const data = await fetchBrands()
        setBrands(data)
        if (data.length > 0) setBrandSlug(data[0].slug)
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
        const data = await fetchCategoriesByBrandSlug(brandSlug)
        setCategories(data)
      } catch (err: any) {
        setError(err?.message || "Failed to load categories")
      } finally {
        setLoadingCategories(false)
      }
    }
    run()
  }, [brandSlug])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!selectedBrand) {
      setError("Select a brand first")
      return
    }
    if (!name || !slug) {
      setError("Name and slug are required")
      return
    }
    try {
      setSubmitting(true)
      await createCategory({ brandId: selectedBrand._id, name, slug, image })
      setName("")
      setSlug("")
      setImage("")
      const data = await fetchCategoriesByBrandSlug(brandSlug)
      setCategories(data)
      setSuccess("Category created successfully")
    } catch (err: any) {
      setError(err?.message || "Failed to create category")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Categories</h1>
      <p className="text-sm text-slate-600">Manage categories per brand.</p>

      <div className="mt-6 grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Select Brand & Categories</CardTitle>
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

              {loadingCategories ? (
                <div className="text-sm text-slate-600">Loading categories…</div>
              ) : categories.length === 0 ? (
                <div className="text-sm text-slate-600">No categories for this brand.</div>
              ) : (
                <ul className="space-y-2">
                  {categories.map((c) => (
                    <li key={c._id} className="flex items-center justify-between border rounded p-2">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-slate-600">{c.slug}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Category</CardTitle>
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
              <Button type="submit" disabled={submitting || !selectedBrand}>
                {submitting ? "Creating..." : "Create category"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



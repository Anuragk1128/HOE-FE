"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { fetchBrands, type Brand, fetchCategoriesByBrandSlug, type Category, fetchSubcategoriesByBrandAndCategorySlug, type Subcategory, fetchAdminProducts, type AdminProduct, createProduct, updateProduct } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function AdminProductsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [brandSlug, setBrandSlug] = useState<string>("")
  const [categories, setCategories] = useState<Category[]>([])
  const [categorySlug, setCategorySlug] = useState<string>("")
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [subcategorySlug, setSubcategorySlug] = useState<string>("")

  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState("")
  const [creating, setCreating] = useState(false)
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement | null>(null)
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState("")
  const [price, setPrice] = useState<number>(0)
  const [compareAtPrice, setCompareAtPrice] = useState<number>(0)
  const [stock, setStock] = useState<number>(0)
  const [status, setStatus] = useState<string>("active")
  const [tags, setTags] = useState<string>("")
  // Dynamic attributes: array of rows { key, type, value }
  const [attributesRows, setAttributesRows] = useState<Array<{ key: string; type: 'text' | 'list'; value: string }>>([
    { key: "", type: "text", value: "" },
  ])

  const selectedBrand = useMemo(() => brands.find((b) => b.slug === brandSlug) || null, [brands, brandSlug])
  const selectedCategory = useMemo(() => categories.find((c) => c.slug === categorySlug) || null, [categories, categorySlug])

  useEffect(() => {
    const load = async () => {
      setError(null)
      try {
        const b = await fetchBrands()
        setBrands(b)
        if (b.length > 0) setBrandSlug(b[0].slug)
      } catch (err: any) {
        setError(err?.message || "Failed to load brands")
      }
    }
    load()
  }, [])

  useEffect(() => {
    const load = async () => {
      if (!brandSlug) return
      setError(null)
      try {
        const cats = await fetchCategoriesByBrandSlug(brandSlug)
        setCategories(cats)
        if (cats.length > 0) setCategorySlug(cats[0].slug)
      } catch (err: any) {
        setError(err?.message || "Failed to load categories")
      }
    }
    load()
  }, [brandSlug])

  useEffect(() => {
    const load = async () => {
      if (!brandSlug || !categorySlug) return
      setError(null)
      try {
        const subs = await fetchSubcategoriesByBrandAndCategorySlug(brandSlug, categorySlug)
        setSubcategories(subs)
        if (subs.length > 0) setSubcategorySlug(subs[0].slug)
      } catch (err: any) {
        setError(err?.message || "Failed to load subcategories")
      }
    }
    load()
  }, [brandSlug, categorySlug])

  useEffect(() => {
    const load = async () => {
      if (!brandSlug || !categorySlug || !subcategorySlug) return
      setLoading(true)
      setError(null)
      try {
        const items = await fetchAdminProducts({ brand: brandSlug, category: categorySlug, subcategory: subcategorySlug })
        setProducts(items)
      } catch (err: any) {
        setError(err?.message || "Failed to load products")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [brandSlug, categorySlug, subcategorySlug])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return products
    return products.filter((p) => p.title.toLowerCase().includes(query) || p.slug.toLowerCase().includes(query))
  }, [products, q])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Products</h1>
      <p className="text-sm text-slate-600">View products by brand/category/subcategory.</p>

      <div className="mt-6 grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <select id="brand" className="w-full border rounded px-3 py-2 text-sm" value={brandSlug} onChange={(e) => setBrandSlug(e.target.value)}>
                  {brands.map((b) => (
                    <option key={b._id} value={b.slug}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select id="category" className="w-full border rounded px-3 py-2 text-sm" value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)}>
                  {categories.map((c) => (
                    <option key={c._id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <select id="subcategory" className="w-full border rounded px-3 py-2 text-sm" value={subcategorySlug} onChange={(e) => setSubcategorySlug(e.target.value)}>
                  {subcategories.map((s) => (
                    <option key={s._id} value={s.slug}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="q">Search</Label>
                <Input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or slug" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-sm text-slate-600">Loading…</div>
              ) : error ? (
                <div className="text-sm text-red-600">{error}</div>
              ) : filtered.length === 0 ? (
                <div className="text-sm text-slate-600">No products found.</div>
              ) : (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.map((p) => (
                    <li key={p._id} className="border rounded p-3 flex gap-3">
                      <img
                        src={p.images?.[0] || "/placeholder.svg"}
                        alt=""
                        className="w-20 h-20 object-cover border rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "/placeholder.svg";
                        }}
                      />
                      <div className="min-w-0">
                        <div className="font-medium truncate">{p.title}</div>
                        <div className="text-xs text-slate-600 truncate">{p.slug}</div>
                        <div className="text-sm mt-1">₹ {p.price}</div>
                        <div className="text-xs text-slate-600 mt-1 truncate">
                          {p.brandId.name} • {p.categoryId.name} • {p.subcategoryId.name}
                        </div>
                        <div className="mt-2 flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              // populate form with product data
                              setEditingProduct(p)
                              // ensure filters reflect the product being edited
                              setBrandSlug(p.brandId.slug)
                              setCategorySlug(p.categoryId.slug)
                              setSubcategorySlug(p.subcategoryId.slug)
                              setTitle(p.title || "")
                              setSlug(p.slug || "")
                              setDescription(p.description || "")
                              setImage((p.images || []).join(", "))
                              setPrice(p.price || 0)
                              setCompareAtPrice(p.compareAtPrice || 0)
                              setStock(p.stock || 0)
                              setStatus(p.status || "active")
                              setTags((p.tags || []).join(", "))
                              const attrs = (p.attributes || {}) as Record<string, unknown>
                              const rows: Array<{ key: string; type: 'text' | 'list'; value: string }> = []
                              Object.entries(attrs).forEach(([k, v]) => {
                                if (Array.isArray(v)) {
                                  rows.push({ key: k, type: 'list', value: (v as string[]).join(", ") })
                                } else if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
                                  rows.push({ key: k, type: 'text', value: String(v) })
                                }
                              })
                              setAttributesRows(rows.length ? rows : [{ key: "", type: "text", value: "" }])
                              setSuccess(null)
                              setError(null)
                              // scroll to form for better UX
                              setTimeout(() => {
                                formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                              }, 0)
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{editingProduct ? `Edit Product` : `Create Product`}</CardTitle>
              {editingProduct && (
                <div className="text-sm text-slate-600">Editing: <span className="font-medium">{editingProduct.title}</span></div>
              )}
            </CardHeader>
            <CardContent>
              <form
                ref={formRef}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                onSubmit={async (e) => {
                  e.preventDefault()
                  setError(null)
                  setSuccess(null)
                  // only enforce selection when creating new
                  if (!editingProduct && (!selectedBrand || !selectedCategory || !subcategorySlug)) {
                    setError("Select brand, category and subcategory first")
                    return
                  }
                  try {
                    setCreating(true)
                    const sub = subcategories.find((s) => s.slug === subcategorySlug)
                    if (!editingProduct && !sub) throw new Error("Subcategory not found")
                    const payloadCommon = {
                      title,
                      slug,
                      description,
                      images: image
                        ? image
                            .split(",")
                            .map((u) => u.trim())
                            .filter(Boolean)
                        : [],
                      price: Number(price) || 0,
                      compareAtPrice: Number(compareAtPrice) || 0,
                      attributes: attributesRows.reduce<Record<string, unknown>>((acc, row) => {
                        const key = row.key.trim()
                        if (!key) return acc
                        if (row.type === 'list') {
                          const list = row.value
                            .split(',')
                            .map((t) => t.trim())
                            .filter(Boolean)
                          if (list.length) acc[key] = list
                        } else {
                          const v = row.value.trim()
                          if (v) acc[key] = v
                        }
                        return acc
                      }, {}),
                      stock: Number(stock) || 0,
                      status,
                      tags: tags
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    }

                    if (editingProduct) {
                      await updateProduct({
                        brandId: editingProduct.brandId._id,
                        categoryId: editingProduct.categoryId._id,
                        subcategoryId: editingProduct.subcategoryId._id,
                        productId: editingProduct._id,
                        payload: payloadCommon,
                      })
                    } else {
                      await createProduct({
                        brandId: selectedBrand!._id,
                        categoryId: selectedCategory!._id,
                        subcategoryId: sub!._id,
                        ...payloadCommon,
                      })
                    }
                    setTitle("")
                    setSlug("")
                    setDescription("")
                    setImage("")
                    setPrice(0)
                    setCompareAtPrice(0)
                    setStock(0)
                    setStatus("active")
                    setTags("")
                    setAttributesRows([{ key: "", type: "text", value: "" }])
                    setEditingProduct(null)
                    // refresh list using either current filters or the edited product's slugs
                    const refreshBrand = editingProduct ? editingProduct.brandId.slug : brandSlug
                    const refreshCategory = editingProduct ? editingProduct.categoryId.slug : categorySlug
                    const refreshSubcat = editingProduct ? editingProduct.subcategoryId.slug : subcategorySlug
                    const items = await fetchAdminProducts({ brand: refreshBrand, category: refreshCategory, subcategory: refreshSubcat })
                    setProducts(items)
                    setSuccess(editingProduct ? "Product updated successfully" : "Product created successfully")
                  } catch (err: any) {
                    setError(err?.message || (editingProduct ? "Failed to update product" : "Failed to create product"))
                  } finally {
                    setCreating(false)
                  }
                }}
              >
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="image">Image URLs (comma separated)</Label>
                  <Input id="image" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://.../img1.jpg, https://.../img2.jpg" />
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
                </div>
                <div>
                  <Label htmlFor="compareAtPrice">Compare At Price</Label>
                  <Input id="compareAtPrice" type="number" value={compareAtPrice} onChange={(e) => setCompareAtPrice(Number(e.target.value))} />
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input id="stock" type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select id="status" className="w-full border rounded px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="active">active</option>
                    <option value="draft">draft</option>
                    <option value="archived">archived</option>
                  </select>
                </div>
                {/* Attributes Section (Dynamic) */}
                <div className="md:col-span-2 mt-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Attributes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {attributesRows.map((row, idx) => (
                          <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                            <div className="md:col-span-4">
                              <Label htmlFor={`attr-key-${idx}`}>Key</Label>
                              <Input id={`attr-key-${idx}`} value={row.key} onChange={(e) => {
                                const v = e.target.value; setAttributesRows((prev) => prev.map((r, i) => i === idx ? { ...r, key: v } : r))
                              }} placeholder="e.g. size, color, material" />
                            </div>
                            <div className="md:col-span-3">
                              <Label htmlFor={`attr-type-${idx}`}>Type</Label>
                              <select
                                id={`attr-type-${idx}`}
                                className="w-full border rounded px-3 py-2 text-sm"
                                value={row.type}
                                onChange={(e) => {
                                  const v = (e.target.value as 'text'|'list');
                                  setAttributesRows((prev) => prev.map((r, i) => i === idx ? { ...r, type: v } : r))
                                }}
                              >
                                <option value="text">text</option>
                                <option value="list">list</option>
                              </select>
                            </div>
                            <div className="md:col-span-4">
                              <Label htmlFor={`attr-value-${idx}`}>{row.type === 'list' ? 'Value (comma separated)' : 'Value'}</Label>
                              <Input id={`attr-value-${idx}`} value={row.value} onChange={(e) => {
                                const v = e.target.value; setAttributesRows((prev) => prev.map((r, i) => i === idx ? { ...r, value: v } : r))
                              }} placeholder={row.type === 'list' ? 'S, M, L, XL' : 'e.g. 100% Cotton'} />
                            </div>
                            <div className="md:col-span-1 flex items-end">
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setAttributesRows((prev) => prev.filter((_, i) => i !== idx))}
                                disabled={attributesRows.length === 1}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                        <div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setAttributesRows((prev) => [...prev, { key: "", type: "text", value: "" }])}
                          >
                            Add attribute
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
                </div>
                {error && <div className="md:col-span-2 text-sm text-red-600">{error}</div>}
                {success && <div className="md:col-span-2 text-sm text-green-600">{success}</div>}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-3">
                    <Button type="submit" disabled={creating}>
                      {creating ? (editingProduct ? "Updating..." : "Creating...") : (editingProduct ? "Update product" : "Create product")}
                    </Button>
                    {editingProduct && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setEditingProduct(null)
                          setTitle("")
                          setSlug("")
                          setDescription("")
                          setImage("")
                          setPrice(0)
                          setCompareAtPrice(0)
                          setStock(0)
                          setStatus("active")
                          setTags("")
                          setAttributesRows([{ key: "", type: "text", value: "" }])
                          setError(null)
                          setSuccess(null)
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}



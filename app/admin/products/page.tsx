"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { fetchBrands, type Brand, fetchCategoriesByBrandSlug, type Category, fetchSubcategoriesByBrandAndCategorySlug, type Subcategory, fetchAdminProducts, type AdminProduct, createProduct, updateProduct, deleteProduct } from "@/lib/api"
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
  const [deletingId, setDeletingId] = useState<string | null>(null)
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
  // New Product Schema Fields
  const [sku, setSku] = useState<string>("")
  const [shippingCategory, setShippingCategory] = useState<string>("general")
  const [weightKg, setWeightKg] = useState<number>(0.5)
  const [dimensionsLength, setDimensionsLength] = useState<number>(15)
  const [dimensionsBreadth, setDimensionsBreadth] = useState<number>(10)
  const [dimensionsHeight, setDimensionsHeight] = useState<number>(5)
  const [hsnCode, setHsnCode] = useState<string>("")
  const [gstRate, setGstRate] = useState<number>(12)
  const [productType, setProductType] = useState<string>("artificial-jewellery")
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5)
  const [isActive, setIsActive] = useState<boolean>(true)
  const [vendorId, setVendorId] = useState<string>("")
  const [featured, setFeatured] = useState<boolean>(false)
  const [bestseller, setBestseller] = useState<boolean>(false)
  const [newArrival, setNewArrival] = useState<boolean>(false)
  const [onSale, setOnSale] = useState<boolean>(false)
  const [metaTitle, setMetaTitle] = useState<string>("")
  const [metaDescription, setMetaDescription] = useState<string>("")
  const [metaKeywords, setMetaKeywords] = useState<string>("")
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
                              // Set new fields
                              setSku(p.sku || "")
                              setShippingCategory(p.shippingCategory || "general")
                              setWeightKg(p.weightKg || 0.5)
                              setDimensionsLength(p.dimensionsCm?.length || 15)
                              setDimensionsBreadth(p.dimensionsCm?.breadth || 10)
                              setDimensionsHeight(p.dimensionsCm?.height || 5)
                              setHsnCode(p.hsnCode || "")
                              setGstRate(p.gstRate || 12)
                              setProductType(p.productType || "artificial-jewellery")
                              setLowStockThreshold(p.lowStockThreshold || 5)
                              setIsActive(p.isActive ?? true)
                              setVendorId(p.vendorId || "")
                              setFeatured(p.featured || false)
                              setBestseller(p.bestseller || false)
                              setNewArrival(p.newArrival || false)
                              setOnSale(p.onSale || false)
                              setMetaTitle(p.metaTitle || "")
                              setMetaDescription(p.metaDescription || "")
                              setMetaKeywords((p.metaKeywords || []).join(", "))
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
                          <Button
                            type="button"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            disabled={deletingId === p._id}
                            onClick={async () => {
                              setError(null)
                              setSuccess(null)
                              const ok = window.confirm(`Delete product "${p.title}"? This cannot be undone.`)
                              if (!ok) return
                              try {
                                setDeletingId(p._id)
                                await deleteProduct({
                                  brandId: p.brandId._id,
                                  categoryId: p.categoryId._id,
                                  subcategoryId: p.subcategoryId._id,
                                  productId: p._id,
                                })
                                // If we were editing this product, reset the form
                                if (editingProduct && editingProduct._id === p._id) {
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
                                  setSku("")
                                  setShippingCategory("general")
                                  setWeightKg(0.5)
                                  setDimensionsLength(15)
                                  setDimensionsBreadth(10)
                                  setDimensionsHeight(5)
                                  setHsnCode("")
                                  setGstRate(12)
                                  setProductType("artificial-jewellery")
                                  setLowStockThreshold(5)
                                  setIsActive(true)
                                  setVendorId("")
                                  setFeatured(false)
                                  setBestseller(false)
                                  setNewArrival(false)
                                  setOnSale(false)
                                  setMetaTitle("")
                                  setMetaDescription("")
                                  setMetaKeywords("")
                                  setAttributesRows([{ key: "", type: "text", value: "" }])
                                }
                                // Refresh products with current filters
                                const items = await fetchAdminProducts({ brand: brandSlug, category: categorySlug, subcategory: subcategorySlug })
                                setProducts(items)
                                setSuccess("Product deleted successfully")
                              } catch (err: any) {
                                setError(err?.message || "Failed to delete product")
                              } finally {
                                setDeletingId(null)
                              }
                            }}
                          >
                            {deletingId === p._id ? "Deleting..." : "Delete"}
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
                      // New Product Schema Fields
                      sku: sku.trim() || undefined,
                      shippingCategory,
                      weightKg: Number(weightKg) || 0.5,
                      dimensionsCm: {
                        length: Number(dimensionsLength) || 15,
                        breadth: Number(dimensionsBreadth) || 10,
                        height: Number(dimensionsHeight) || 5,
                      },
                      hsnCode: hsnCode.trim() || undefined,
                      gstRate: Number(gstRate) || 12,
                      productType,
                      lowStockThreshold: Number(lowStockThreshold) || 5,
                      isActive,
                      vendorId: vendorId.trim() || undefined,
                      featured,
                      bestseller,
                      newArrival,
                      onSale,
                      metaTitle: metaTitle.trim() || undefined,
                      metaDescription: metaDescription.trim() || undefined,
                      metaKeywords: metaKeywords
                        .split(",")
                        .map((k) => k.trim())
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
                    // Reset new fields
                    setSku("")
                    setShippingCategory("general")
                    setWeightKg(0.5)
                    setDimensionsLength(15)
                    setDimensionsBreadth(10)
                    setDimensionsHeight(5)
                    setHsnCode("")
                    setGstRate(12)
                    setProductType("artificial-jewellery")
                    setLowStockThreshold(5)
                    setIsActive(true)
                    setVendorId("")
                    setFeatured(false)
                    setBestseller(false)
                    setNewArrival(false)
                    setOnSale(false)
                    setMetaTitle("")
                    setMetaDescription("")
                    setMetaKeywords("")
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

                {/* New Product Schema Fields */}
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Product Details & Shipping</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="sku">SKU</Label>
                          <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Auto-generated if empty" />
                        </div>
                        <div>
                          <Label htmlFor="shippingCategory">Shipping Category</Label>
                          <select id="shippingCategory" className="w-full border rounded px-3 py-2 text-sm" value={shippingCategory} onChange={(e) => setShippingCategory(e.target.value)}>
                            <option value="artificial-jewellery">Artificial Jewellery</option>
                            <option value="earrings">Earrings</option>
                            <option value="necklaces">Necklaces</option>
                            <option value="bracelets">Bracelets</option>
                            <option value="bangles">Bangles</option>
                            <option value="rings">Rings</option>
                            <option value="clothes">Clothes</option>
                            <option value="knitted-clothes">Knitted Clothes</option>
                            <option value="textiles">Textiles</option>
                            <option value="accessories">Accessories</option>
                            <option value="general">General</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="weightKg">Weight (kg)</Label>
                          <Input id="weightKg" type="number" step="0.1" value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} />
                        </div>
                        <div>
                          <Label htmlFor="productType">Product Type</Label>
                          <select id="productType" className="w-full border rounded px-3 py-2 text-sm" value={productType} onChange={(e) => setProductType(e.target.value)}>
                            <option value="artificial-jewellery">Artificial Jewellery</option>
                            <option value="imitation-jewellery">Imitation Jewellery</option>
                            <option value="fashion-jewellery">Fashion Jewellery</option>
                            <option value="clothing">Clothing</option>
                            <option value="accessories">Accessories</option>
                            <option value="textiles">Textiles</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="dimensionsLength">Length (cm)</Label>
                          <Input id="dimensionsLength" type="number" value={dimensionsLength} onChange={(e) => setDimensionsLength(Number(e.target.value))} />
                        </div>
                        <div>
                          <Label htmlFor="dimensionsBreadth">Breadth (cm)</Label>
                          <Input id="dimensionsBreadth" type="number" value={dimensionsBreadth} onChange={(e) => setDimensionsBreadth(Number(e.target.value))} />
                        </div>
                        <div>
                          <Label htmlFor="dimensionsHeight">Height (cm)</Label>
                          <Input id="dimensionsHeight" type="number" value={dimensionsHeight} onChange={(e) => setDimensionsHeight(Number(e.target.value))} />
                        </div>
                        <div>
                          <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                          <Input id="lowStockThreshold" type="number" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(Number(e.target.value))} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Tax & Compliance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="hsnCode">HSN Code</Label>
                          <Input id="hsnCode" value={hsnCode} onChange={(e) => setHsnCode(e.target.value)} placeholder="Auto-calculated if empty" />
                        </div>
                        <div>
                          <Label htmlFor="gstRate">GST Rate (%)</Label>
                          <Input id="gstRate" type="number" min="0" max="28" value={gstRate} onChange={(e) => setGstRate(Number(e.target.value))} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Business & Marketing</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="vendorId">Vendor ID</Label>
                          <Input id="vendorId" value={vendorId} onChange={(e) => setVendorId(e.target.value)} />
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center">
                            <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="mr-2" />
                            <Label htmlFor="isActive">Active</Label>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" id="featured" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="mr-2" />
                            <Label htmlFor="featured">Featured</Label>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" id="bestseller" checked={bestseller} onChange={(e) => setBestseller(e.target.checked)} className="mr-2" />
                            <Label htmlFor="bestseller">Bestseller</Label>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" id="newArrival" checked={newArrival} onChange={(e) => setNewArrival(e.target.checked)} className="mr-2" />
                            <Label htmlFor="newArrival">New Arrival</Label>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" id="onSale" checked={onSale} onChange={(e) => setOnSale(e.target.checked)} className="mr-2" />
                            <Label htmlFor="onSale">On Sale</Label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">SEO & Meta</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="metaTitle">Meta Title</Label>
                          <Input id="metaTitle" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
                        </div>
                        <div>
                          <Label htmlFor="metaDescription">Meta Description</Label>
                          <Input id="metaDescription" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
                        </div>
                        <div>
                          <Label htmlFor="metaKeywords">Meta Keywords (comma separated)</Label>
                          <Input id="metaKeywords" value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                          // Reset new fields
                          setSku("")
                          setShippingCategory("general")
                          setWeightKg(0.5)
                          setDimensionsLength(15)
                          setDimensionsBreadth(10)
                          setDimensionsHeight(5)
                          setHsnCode("")
                          setGstRate(12)
                          setProductType("artificial-jewellery")
                          setLowStockThreshold(5)
                          setIsActive(true)
                          setVendorId("")
                          setFeatured(false)
                          setBestseller(false)
                          setNewArrival(false)
                          setOnSale(false)
                          setMetaTitle("")
                          setMetaDescription("")
                          setMetaKeywords("")
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



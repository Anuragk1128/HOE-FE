"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { createBrand, fetchBrands, type Brand } from "@/lib/api"

export default function AdminBrandsPage() {
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [active, setActive] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(false)

  const loadBrands = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchBrands()
      setBrands(data)
    } catch (err: any) {
      setError(err?.message || "Failed to load brands")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBrands()
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!name || !slug) {
      setError("Name and slug are required")
      return
    }
    try {
      setSubmitting(true)
      await createBrand({ name, slug, description, active })
      setSuccess("Brand created successfully")
      setName("")
      setSlug("")
      setDescription("")
      setActive(true)
      await loadBrands()
    } catch (err: any) {
      setError(err?.message || "Failed to create brand")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Brands</h1>
      <p className="text-sm text-slate-600">Create and manage brands.</p>

      <div className="mt-6 grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Brand</CardTitle>
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
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <input id="active" type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                <Label htmlFor="active">Active</Label>
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
              {success && <div className="text-sm text-green-600">{success}</div>}
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create brand"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Brands</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-slate-600">Loading…</div>
            ) : brands.length === 0 ? (
              <div className="text-sm text-slate-600">No brands yet.</div>
            ) : (
              <ul className="space-y-2">
                {brands.map((b) => (
                  <li key={b._id} className="flex items-center justify-between border rounded p-2">
                    <div>
                      <div className="font-medium">{b.name}</div>
                      <div className="text-xs text-slate-600">{b.slug}</div>
                    </div>
                    <div className="text-xs text-slate-600 max-w-[360px] truncate">{b.description}</div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { bulkUploadProducts, type BulkUploadResponse } from "@/lib/api"

export default function BulkUploadProductsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [result, setResult] = useState<BulkUploadResponse | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setResult(null)
    if (!file) {
      setError("Please select an Excel file to upload")
      return
    }
    try {
      setUploading(true)
      const res = await bulkUploadProducts(file)
      setResult(res)
      setSuccess(`Uploaded ${res.filename}. ${res.summary.successful}/${res.summary.total} succeeded.`)
    } catch (err: any) {
      setError(err?.message || "Failed to upload file")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Bulk Upload Products</h1>
      <p className="text-sm text-slate-600">Upload an Excel (.xlsx) file to create products in bulk.</p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <Label htmlFor="productFile">Excel File (.xlsx)</Label>
              <Input
                id="productFile"
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-slate-500 mt-1">Ensure your sheet follows the required column format for brand, category, subcategory, and product fields.</p>
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            {success && <div className="text-sm text-green-600">{success}</div>}
            <div>
              <Button type="submit" disabled={uploading || !file}>
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Upload Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div className="mb-2">Filename: <span className="font-medium">{result.filename}</span></div>
              <div className="mb-4">Total: {result.summary.total} • Successful: <span className="text-green-700">{result.summary.successful}</span> • Failed: <span className="text-red-700">{result.summary.failed}</span></div>

              {result.errors?.length ? (
                <div className="mb-4">
                  <div className="font-medium mb-1">Errors</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {result.errors.map((e, idx) => (
                      <li key={idx} className="text-red-700">{e}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div>
                <div className="font-medium mb-2">Row Results</div>
                <div className="overflow-auto">
                  <table className="w-full text-sm border">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-2 border">Row</th>
                        <th className="text-left p-2 border">Status</th>
                        <th className="text-left p-2 border">Product ID</th>
                        <th className="text-left p-2 border">Title</th>
                        <th className="text-left p-2 border">Brand</th>
                        <th className="text-left p-2 border">Category</th>
                        <th className="text-left p-2 border">Subcategory</th>
                        <th className="text-left p-2 border">Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.results.map((r, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-2 border">{r.row}</td>
                          <td className={`p-2 border ${r.success ? 'text-green-700' : 'text-red-700'}`}>{r.success ? 'Success' : 'Failed'}</td>
                          <td className="p-2 border">{r.productId || '-'}</td>
                          <td className="p-2 border">{r.title || '-'}</td>
                          <td className="p-2 border">{r.brand || '-'}</td>
                          <td className="p-2 border">{r.category || '-'}</td>
                          <td className="p-2 border">{r.subcategory || '-'}</td>
                          <td className="p-2 border">{r.error || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

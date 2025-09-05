"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useState } from "react"

export function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  const [q, setQ] = useState("")
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        onSearch(q)
      }}
    >
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products..." className="h-10" />
      <Button type="submit" className="bg-amber-400 text-slate-900 hover:bg-amber-300">
        <Search className="mr-2 h-4 w-4" /> Search
      </Button>
    </form>
  )
}

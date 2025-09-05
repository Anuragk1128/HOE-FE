"use client"

import { useEffect, useState } from 'react'
import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react"

interface Category {
  _id: string
  name: string
}

interface Brand {
  _id: string
  name: string
}

export default function Footer() {
  const year = new Date().getFullYear()
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch categories
        const categoriesResponse = await fetch('https://hoe-be.onrender.com/api/categories')
        const categoriesData = await categoriesResponse.json()
        if (categoriesData.success) {
          setCategories(categoriesData.data)
        }

        // Fetch brands
        const brandsResponse = await fetch('https://hoe-be.onrender.com/api/brands')
        const brandsData = await brandsResponse.json()
        if (brandsData.success) {
          setBrands(brandsData.data)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])
  return (
    <footer className="bg-slate-900 text-slate-200 mt-8 border-t border-slate-800" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <Image src="/logo.png" alt="HOE" width={32} height={32} />
              <span className="text-lg font-semibold tracking-wide">HOE</span>
            </Link>
            <p className="mt-3 text-sm text-slate-400">Quality gear and apparel curated from top brands.</p>
            <div className="mt-4 flex items-center gap-3">
              <Link aria-label="Follow on Twitter" href="#" className="hover:text-white">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link aria-label="Follow on Instagram" href="#" className="hover:text-white">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link aria-label="Follow on Facebook" href="#" className="hover:text-white">
                <Facebook className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold text-white">Shop</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/" className="text-slate-300 hover:text-white">Home</Link>
              </li>
              <li>
                <Link href="/categories" className="text-slate-300 hover:text-white">Categories</Link>
              </li>
              <li>
                <Link href="/brands" className="text-slate-300 hover:text-white">Brands</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white">Top Categories</h3>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {loading ? (
                // Skeleton loader while loading
                [...Array(6)].map((_, i) => (
                  <li key={i} className="h-5 bg-slate-800 rounded animate-pulse"></li>
                ))
              ) : (
                categories.slice(0, 6).map((category) => (
                  <li key={category._id}>
                    <Link 
                      href={`/categories/${category._id}`} 
                      className="text-slate-300 hover:text-white"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Brands / Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white">Top Brands</h3>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {loading ? (
                // Skeleton loader while loading
                [...Array(6)].map((_, i) => (
                  <li key={i} className="h-5 bg-slate-800 rounded animate-pulse"></li>
                ))
              ) : (
                brands.slice(0, 6).map((brand) => (
                  <li key={brand._id}>
                    <Link 
                      href={`/brands/${brand._id}`} 
                      className="text-slate-300 hover:text-white"
                    >
                      {brand.name}
                    </Link>
                  </li>
                ))
              )}
            </ul>
            <div className="mt-5 space-y-2 text-sm">
              <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4" /> Noida, IN</div>
              <div className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4" /> admin@houseofevolve.in</div>
              <div className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4" /> +91 98765 43210</div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-3">
          <p> {year} HOE. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-white">Privacy</Link>
            <Link href="#" className="hover:text-white">Terms</Link>
            <Link href="#" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
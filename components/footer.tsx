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
        const categoriesResponse = await fetch('https://hoe-be.onrender.com/api/brands/ira/categories')
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
    <footer className="bg-slate-800 text-slate-100 border-t border-slate-700" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Image src="/logo.png" alt="HOE" width={40} height={40} />
              <span className="text-2xl font-bold text-white">HOE</span>
            </div>
            <p className="text-sm text-slate-300 mb-6">Quality gear and apparel curated from top brands.</p>
            <div className="flex space-x-4">
              {[Facebook, Instagram, Twitter].map((Icon, index) => (
                <Link
                  key={index}
                  href="https://www.instagram.com/house_of_evolve/" target="_blank"
                  className="text-slate-400 hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Shop</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-slate-300 hover:text-white">Home</Link>
              </li>
              <li>
                <Link href="/categories" className="text-sm text-slate-300 hover:text-white">Categories</Link>
              </li>
              <li>
                <Link href="/brands" className="text-sm text-slate-300 hover:text-white">Brands</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Categories
              </h3>
              <ul className="text-sm text-slate-300 hover:text-white space-y-2">
                <li>
                <Link href="/collections/bangles" className="text-sm text-slate-300 hover:text-white">Bangles
                </Link>
                </li>
  
                <li>
                <Link href="/collections/necklaces" className="text-sm text-slate-300 hover:text-white">Necklaces
                </Link>
                </li>
                <li>
                <Link href="/collections/sportswear" className="text-sm text-slate-300 hover:text-white">Sportswear
                </Link>
                </li>
                <li>
                <Link href="/collections/earrings" className="text-sm text-slate-300 hover:text-white">Earrings
                </Link>
                </li>
              </ul>
            </div>

          {/* Brands */}
          
        </div>

        {/* Contact and Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center text-sm text-slate-400">
                <MapPin className="h-5 w-5 text-slate-400 mr-2" />
                <span>Noida, IN</span>
              </div>
              <div className="flex items-center text-sm text-slate-400">
                <Mail className="h-5 w-5 text-slate-400 mr-2" />
                <a href="mailto:admin@houseofevolve.in" className="hover:text-white">
                  admin@houseofevolve.in
                </a>
              </div>
              <div className="flex items-center text-sm text-slate-400">
                <Phone className="h-5 w-5 text-slate-400 mr-2" />
                <a href="tel:+918882540885" className="hover:text-white">
                  +91 88825 40885
                </a>
              </div>
            </div>
            <div className="mt-2 md:mt-0 flex items-center flex-wrap gap-x-6 gap-y-2">
              <p className="text-sm text-slate-400">
                &copy; {year} HOE. All rights reserved.
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <Link href="/privacy-policy" className="text-sm text-slate-300 hover:text-white">
                  Privacy
                </Link>
               
                <Link href="/contact-us" className="text-sm text-slate-300 hover:text-white">
                  Contact
                </Link>
                <Link href="/about" className="text-sm text-slate-300 hover:text-white">
                  About
                </Link>
                <Link href="/shipping-policy" className="text-sm text-slate-300 hover:text-white">
                  Shipping Policy
                </Link>
                <Link href="/cancellation-refunds" className="text-sm text-slate-300 hover:text-white">
                  Cancellation & Refunds
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
"use client"
import { Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { ChevronDown, ChevronUp, LogIn, LogOut, MapPin, Menu, Search, User as UserIcon, X } from "lucide-react"
import { AuthModal } from "@/components/auth/auth-modal"
import { useAuth } from "@/components/auth/auth-provider"
import { CartIcon } from "@/components/cart-icon"

export function SiteHeader({
  onSearch,
}: {
  onSearch?: (q: string) => void
}) {
  const [query, setQuery] = useState("")
  const [authOpen, setAuthOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const { user, logout } = useAuth()

  // Collection-based categories
  const categories = [
    "All",
    "Under ₹999",
    "Under ₹2000",
    "Under ₹3000",
    "Gymwear",
    "Necklaces",
    "Earrings",
    "Sportswear",
    "Bangles"
  ]

  // Collection mapping to URLs
  const getCategoryUrl = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      "All": "/categories",
      "Under ₹999": "/collections/under-999",
      "Under ₹2000": "/collections/under-2000",
      "Under ₹3000": "/collections/under-3000",
      "Gymwear": "/collections/gymwear",
      "Necklaces": "/collections/necklaces",
      "Earrings": "/collections/earrings",
      "Sportswear": "/collections/sportswear",
      "Bangles": "/collections/bangles"
    }
    return categoryMap[category] || "/categories"
  }


  return (
    <>
      <header className="w-full relative">
        {/* Top ribbon: logo, search and auth - Sticky */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-slate-800 text-white">
          <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-1 gap-4">
              {/* Logo */}
              <Link href="/" aria-label="Home" className="flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={80}
                  height={40}
                  priority
                  className="h-10 w-auto"
                />
              </Link>

              {/* Location & Delivery */}
              <div className="hidden md:flex flex-col ml-4 px-3 py-1.5 rounded cursor-pointer group">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-white/80 group-hover:text-amber-300" />
                  <span className="ml-1 text-xs text-white/80 group-hover:text-amber-300">Deliver to</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-white">Noida 201301</span>
                  <ChevronDown className="h-4 w-4 text-white/80 group-hover:text-amber-300 ml-0.5" />
                </div>
              </div>
              {/* Desktop search */}
              <form
                className="hidden md:flex items-stretch flex-1 max-w-2xl mx-4 h-9"
                onSubmit={(e) => {
                  e.preventDefault()
                  onSearch?.(query)
                }}
                role="search"
                aria-label="Site search"
              >
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className="h-full flex items-center px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium rounded-l-md border-r border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-800"
                  >
                    <span className="truncate max-w-[120px]">{selectedCategory}</span>
                    {isCategoryOpen ? (
                      <ChevronUp className="ml-1 h-4 w-4 text-slate-600" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4 text-slate-600" />
                    )}
                  </button>
                  {isCategoryOpen && (
                    <div className="absolute z-[200] mt-1 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        {categories.map((category) => (
                          <Link
                            key={category}
                            href={getCategoryUrl(category)}
                            onClick={() => {
                              setSelectedCategory(category)
                              setIsCategoryOpen(false)
                            }}
                            className={`block w-full text-left px-4 py-2 text-sm ${selectedCategory === category
                              ? 'bg-amber-50 text-amber-900 font-medium'
                              : 'text-gray-700 hover:bg-gray-100'
                              }`}
                          >
                            {category}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative flex-1">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products..."
                    className="h-full rounded-none border-0 text-gray-900 placeholder-gray-500 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 bg-white"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-full rounded-l-none rounded-r-md bg-amber-400 text-slate-900 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-800"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>

              {/* Right side: Account, Returns & Orders */}
              <div className="hidden md:flex items-center gap-6">
                {/* Returns & Orders */}
                <Link href="/orders" className="flex flex-col px-4 py-1.5 rounded group">
                  <div className="text-xs text-white/80 group-hover:text-amber-300">Returns</div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-white">& Orders</span>
                  </div>
                </Link>

                {/* Account & Lists */}
                <Link href="/account">
                  <div className="flex flex-col items-center text-center px-4 py-1.5 rounded cursor-pointer group">
                    <div className="text-xs text-white/80 group-hover:text-amber-300">
                      {user ? `Hello, ${user.name?.split(' ')[0] || 'User'}` : 'Hello, Sign in'}
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-sm font-medium text-white">Account & Lists</span>
                      <ChevronDown className="h-4 w-4 text-white/80 group-hover:text-amber-300 ml-0.5" />
                    </div>
                  </div>
                </Link>

              </div>

              {/* Cart - Moved to rightmost */}
              <div className="relative group ml-4">
                <Link
                  href="/cart"
                  className="flex items-center px-4 py-1.5 rounded"
                >
                  <div className="relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-6 h-6 text-white"
                    >
                      <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.704-.486l1.875-5.25a.75.75 0 00-.704-1.014H6.12l-1.165-4.368a1.5 1.5 0 00-1.455-1.132H2.25z" />
                      <path d="M3 18a2.25 2.25 0 104.5 0 2.25 2.25 0 00-4.5 0zm11.25 2.25a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5z" />
                    </svg>
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-slate-900">
                      {0}
                    </span>
                  </div>
                  <span className="ml-2 text-sm font-medium text-white">Cart</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Main bar: categories - Non-sticky */}
      <div className="bg-white pt-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-between py-3">
            {/* Left group: mobile trigger */}
            <div className="flex items-center gap-3 md:gap-5">

              {/* Mobile menu trigger */}
              <Sheet>
                <SheetTrigger
                  className="md:hidden z-20 pointer-events-auto inline-flex items-center justify-center rounded-md p-2.5 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </SheetTrigger>
                <SheetContent side="left" className="w-80 z-[100]">
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-3 top-3"
                      aria-label="Close menu"
                    >

                    </Button>
                  </SheetClose>
                  <SheetHeader className="text-center">
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <nav className="mt-4 space-y-3 text-center">
                    <SheetClose asChild>
                      <Link href="/" className="block py-2 text-base font-medium" aria-label="Home">
                        Home
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/categories" className="block py-2 text-base font-medium">
                        Categories
                      </Link>
                    </SheetClose>

                    <SheetClose asChild>
                      <Link href="/brands" className="block py-2 text-base font-medium">
                        Brands
                      </Link>
                    </SheetClose>
                    <div className="pt-2 border-t mt-2">
                      <div className="text-xs uppercase text-slate-600 mb-2 text-center tracking-wide">Collections</div>
                      <SheetClose asChild>
                        <Link href="/collections/sportswear" className="block py-2 text-base font-medium">
                          Sports Wear
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/collections/gymwear" className="block py-2 text-base font-medium">
                          Gymwear
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/collections/necklaces" className="block py-2 text-base font-medium">
                          Necklaces
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/collections/earrings" className="block py-2 text-base font-medium">
                          Earrings
                        </Link>
                      </SheetClose>
                    </div>
                    {user && (
                      <SheetClose asChild>
                        <Link href="/orders" className="block py-2 text-base font-medium">
                          My Orders
                        </Link>
                      </SheetClose>
                    )}

                    <div className="pt-4 border-t mt-4">
                      <div className="text-xs uppercase text-slate-500 mb-2">Account</div>
                      {user ? (
                        <div className="space-y-2">
                          <SheetClose asChild>
                            <Link href="/profile" className="block py-1">Profile</Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <button
                              onClick={() => logout()}
                              className="text-left w-full py-1 hover:underline"
                            >
                              Sign Out
                            </button>
                          </SheetClose>
                        </div>
                      ) : (
                        <SheetClose asChild>
                          <button
                            onClick={() => setAuthOpen(true)}
                            className="text-center w-full py-1 hover:underline"
                          >
                            Sign In
                          </button>
                        </SheetClose>
                      )}
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop nav centered */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/categories" className="hover:underline">Categories</Link>
              <Link href="/brands" className="hover:underline">Brands</Link>
              <Link href="/products" className="hover:underline">Products</Link>

              <Link href="/collections/sportswear" className="hover:underline">Sports Wear</Link>
              <Link href="/collections/gymwear" className="hover:underline">Gymwear</Link>
              <Link href="/collections/necklaces" className="hover:underline">Necklaces</Link>
              <Link href="/collections/earrings" className="hover:underline">Earrings</Link>
              {user && <Link href="/orders" className="hover:underline">My Orders</Link>}
            </nav>

            {/* Wishlist only in lower header */}
            <div className="flex items-center">
              <Link href="/wishlist" className="text-slate-700 hover:text-slate-900 transition-colors">
                <Heart className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Mobile search */}
          <form
            className="md:hidden flex items-center gap-2 py-3 relative"
            onSubmit={(e) => {
              e.preventDefault()
              onSearch?.(query)
            }}
            role="search"
            aria-label="Site search"
          >
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="h-10 flex items-center px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium rounded-md border border-slate-300"
              >
                <span className="truncate max-w-[120px]">{selectedCategory}</span>
                {isCategoryOpen ? (
                  <ChevronUp className="ml-1 h-4 w-4 text-slate-600" />
                ) : (
                  <ChevronDown className="ml-1 h-4 w-4 text-slate-600" />
                )}
              </button>
              {isCategoryOpen && (
                <div className="absolute z-[200] mt-1 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    {categories.map((category) => (
                      <Link
                        key={category}
                        href={getCategoryUrl(category)}
                        onClick={() => {
                          setSelectedCategory(category)
                          setIsCategoryOpen(false)
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${selectedCategory === category
                          ? 'bg-amber-50 text-amber-900 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="h-10 flex-1"
            />
            <Button
              type="submit"
              className="bg-amber-400 text-slate-900 hover:bg-amber-300 h-10"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  )
}

"use client"

import Link from "next/link"
import Image from "next/image"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { ChevronDown, LogIn, LogOut, Menu, Search, User as UserIcon, X } from "lucide-react"
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
  const { user, logout } = useAuth()


  return (
    <header className="w-full border-b border-slate-200/40">
      {/* Top ribbon: brands */}
      <div className="bg-slate-800 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <nav className="flex items-center gap-4 overflow-x-auto py-2 text-sm" aria-label="Brand links">
          </nav>
        </div>
      </div>

      {/* Main bar: logo, categories, search */}
      <div className="bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between py-3">
            {/* Left group: logo + mobile trigger */}
            <div className="flex items-center gap-3 md:gap-5 flex-1">
        
                   
            <Link href="/" aria-label="Home" className="flex items-center">
              <Image src="/logo.png" alt="Logo" width={80} height={32} priority />
            </Link>

            {/* Mobile menu trigger */}
            <Sheet>
              <SheetTrigger
                className="md:hidden z-20 pointer-events-auto inline-flex items-center justify-center rounded-md p-2 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-80 relative z-[60]">
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-3"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </SheetClose>
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-4 space-y-3">
                  <SheetClose asChild>
                    <Link href="/" className="block" aria-label="Home">
                      Home
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/categories" className="block">
                      Categories
                    </Link>
                  </SheetClose>
                  <div>
                    <div className="text-xs uppercase text-slate-500 mb-1">Browse Categories</div>
                    <div className="flex flex-wrap gap-2">
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-slate-500 mb-1">Top Brands</div>
                    <div className="flex flex-wrap gap-2">
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>

            </div>

            {/* Desktop nav centered */}
            <nav className="hidden md:flex items-center gap-6 justify-center">
              <Link href="/categories">Categories</Link>
              <Link href="/brands">Brands</Link>
              <Link href="/products">Products</Link>
              {user && <Link href="/orders">My Orders</Link>}
            </nav>

            {/* Right group: search, auth, cart */}
            <div className="flex items-center gap-4">
              <CartIcon />
              {user ? (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" asChild>
                    <Link href="/account" className="flex items-center">
                      <UserIcon className="w-5 h-5 mr-1" />
                      <span className="hidden sm:inline">My Account</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" onClick={() => logout()}>
                    <span className="hidden sm:inline">Sign Out</span>
                    <LogOut className="w-5 h-5 sm:ml-1" />
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" onClick={() => setAuthOpen(true)}>
                  <span className="hidden sm:inline">Sign In</span>
                  <LogIn className="w-5 h-5 sm:ml-1" />
                </Button>
              )}
            </div>

            {/* Right: desktop auth + search */}
            <form
              className="hidden md:flex items-center gap-2 w-[320px] justify-end flex-1"
              onSubmit={(e) => {
                e.preventDefault()
                onSearch?.(query)
              }}
              role="search"
              aria-label="Site search"
            >
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="h-9"
              />
              <Button type="submit" className="bg-amber-400 text-slate-900 hover:bg-amber-300">
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
              {user ? (
                <div className="ml-3 flex items-center gap-2">
                  <Link href="/profile" className="underline">Profile</Link>
                  <Button type="button" variant="ghost" onClick={logout}>Logout</Button>
                </div>
              ) : (
                <Button type="button" variant="ghost" onClick={() => setAuthOpen(true)}>Login / Register</Button>
              )}
            </form>
          </div>

          {/* Mobile search */}
          <form
            className="md:hidden flex items-center gap-2 pb-3"
            onSubmit={(e) => {
              e.preventDefault()
              onSearch?.(query)
            }}
            role="search"
            aria-label="Site search"
          >
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="h-10"
            />
            <Button type="submit" className="bg-amber-400 text-slate-900 hover:bg-amber-300">
              Go
            </Button>
          </form>

          {/* Mobile auth controls under search */}
          <div className="md:hidden pb-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/profile" className="underline">Profile</Link>
                <Button type="button" variant="ghost" onClick={logout}>Logout</Button>
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={() => setAuthOpen(true)}>Login / Register</Button>
            )}
          </div>
        </div>
      </div>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  )
}

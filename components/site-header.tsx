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
      {/* Top ribbon: search and auth */}
      <div className="bg-slate-800 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between py-2">
            {/* Desktop search */}
            <form
              className="hidden md:flex items-center gap-2 flex-1 max-w-2xl"
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
                className="h-8 bg-white/10 border-white/20 text-white placeholder:text-white/70"
              />
              <Button 
                type="submit" 
                size="sm"
                className="bg-amber-400 text-slate-900 hover:bg-amber-300 h-8"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>

            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10 h-8">
                    <Link href="/account" className="flex items-center">
                      <UserIcon className="w-4 h-4 mr-1" />
                      <span>My Account</span>
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => logout()}
                    className="text-white hover:bg-white/10 h-8"
                  >
                    <span>Sign Out</span>
                  </Button>
                </>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setAuthOpen(true)}
                  className="text-white hover:bg-white/10 h-8"
                >
                  <LogIn className="w-4 h-4 mr-1" />
                  <span>Sign In</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main bar: logo, categories */}
      <div className="bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between py-3">
            {/* Left group: logo + mobile trigger */}
            <div className="flex items-center gap-3 md:gap-5">
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
                      <Link href="/" className="block py-2" aria-label="Home">
                        Home
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/categories" className="block py-2">
                        Categories
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/wishlist" className="block py-2">
                        Wishlist
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/brands" className="block py-2">
                        Brands
                      </Link>
                    </SheetClose>
                    {user && (
                      <SheetClose asChild>
                        <Link href="/orders" className="block py-2">
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
                            className="text-left w-full py-1 hover:underline"
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
              <Link href="/wishlist" className="hover:underline">Wishlist</Link>
              {user && <Link href="/orders" className="hover:underline">My Orders</Link>}
            </nav>

            {/* Right group: cart */}
            <div className="flex items-center">
              <CartIcon />
            </div>
          </div>

          {/* Mobile search */}
          <form
            className="md:hidden flex items-center gap-2 py-3"
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
    </header>
  )
}

"use client"
import { Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useMemo, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { ChevronDown, ChevronUp, LogIn, LogOut, MapPin, Menu, Search, User as UserIcon, X } from "lucide-react"
import { AuthModal } from "@/components/auth/auth-modal"
import { useAuth } from "@/components/auth/auth-provider"
import { CartIcon } from "@/components/cart-icon"
import { useLocationServices } from "@/hooks/useLocationServices"
import { toast } from "sonner"

export function SiteHeader({
  onSearch,
}: {
  onSearch?: (q: string) => void
}) {
  const [query, setQuery] = useState("")
  const [authOpen, setAuthOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [userLocation, setUserLocation] = useState<{ city: string; postalCode: string } | null>(null)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const { user, logout } = useAuth()
  const { getCurrentLocationAddress } = useLocationServices()
  const router = useRouter()
  const pathname = usePathname()

  // Close dropdown when route changes
  useEffect(() => {
    setIsCategoryOpen(false)
  }, [pathname])

  // Handle location detection
  const handleDetectLocation = async () => {
    setIsDetectingLocation(true)
    try {
      const locationData = await getCurrentLocationAddress()
      if (locationData && locationData.address) {
        // Parse the full address to extract city and postal code
        const fullAddress = locationData.address.full_address || locationData.address.place_formatted || ''
        const addressParts = fullAddress.split(',').map(part => part.trim())
        
        // Try to extract postal code (usually 6 digits)
        const postalCodeMatch = fullAddress.match(/\b\d{6}\b/)
        const postalCode = postalCodeMatch ? postalCodeMatch[0] : ''
        
        // Extract city (usually the second or third part)
        const city = addressParts[1] || addressParts[0] || 'Unknown'
        
        setUserLocation({
          city: city,
          postalCode: postalCode
        })
        
      } else {
        toast.error('Failed to detect location. Please try again.')
      }
    } catch (error) {
      console.error('Location detection error:', error)
      toast.error('Failed to detect location. Please try again.')
    } finally {
      setIsDetectingLocation(false)
    }
  }

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
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-sky-700 to-sky-950 text-black h-14 md:h-14 shadow-sm">
          <div className="mx-auto w-full h-full px-3 sm:px-4 lg:px-6 max-w-[1800px]">
            <div className="relative w-full h-full flex items-center justify-between md:justify-start gap-2 md:gap-4">
              {/* Logo - Always centered on mobile, left on desktop */}
              <div className="flex justify-center md:justify-start">
                <Link href="/" aria-label="Home" className="flex-shrink-0">
                  <Image
                    src="/hoeee.png"
                    alt="Logo"
                    width={100}
                    height={100}
                    priority
                    className="h-12 sm:h-14 md:h-14 w-auto"
                  />
                </Link>
              </div>

              {/* Location & Delivery */}
              {/* Show location block from lg and up to free space for search on iPad widths */}
              <div 
                className="hidden lg:flex flex-col ml-4 px-3 py-1.5 rounded cursor-pointer group hover:bg-white/10 transition-colors"
                onClick={handleDetectLocation}
              >
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-white" />
                  <span className="ml-1 text-xs text-white">Deliver to</span>
                </div>
                <div className="flex items-center">
                  {isDetectingLocation ? (
                    <span className="text-sm font-medium text-white">Detecting..</span>
                  ) : userLocation ? (
                    <span className="text-sm font-medium text-white">{userLocation.city} {userLocation.postalCode}</span>
                  ) : (
                    <span className="text-sm font-medium text-white">Check Your Pincode</span>
                  )}
                  <ChevronDown className="h-4 w-4 text-white" />
                </div>
              </div>
              {/* Desktop search */}
              <form
                className="hidden md:flex items-stretch flex-1 basis-0 min-w-0 max-w-2xl mx-2 md:mx-3 h-9 w-full"
                onSubmit={(e) => {
                  e.preventDefault()
                  const q = query.trim()
                  onSearch?.(q)
                  const params = new URLSearchParams()
                  if (q) params.set('q', q)
                  if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory)
                  router.push(`/products${params.toString() ? `?${params.toString()}` : ''}`)
                }}
                role="search"
                aria-label="Site search"
              >
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className="h-full flex items-center px-3 bg-muted  text-black text-sm font-medium rounded-l-md border-r border-border focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  >
                    <span className="truncate max-w-[120px]">{selectedCategory}</span>
                    {isCategoryOpen ? (
                      <ChevronUp className="ml-1 h-4 w-4 text-black" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4 text-black" />
                    )}
                  </button>
                  {isCategoryOpen && (
                    <div className="absolute z-[200] mt-1 w-52 md:w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
                              ? 'bg-black text-white font-medium'
                              : 'text-black hover:bg-muted'
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
                    className="h-full rounded-none border-0 text-black placeholder-foreground/60 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 bg-white"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-full rounded-l-none rounded-r-md bg-orange-500 text-white hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>

              {/* Right side: Account, Returns & Orders */}
              <div className="hidden md:flex items-center gap-3 md:gap-4 lg:gap-5 flex-shrink-0 ml-auto">
                {/* Returns & Orders */}
                <Link href="/orders" className="flex flex-col px-4 py-1.5 rounded group">
                  <div className="text-xs text-white ">Returns</div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-white">& Orders</span>
                  </div>
                </Link>

                {/* Account & Lists */}
                <Link href="/account">
                  <div className="flex flex-col items-center text-center px-4 py-1.5 rounded cursor-pointer group">
                    <div className="text-xs text-white">
                      {user ? `Hello, ${user.name?.split(' ')[0] || 'User'}` : 'Hello, Sign in'}
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-sm font-medium text-white">Account & Lists</span>
                      <ChevronDown className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </Link>

              </div>

              {/* Cart - Live count via CartIcon */}
              <div className="relative group ml-2 md:ml-4 flex items-center   ">
                <CartIcon />
               
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Main bar: categories - Non-sticky */}
      {/* Lower bar offset equals fixed header height for consistent spacing */}
      <div className="bg-background pt-12 md:pt-14 border-b">
        <div className="mx-auto w-full px-4 sm:px-5 md:px-6 max-w-[1800px]">
          <div className="flex items-center justify-between py-1 md:py-3">
            {/* Left group: mobile trigger */}
            <div className="flex items-center gap-3 md:gap-5">

              {/* Mobile menu trigger */}
              <Sheet>
                <SheetTrigger
                  className="md:hidden z-20 pointer-events-auto inline-flex items-center justify-center rounded-md p-2 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 mt-2"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5 " />
                </SheetTrigger>
                <SheetContent side="left" className="w-72 sm:w-80 z-[100]">
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

                    <div className="pt-2 border-t mt-2">
                      <div className="text-xs uppercase text-slate-600 mb-2 text-center tracking-wide">Brands</div>
                      <SheetClose asChild>
                        <Link href="/brands/ira/products" className="block py-2 text-base font-medium">
                          IRA
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/brands/sportswear/products" className="block py-2 text-base font-medium">
                          Jerseymise
                        </Link>
                      </SheetClose>
                    </div>
                    
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
                    

                    <div className="pt-4 border-t mt-4">
                      <div className="text-xs uppercase text-slate-500 mb-2">Account</div>
                      {user ? (
                        <div className="space-y-2">
                          <SheetClose asChild>
                            <Link href="/account" className="block py-1">Profile</Link>
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
            <nav className="hidden md:flex items-center gap-4 lg:gap-6 overflow-x-auto whitespace-nowrap scrollbar-hide px-2 -mx-2">
              <Link href="/categories" className="px-2 py-1 text-sm lg:text-base hover:underline whitespace-nowrap">Categories</Link>
              <Link href="/brands/ira/products" className="px-2 py-1 text-sm lg:text-base hover:underline whitespace-nowrap">IRA</Link>
              <Link href="/brands/sportswear/products" className="px-2 py-1 text-sm lg:text-base hover:underline whitespace-nowrap">Jerseymise</Link>
              <Link href="/products" className="px-2 py-1 text-sm lg:text-base hover:underline whitespace-nowrap">Products</Link>
              <Link href="/collections/sportswear" className="px-2 py-1 text-sm lg:text-base hover:underline whitespace-nowrap">Sportswear</Link>
              <Link href="/collections/gymwear" className="px-2 py-1 text-sm lg:text-base hover:underline whitespace-nowrap">Gymwear</Link>
              <Link href="/collections/necklaces" className="px-2 py-1 text-sm lg:text-base hover:underline whitespace-nowrap">Necklaces</Link>
              <Link href="/collections/earrings" className="px-2 py-1 text-sm lg:text-base hover:underline whitespace-nowrap">Earrings</Link>
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
            className="md:hidden flex items-center gap-2 py-1.5 relative"
            onSubmit={(e) => {
              e.preventDefault()
              const q = query.trim()
              onSearch?.(q)
              const params = new URLSearchParams()
              if (q) params.set('q', q)
              if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory)
              router.push(`/products${params.toString() ? `?${params.toString()}` : ''}`)
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
              className="h-9 flex-1"
            />
            <Button
              type="submit"
              className="bg-accent text-white hover:bg-accent/90 h-9"
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

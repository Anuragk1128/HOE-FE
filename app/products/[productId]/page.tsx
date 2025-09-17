'use client'

import { useEffect, useState, use, useRef } from 'react'
import { Product } from '@/data/products'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/cart-context'
import { useAuth } from '@/components/auth/auth-provider'
import { AuthModal } from '@/components/auth/auth-modal'
import { toast } from 'sonner'
import Image from 'next/image'
import { API_BASE_URL } from '@/lib/api'
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Move } from 'lucide-react'

interface ProductDetails extends Product {
  brand?: {
    _id: string
    name: string
  }
  category?: {
    _id: string
    name: string
  }
}

export default function ProductDetailsPage({ params }: { params: Promise<{ productId: string }> }) {
  const resolvedParams = use(params)
  const [product, setProduct] = useState<ProductDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [isZoomed, setIsZoomed] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { addToCart } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    async function fetchProduct() {
      try {
        const [productRes, brandsRes, categoriesRes] = await Promise.all([
          fetch(`https://hoe-be.onrender.com/api/products/${resolvedParams.productId}`),
          fetch('https://hoe-be.onrender.com/api/brands'),
          fetch('https://hoe-be.onrender.com/api/categories')
        ])
        
        const [productData, brandsData, categoriesData] = await Promise.all([
          productRes.json(),
          brandsRes.json(),
          categoriesRes.json()
        ])

        if (productData.success) {
          const productWithDetails = { ...productData.data }
          
          // Add brand name
          if (brandsData.success) {
            const brand = brandsData.data.find((b: any) => b._id === productData.data.brandId)
            if (brand) {
              productWithDetails.brand = brand
            }
          }
          
          // Add category name
          if (categoriesData.success) {
            const category = categoriesData.data.find((c: any) => c._id === productData.data.categoryId)
            if (category) {
              productWithDetails.category = category
            }
          }
          
          setProduct(productWithDetails)
        }
      } catch (error) {
        console.error('Failed to fetch product:', error)
        toast.error('Failed to load product details')
      } finally {
        setLoading(false)
      }
    }

    if (resolvedParams?.productId) {
      fetchProduct()
    }
  }, [resolvedParams?.productId])

  const handleAddToCart = async () => {
    if (!product) return
    try {
      // Always add quantity 1 as per requirement; CartContext will handle auth/toasts
      await addToCart(product._id, 1)
    } catch (e: any) {
      // CartContext already shows a toast on error; keep a minimal catch
      console.error('Add to cart error:', e)
    }
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3))
    setIsZoomed(true)
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 0.5, 1)
    setZoomLevel(newZoom)
    if (newZoom <= 1) {
      setZoomLevel(1)
      setIsZoomed(false)
      setPosition({ x: 0, y: 0 })
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return
    setIsDragging(true)
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return
    
    // Calculate new position
    const newX = e.clientX - startPos.x
    const newY = e.clientY - startPos.y
    
    // Get image dimensions
    if (imageRef.current) {
      const { width, height } = imageRef.current.getBoundingClientRect()
      const maxX = (width * (zoomLevel - 1)) / 2
      const maxY = (height * (zoomLevel - 1)) / 2
      
      // Constrain position to keep image within bounds
      setPosition({
        x: Math.max(-maxX, Math.min(maxX, newX)),
        y: Math.max(-maxY, Math.min(maxY, newY))
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const resetZoom = () => {
    setZoomLevel(1)
    setIsZoomed(false)
    setPosition({ x: 0, y: 0 })
  }

  const handleBuyNow = async () => {
    if (!user?.token) {
      setShowAuthModal(true)
      return
    }
    await handleAddToCart()
    router.push('/cart')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-200 rounded-lg h-[500px] w-full"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-12 bg-gray-200 rounded w-1/2 mt-8"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-800">Product not found</h2>
        <p className="text-gray-600 mt-2">The product you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push('/')} className="mt-4">
          Continue Shopping
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div 
            className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100 cursor-zoom-in"
            style={{ cursor: isZoomed ? 'move' : 'zoom-in' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => {
              // Only zoom in/out on click if not dragging
              if (!isDragging) {
                if (isZoomed) {
                  resetZoom()
                } else {
                  handleZoomIn()
                }
              }
            }}
            ref={imageRef}
          >
            {product.images && product.images.length > 0 ? (
              <div 
                className="w-full h-full transition-transform duration-300 ease-in-out"
                style={{
                  transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
                  transformOrigin: 'center center',
                  willChange: 'transform'
                }}
              >
                <Image
                  src={product.images[selectedImage]}
                  alt={product.title}
                  width={800}
                  height={800}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                No image available
              </div>
            )}
            
            {/* Zoom controls */}
            {isZoomed && (
              <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleZoomIn()
                  }}
                  className="p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-colors"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-5 h-5 text-gray-800" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleZoomOut()
                  }}
                  className="p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-colors"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-5 h-5 text-gray-800" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    resetZoom()
                  }}
                  className="p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-colors"
                  aria-label="Reset zoom"
                >
                  <X className="w-5 h-5 text-gray-800" />
                </button>
              </div>
            )}
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="relative">
              <div className="flex items-center space-x-2 overflow-x-auto py-2 scrollbar-hide">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedImage(index)
                      resetZoom()
                    }}
                    className={`flex-shrink-0 relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                      selectedImage === index 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} - ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
              
              {/* Navigation arrows for mobile */}
              {product.images.length > 4 && (
                <>
                  <button 
                    onClick={() => {
                      const prev = selectedImage > 0 ? selectedImage - 1 : product.images.length - 1
                      setSelectedImage(prev)
                      resetZoom()
                    }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 p-1 bg-white/80 rounded-full shadow-md hover:bg-white transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-800" />
                  </button>
                  <button 
                    onClick={() => {
                      const next = selectedImage < product.images.length - 1 ? selectedImage + 1 : 0
                      setSelectedImage(next)
                      resetZoom()
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 p-1 bg-white/80 rounded-full shadow-md hover:bg-white transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-800" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
            {product.tags?.includes('sale') && (
              <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                SALE
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <p className="text-3xl font-bold text-gray-900">
              ₹{product.price.toLocaleString('en-IN')}
            </p>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <p className="text-lg text-gray-500 line-through">
                ₹{product.compareAtPrice.toLocaleString('en-IN')}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Description</h3>
              <p className="mt-2 text-gray-600">
                {product.description || 'No description available.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {product.brand?.name && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Brand</h4>
                  <p className="mt-1 text-gray-900">
                    {product.brand.name}
                  </p>
                </div>
              )}
              {product.category?.name && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Category</h4>
                  <p className="mt-1 text-gray-900">
                    {product.category.name}
                  </p>
                </div>
              )}
              <div>
                <h4 className="text-sm font-medium text-gray-500">Availability</h4>
                <p className="mt-1 text-gray-900">
                  {product.stock && product.stock > 0 
                    ? `In Stock (${product.stock} available)` 
                    : 'Out of Stock'}
                </p>
              </div>
            </div>

            {/* Specifications & Attributes */}
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Specifications</h3>
              

              {/* Attribute Chips */}
              {product.attributes && (
                <div className="space-y-3">
                  {(Array.isArray(product.attributes.size) && product.attributes.size.length > 0) && (
                    <div>
                      <h4 className="text-xs uppercase tracking-wide text-gray-500 mb-2">Sizes</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.attributes.size.map((s, idx) => (
                          <span key={`${s}-${idx}`} className="px-2 py-1 text-xs rounded border bg-white">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(Array.isArray(product.attributes.color) && product.attributes.color.length > 0) && (
                    <div>
                      <h4 className="text-xs uppercase tracking-wide text-gray-500 mb-2">Colors</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.attributes.color.map((c, idx) => (
                          <span key={`${c}-${idx}`} className="px-2 py-1 text-xs rounded border bg-white">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(product.attributes.material || product.attributes.fit || product.attributes.occasion || product.attributes.styling || product.attributes.gender) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {product.attributes.material && (
                        <div>
                          <h4 className="text-xs uppercase tracking-wide text-gray-500">Material</h4>
                          <p className="mt-1 text-gray-900">{product.attributes.material}</p>
                        </div>
                      )}
                      {product.attributes.fit && (
                        <div>
                          <h4 className="text-xs uppercase tracking-wide text-gray-500">Fit</h4>
                          <p className="mt-1 text-gray-900">{product.attributes.fit}</p>
                        </div>
                      )}
                      {product.attributes.occasion && (
                        <div>
                          <h4 className="text-xs uppercase tracking-wide text-gray-500">Occasion</h4>
                          <p className="mt-1 text-gray-900">{product.attributes.occasion}</p>
                        </div>
                      )}
                      {product.attributes.styling && (
                        <div>
                          <h4 className="text-xs uppercase tracking-wide text-gray-500">Style</h4>
                          <p className="mt-1 text-gray-900">{product.attributes.styling}</p>
                        </div>
                      )}
                      {product.attributes.gender && (
                        <div>
                          <h4 className="text-xs uppercase tracking-wide text-gray-500">Gender</h4>
                          <p className="mt-1 text-gray-900">{product.attributes.gender}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {product.stock && product.stock > 0 ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center border rounded-md">
                <button 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(prev => Math.min(prev + 1, product.stock || 10))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              
              <Button 
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {user ? 'Add to Cart' : ' Add to Cart'}
              </Button>
              
              <Button 
                onClick={handleBuyNow}
                variant="outline"
                className="flex-1"
              >
                {user ? 'Buy Now' : 'Login to Buy Now'}
              </Button>
            </div>
          ) : (
            <Button disabled className="w-full">
              Out of Stock
            </Button>
          )}
          <div className="flex items-center mb-4">
            <span className="text-gray-600 mr-2">In Stock:</span>
            <span>{product.stock}</span>
          </div>
        </div>
      </div>
      
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  )
}

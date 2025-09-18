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
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ZoomIn, 
  ZoomOut, 
  Heart,
  Share2,
  Star,
  Truck,
  Shield,
  RefreshCw,
  Check,
  Minus,
  Plus,
  ShoppingCart,
  CreditCard,
  Package,
  Clock
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

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
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  
  // Image zoom states
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
          
          if (brandsData.success) {
            const brand = brandsData.data.find((b: any) => b._id === productData.data.brandId)
            if (brand) productWithDetails.brand = brand
          }
          
          if (categoriesData.success) {
            const category = categoriesData.data.find((c: any) => c._id === productData.data.categoryId)
            if (category) productWithDetails.category = category
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

  // Image zoom functions
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

  const resetZoom = () => {
    setZoomLevel(1)
    setIsZoomed(false)
    setPosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return
    setIsDragging(true)
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return
    
    const newX = e.clientX - startPos.x
    const newY = e.clientY - startPos.y
    
    if (imageRef.current) {
      const { width, height } = imageRef.current.getBoundingClientRect()
      const maxX = (width * (zoomLevel - 1)) / 2
      const maxY = (height * (zoomLevel - 1)) / 2
      
      setPosition({
        x: Math.max(-maxX, Math.min(maxX, newX)),
        y: Math.max(-maxY, Math.min(maxY, newY))
      })
    }
  }

  const handleMouseUp = () => setIsDragging(false)
  const handleMouseLeave = () => setIsDragging(false)

  const handleAddToCart = async () => {
    if (!product) return
    try {
      await addToCart(product._id, quantity)
    } catch (e: any) {
      console.error('Add to cart error:', e)
    }
  }

  const handleBuyNow = async () => {
    if (!user?.token) {
      setShowAuthModal(true)
      return
    }
    await handleAddToCart()
    router.push('/cart')
  }

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          text: product?.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Share failed:', error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              <div className="space-y-4">
                <div className="bg-gray-200 rounded-2xl h-[500px] w-full"></div>
                <div className="flex space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-200 rounded-lg h-20 w-20"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-12 bg-gray-200 rounded w-full"></div>
                <div className="h-16 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-64 h-64 mx-auto mb-8 opacity-20">
            <Package className="w-full h-full text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            The product you're looking for doesn't exist or has been removed from our catalog.
          </p>
          <Button onClick={() => router.push('/')} size="lg" className="px-8">
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  const discountPercentage = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Breadcrumb */}
       

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <Card className="overflow-hidden border-0 shadow-lg">
              <div 
                className="relative aspect-square w-full overflow-hidden bg-white cursor-zoom-in group"
                style={{ cursor: isZoomed ? 'move' : 'zoom-in' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onClick={(e) => {
                  if (!isDragging) {
                    if (isZoomed) resetZoom()
                    else handleZoomIn()
                  }
                }}
                ref={imageRef}
              >
                {product.images && product.images.length > 0 ? (
                  <>
                    <div 
                      className="w-full h-full transition-transform duration-300 ease-in-out"
                      style={{
                        transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
                        transformOrigin: 'center center',
                      }}
                    >
                      <Image
                        src={product.images[selectedImage]}
                        alt={product.title}
                        width={600}
                        height={600}
                        className="w-full h-full object-contain"
                        priority
                      />
                    </div>
                    
                    {/* Sale Badge */}
                    {discountPercentage > 0 && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1">
                          -{discountPercentage}%
                        </Badge>
                      </div>
                    )}

                    {/* Zoom Controls */}
                    <div className="absolute bottom-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleZoomIn()
                        }}
                        className="h-10 w-10 bg-white/90 hover:bg-white shadow-lg"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleZoomOut()
                        }}
                        className="h-10 w-10 bg-white/90 hover:bg-white shadow-lg"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                      {isZoomed && (
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation()
                            resetZoom()
                          }}
                          className="h-10 w-10 bg-white/90 hover:bg-white shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400 bg-gray-100">
                    <Package className="w-24 h-24" />
                  </div>
                )}
              </div>
            </Card>
            
            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center space-x-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedImage(index)
                      resetZoom()
                    }}
                    className={`flex-shrink-0 relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === index 
                        ? 'border-blue-500 ring-2 ring-blue-100' 
                        : 'border-gray-200 hover:border-gray-300'
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
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  {product.brand?.name && (
                    <Badge variant="outline" className="text-sm font-medium">
                      {product.brand.name}
                    </Badge>
                  )}
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                    {product.title}
                  </h1>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={toggleWishlist}
                    className="h-10 w-10"
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleShare}
                    className="h-10 w-10"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < (product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                    />
                  ))}
                  <span className="text-sm font-medium text-gray-900 ml-2">
                    {product.rating || 0}
                  </span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm text-gray-600">
                  {product.numReviews || 0} reviews
                </span>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm text-gray-600">
                  {product.totalSales || 0} sold
                </span>
              </div>
            </div>

            {/* Price */}
            <Card className="p-6 bg-gradient-to-r from-gray-50 to-white border border-gray-200">
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ₹{product.compareAtPrice.toLocaleString('en-IN')}
                    </span>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Save ₹{(product.compareAtPrice - product.price).toLocaleString('en-IN')}
                    </Badge>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Inclusive of all taxes • Free shipping on orders above ₹499
              </p>
            </Card>

            {/* Stock Status */}
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${product.stock && product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`font-medium ${product.stock && product.stock > 0 ? 'text-green-700' : 'text-red-700'}`}>
                {product.stock && product.stock > 0 
                  ? `In Stock (${product.stock} available)` 
                  : 'Out of Stock'}
              </span>
            </div>

            {/* Product Variants/Attributes */}
            {product.attributes && (
              <div className="space-y-4">
                {/* Size Selection */}
                {product.attributes.size && Array.isArray(product.attributes.size) && product.attributes.size.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Size</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.attributes.size.map((size, index) => (
                        <Button
                          key={`${size}-${index}`}
                          variant="outline"
                          size="sm"
                          className="h-10 px-4 hover:bg-gray-900 hover:text-white transition-colors"
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {product.attributes.color && Array.isArray(product.attributes.color) && product.attributes.color.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Color</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.attributes.color.map((color, index) => (
                        <Button
                          key={`${color}-${index}`}
                          variant="outline"
                          size="sm"
                          className="h-10 px-4 hover:bg-gray-900 hover:text-white transition-colors"
                        >
                          {color}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity & Actions */}
            {product.stock && product.stock > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <label className="text-sm font-medium text-gray-900">Quantity:</label>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="h-10 w-10 rounded-l-lg rounded-r-none"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setQuantity(Math.min(quantity + 1, product.stock || 10))}
                        className="h-10 w-10 rounded-r-lg rounded-l-none"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button 
                    onClick={handleAddToCart}
                    size="lg"
                    variant="outline"
                    className="h-12 font-semibold border-2 hover:bg-gray-900 hover:text-white transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                  
                  <Button 
                    onClick={handleBuyNow}
                    size="lg"
                    className="h-12 bg-orange-500 hover:bg-orange-600 font-semibold"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Buy Now
                  </Button>
                </div>
              </div>
            ) : (
              <Button disabled size="lg" className="w-full h-12">
                Out of Stock
              </Button>
            )}

            {/* Service Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center space-x-3 text-sm">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Truck className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Free Delivery</p>
                  <p className="text-gray-600">On orders above ₹499</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="p-2 bg-green-100 rounded-full">
                  <RefreshCw className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Easy Returns/Replacements</p>
                  <p className="text-gray-600">7 days return policy</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Shield className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Secure Payment</p>
                  <p className="text-gray-600">100% secure checkout</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Product Description</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {product.description || 'No description available for this product.'}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.brand?.name && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-600">Brand</span>
                        <span className="text-gray-900">{product.brand.name}</span>
                      </div>
                    )}
                    {product.category?.name && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-600">Category</span>
                        <span className="text-gray-900">{product.category.name}</span>
                      </div>
                    )}
                    {product.attributes?.material && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-600">Material</span>
                        <span className="text-gray-900">{product.attributes.material}</span>
                      </div>
                    )}
                    {product.attributes?.fit && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-600">Fit</span>
                        <span className="text-gray-900">{product.attributes.fit}</span>
                      </div>
                    )}
                    {
                      product.attributes?.color && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Color</span>
                          <span className="text-gray-900">{product.attributes.color}</span>
                        </div>
                      )
                    }
                    {
                      product.attributes?.size && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Size</span>
                          <span className="text-gray-900">{product.attributes.size}</span>
                        </div>
                      )
                    }
                    
                 
                 
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                  <div className="text-center py-12 text-gray-500">
                    <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No reviews yet. Be the first to review this product!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  )
}

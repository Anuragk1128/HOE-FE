'use client'

import { useEffect, useState, use } from 'react'
import { Product } from '@/data/products'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/cart-context'
import { useAuth } from '@/components/auth/auth-provider'
import { AuthModal } from '@/components/auth/auth-modal'
import { toast } from 'sonner'
import Image from 'next/image'
import { API_BASE_URL } from '@/lib/api'

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
    if (!user?.token) {
      setShowAuthModal(true)
      return
    }
    try {
      const res = await fetch(`${API_BASE_URL}/cart/${product._id}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ quantity }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = data?.message || data?.error || 'Failed to add to cart'
        toast.error(message)
        return
      }
      // Sync local cart for immediate UX
      addToCart({
        name: product.title,
        price: product.price,
        image: product.images[0],
        quantity,
        productId: product._id,
      })
      toast.success('Added to cart')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to add to cart')
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
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[selectedImage]}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square overflow-hidden rounded-md ${
                    selectedImage === index ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.title} - ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
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

'use client'

import { useCart } from '@/contexts/cart-context'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { formatINR } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { API_BASE_URL } from '@/lib/api'

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal, itemCount, clearCart } = useCart()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const { user } = useAuth()
  const [serverCart, setServerCart] = useState<Array<{ _id: string; quantity: number; product: { _id: string; title: string; slug: string; images: string[]; price: number } }>>([])
  const [loadingServerCart, setLoadingServerCart] = useState(false)
  const shippingFee = cart.length > 0 ? 0 : 0 // Free shipping for now
  const computedSubtotal = serverCart.length
    ? serverCart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)
    : cartTotal
  const tax = computedSubtotal * 0.1 // 10% tax
  const orderTotal = computedSubtotal + shippingFee + tax

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const fetchServerCart = async () => {
      if (!user?.token) {
        setServerCart([])
        return
      }
      try {
        setLoadingServerCart(true)
        const res = await fetch(`${API_BASE_URL}/cart`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })
        if (!res.ok) {
          setServerCart([])
          return
        }
        const data = await res.json()
        const list = Array.isArray(data) ? data : []
        setServerCart(list)
      } finally {
        setLoadingServerCart(false)
      }
    }
    fetchServerCart()
  }, [user?.token])

  const removeServerCartItem = async (productId: string) => {
    if (!user?.token) return
    try {
      const res = await fetch(`${API_BASE_URL}/cart/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { Accept: '*/*' },
      })
      if (!res.ok) return
      setServerCart((prev) => prev.filter((i) => i.product?._id !== productId))
    } catch {}
  }

  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center p-4 border rounded-lg">
                  <div className="w-24 h-24 bg-gray-200 rounded"></div>
                  <div className="ml-4 flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-12 bg-gray-200 rounded mt-4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const effectiveItemCount = serverCart.length || itemCount

  if (!loadingServerCart && serverCart.length === 0 && cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="mt-1 text-gray-500">Looks like you haven't added anything to your cart yet.</p>
          <div className="mt-6">
            <Button onClick={() => router.push('/products')} className="px-6">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart ({effectiveItemCount} {effectiveItemCount === 1 ? 'item' : 'items'})</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {(serverCart.length ? serverCart : cart).map((item: any) => (
            <div key={item.id || item._id || item.product?._id} className="flex flex-col sm:flex-row items-start sm:items-center p-4 border rounded-lg">
              <div className="relative w-full sm:w-24 h-24 bg-gray-100 rounded overflow-hidden">
                {(item.image || item.product?.images?.[0]) && (
                  <Image
                    src={item.image || item.product.images[0]}
                    alt={item.name || item.product?.title || 'Product image'}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              
              <div className="mt-4 sm:mt-0 sm:ml-6 flex-1 w-full">
                <div className="flex justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    <Link href={`/products/${item.productId || item.product?._id}`} className="hover:underline">
                      {item.name || item.product?.title}
                    </Link>
                  </h3>
                  <p className="ml-4 font-medium text-gray-900">{formatINR(item.price ?? item.product?.price ?? 0)}</p>
                </div>
                
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center border rounded-md">
                    <span className="px-3 py-1 text-gray-700">Qty</span>
                    <span className="w-8 text-center">{item.quantity}</span>
                  </div>
                  {!serverCart.length ? (
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-sm font-medium text-red-600 hover:text-red-500"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={() => removeServerCartItem(item.product?._id)}
                      className="text-sm font-medium text-red-600 hover:text-red-500"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {!serverCart.length && (
            <div className="flex justify-end">
              <button
                onClick={clearCart}
                className="text-sm font-medium text-red-600 hover:text-red-500"
              >
                Clear cart
              </button>
            </div>
          )}
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatINR(computedSubtotal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {shippingFee === 0 ? 'Free' : formatINR(shippingFee)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%)</span>
                <span className="font-medium">{formatINR(tax)}</span>
              </div>
              
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-medium">Order Total</span>
                  <span className="text-lg font-bold">{formatINR(orderTotal)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Button 
                onClick={() => router.push('/checkout')}
                className="w-full py-6 text-base"
                disabled={cart.length === 0}
              >
                Proceed to Checkout
              </Button>
            </div>
            
            <p className="mt-4 text-center text-sm text-gray-500">
              or{' '}
              <Link href="/products" className="font-medium text-blue-600 hover:text-blue-500">
                Continue Shopping
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

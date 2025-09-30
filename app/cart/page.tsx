// app/cart/page.tsx
'use client'

import { useCart } from '@/contexts/cart-context'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { formatINR } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'

export default function CartPage() {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    removeFromCartByQuantity,
    removeProductFromCart,
    cartTotal, 
    itemCount, 
    clearCart, 
    loading,
    error 
  } = useCart()
  
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setUpdatingItems(prev => new Set(prev).add(cartItemId))
    
    try {
      await updateQuantity(cartItemId, newQuantity)
    } catch (error) {
      console.error('Failed to update quantity:', error)
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(cartItemId)
        return newSet
      })
    }
  }

  const handleRemoveItem = async (cartItemId: string, productId?: string) => {
    setUpdatingItems(prev => new Set(prev).add(cartItemId))
    
    try {
      if (productId) {
        await removeProductFromCart(productId)
      } else {
        await removeFromCart(cartItemId)
      }
    } catch (error) {
      console.error('Failed to remove item:', error)
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(cartItemId)
        return newSet
      })
    }
  }

  const handleRemoveQuantity = async (productId: string, quantity: number) => {
    setUpdatingItems(prev => new Set(prev).add(productId))
    
    try {
      await removeFromCartByQuantity(productId, quantity)
    } catch (error) {
      console.error('Failed to remove quantity:', error)
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  // Calculate totals
  const shippingFee = 0 // No shipping charges
  const tax = cartTotal * 0.1 // 10% tax
  const orderTotal = cartTotal + shippingFee + tax

  // Loading state
  if (!isClient || loading) {
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

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error loading cart</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Empty cart state
  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto">
          <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
          <Button onClick={() => router.push('/products')} className="px-6">
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Your Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </h1>
     
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const isUpdating = updatingItems.has(item._id)
            
            // Debug: Log product data to see what's available
            console.log('Cart item product data:', {
              _id: item.product?._id,
              slug: item.product?.slug,
              title: item.product?.title
            })
            
            return (
              <div 
                key={item._id} 
                className={`flex flex-col sm:flex-row items-start sm:items-center p-4 border rounded-lg bg-white ${
                  isUpdating ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                {/* Product Image */}
                <div className="relative w-24 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {item.product?.images?.[0] && (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product?.title || 'Product image'}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  )}
                </div>
                
                {/* Product Details */}
                <div className="mt-4 sm:mt-0 sm:ml-6 flex-1 w-full">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        <Link 
                          href={`/products/${item.product?._id}`} 
                          className="hover:text-blue-600 transition-colors"
                        >
                          {item.product?.title?.trim() || 'Product'}
                        </Link>
                      </h3>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatINR(item.product?.price || 0)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Subtotal: {formatINR((item.product?.price || 0) * item.quantity)}
                      </p>
                      {item.product?.stock !== undefined && (
                        <p className={`text-xs mt-1 ${
                          item.product.stock <= 5 ? 'text-red-600 font-medium' : 
                          item.product.stock <= 10 ? 'text-orange-600' : 
                          'text-gray-500'
                        }`}>
                          {item.product.stock <= 0 ? 'Out of stock' : 
                           item.product.stock <= 5 ? `Only ${item.product.stock} left in stock` :
                           `${item.product.stock} in stock`}
                        </p>
                      )}
                    </div>
                    
                    {/* Quantity Controls & Remove Button */}
                    <div className="flex items-center justify-between sm:justify-end mt-4 sm:mt-0 w-full sm:w-auto">
                      {/* Quantity Controls */}
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() => handleRemoveQuantity(item.product?._id || '', 1)}
                          disabled={isUpdating || item.quantity <= 1}
                          className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove 1 item"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        
                        <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                          disabled={isUpdating || (item.product?.stock !== undefined && item.quantity >= item.product.stock)}
                          className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={item.product?.stock && item.quantity >= item.product.stock ? "Out of stock" : "Add 1 item"}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Remove All Button */}
                      <button
                        onClick={() => handleRemoveItem(item._id, item.product?._id)}
                        disabled={isUpdating}
                        className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove all items"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg sticky top-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                <span className="font-medium">{formatINR(cartTotal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {shippingFee === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    formatINR(shippingFee)
                  )}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%)</span>
                <span className="font-medium">{formatINR(tax)}</span>
              </div>
              
              <div className="text-sm text-gray-500 bg-green-50 p-2 rounded">
                🎉 Free shipping on all orders!
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold">Total</span>
                <span className="text-xl font-bold text-gray-900">{formatINR(orderTotal)}</span>
              </div>
            </div>
            
            <Button 
              onClick={() => router.push('/checkout')}
              className="w-full py-3 text-lg font-semibold"
              disabled={cart.length === 0 || loading}
            >
              Proceed to Checkout
            </Button>
            
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

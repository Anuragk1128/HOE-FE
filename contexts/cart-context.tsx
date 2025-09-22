// contexts/cart-context.tsx
'use client'

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { API_BASE_URL } from '@/lib/api'

export interface Product {
  _id: string
  title: string
  price: number
  images: string[]
  brandId?: string
  categoryId?: string
  subcategoryId?: string
  slug?: string
  sku?: string
  shippingCategory?: string
  weightKg?: number
  dimensionsCm?: {
    length: number
    breadth: number
    height: number
  }

  hsnCode?: string
  gstRate?: number
  productType?: string
  attributes?: {
    size?: string[]
    color?: string[]
    material?: string
    fit?: string
    styling?: string
    occasion?: string
    gender?: string
  }
  lowStockThreshold?: number
  isActive?: boolean
  vendorId?: string
  featured?: boolean
  bestseller?: boolean
  newArrival?: boolean
  onSale?: boolean
  rating?: number
  numReviews?: number
  totalSales?: number
  viewCount?: number
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string[]
}

export interface CartItem {
  _id: string
  product: Product
  quantity: number
  user: string
  createdAt?: string
  updatedAt?: string
}

interface CartContextType {
  cart: CartItem[]
  loading: boolean
  error: string | null
  addToCart: (productId: string, quantity?: number) => Promise<void>
  removeFromCart: (cartItemId: string) => Promise<void>
  removeProductFromCart: (productId: string) => Promise<void>
  removeFromCartByQuantity: (productId: string, quantity: number) => Promise<void>
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  itemCount: number
  cartTotal: number
  isInCart: (productId: string) => boolean
  refreshCart: () => Promise<void>
}

export const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const getAuthToken = useCallback(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('authToken')
  }, [])

  const fetchCart = useCallback(async () => {
    const token = getAuthToken()
    if (!token) {
      setLoading(false)
      setCart([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, redirect to login
          localStorage.removeItem('authToken')
          router.push('/account')
          return
        }
        throw new Error(`Failed to fetch cart: ${response.status}`)
      }

      const data = await response.json()
      console.log('Cart API Response:', data) // Debug log

      // Handle different response formats
      let cartItems: CartItem[] = []

      if (Array.isArray(data)) {
        // If response is directly an array
        cartItems = data
      } else if (data.items && Array.isArray(data.items)) {
        // If response has items property
        cartItems = data.items
      } else if (data.data && Array.isArray(data.data)) {
        // If response has data property
        cartItems = data.data
      } else if (data._id && data.product) {
        // If response is a single cart item (from your API response example)
        cartItems = [data]
      } else {
        console.warn('Unexpected cart response format:', data)
        cartItems = []
      }

      setCart(cartItems)

    } catch (err) {
      console.error('Error fetching cart:', err)
      setError(err instanceof Error ? err.message : 'Failed to load cart')
      setCart([])
    } finally {
      setLoading(false)
    }
  }, [getAuthToken, router])

  // Initial cart fetch
  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addToCart = async (productId: string, quantity: number = 1) => {
    const token = getAuthToken()
    if (!token) {
      toast.error('Please login to add items to cart')
      router.push('/account')
      return
    }

    try {
      setLoading(true)
      
      // Attempt 1: POST /cart/:productId with body { quantity } per backend contract
      const safeProductId = encodeURIComponent(String(productId))
      let response = await fetch(`${API_BASE_URL}/cart/${safeProductId}`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity })
      })

      // Fallback: if endpoint not found or method not allowed, try /cart/add
      if (!response.ok && (response.status === 404 || response.status === 405)) {
        response = await fetch(`${API_BASE_URL}/cart/add`, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ productId, quantity })
        })
      }

      if (!response.ok) {
        // Handle unauthorized
        if (response.status === 401) {
          localStorage.removeItem('authToken')
          toast.error('Session expired. Please login again.')
          router.push('/account')
          return
        }
        let errorPayload: any = null
        let errorText = ''
        try { errorPayload = await response.json() } catch { 
          try { errorText = await response.text() } catch {}
        }
        console.error('[Cart] Add to cart API Error:', { status: response.status, errorPayload, errorText })
        throw new Error(
          (errorPayload && (errorPayload.message || errorPayload.error)) ||
          (errorText || `Failed to add item to cart (status ${response.status})`)
        )
      }

      try {
        const data = await response.json()
        console.log('Add to cart response:', data)
      } catch {}
      
      // Refresh cart after adding
      await fetchCart()
      toast.success('Added to cart')

    } catch (err) {
      console.error('Error adding to cart:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to add item to cart')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = async (cartItemId: string) => {
    const token = getAuthToken()
    if (!token) return

    try {
      setLoading(true)

      const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to remove item from cart')
      }

      // Update local state immediately for better UX
      setCart(prev => prev.filter(item => item._id !== cartItemId))
      toast.success('Removed from cart')

      // Refresh cart to sync with server
      await fetchCart()

    } catch (err) {
      console.error('Error removing from cart:', err)
      toast.error('Failed to remove item from cart')
      // Refresh cart on error to sync state
      await fetchCart()
    } finally {
      setLoading(false)
    }
  }

  // Remove by productId using DELETE /cart/:productId (backend supports removal via product id)
  const removeProductFromCart = async (productId: string) => {
    const token = getAuthToken()
    if (!token) return

    try {
      setLoading(true)

      const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to remove product from cart')
      }

      // Optimistically update local state (remove all items matching this product id)
      setCart(prev => prev.filter(item => item.product?._id !== productId))
      toast.success('Removed from cart')

      // Sync with server
      await fetchCart()
    } catch (err) {
      console.error('Error removing product from cart:', err)
      toast.error('Failed to remove product from cart')
      await fetchCart()
    } finally {
      setLoading(false)
    }
  }

  const removeFromCartByQuantity = async (productId: string, quantity: number) => {
    const token = getAuthToken()
    if (!token) return

    try {
      setLoading(true)

      const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to remove items from cart')
      }

      const result = await response.json()
      
      // Update local state based on remaining quantity
      if (result.remainingQuantity === 0) {
        // Item completely removed
        setCart(prev => prev.filter(item => item.product._id !== productId))
        toast.success(`Removed ${quantity} item(s) from cart`)
      } else {
        // Update quantity
        setCart(prev => prev.map(item => 
          item.product._id === productId 
            ? { ...item, quantity: result.remainingQuantity }
            : item
        ))
        toast.success(`Removed ${quantity} item(s) from cart`)
      }

      // Refresh cart to sync with server
      await fetchCart()

    } catch (err) {
      console.error('Error removing items from cart:', err)
      toast.error('Failed to remove items from cart')
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(cartItemId)
      return
    }

    const token = getAuthToken()
    if (!token) {
      router.push('/account')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
        method: 'PATCH',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to update quantity')
      }

      // Update local state immediately
      setCart(prev =>
        prev.map(item =>
          item._id === cartItemId
            ? { ...item, quantity }
            : item
        )
      )

      toast.success('Quantity updated')

      // Refresh cart to sync with server
      await fetchCart()

    } catch (err) {
      console.error('Error updating quantity:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to update quantity')
      // Refresh cart on error
      await fetchCart()
    } finally {
      setLoading(false)
    }
  }

  const clearCart = async () => {
    const token = getAuthToken()
    if (!token) {
      router.push('/account')
      return
    }

    try {
      setLoading(true)

      // Clear each item individually
      const deletePromises = cart.map(item =>
        fetch(`${API_BASE_URL}/cart/${item._id}`, {
          method: 'DELETE',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
      )

      await Promise.all(deletePromises)

      setCart([])
      toast.success('Cart cleared')

    } catch (err) {
      console.error('Error clearing cart:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to clear cart')
      // Refresh cart on error
      await fetchCart()
    } finally {
      setLoading(false)
    }
  }

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0)

  const cartTotal = cart.reduce(
    (total, item) => total + (item.product?.price || 0) * item.quantity,
    0
  )

  const isInCart = (productId: string) => {
    return cart.some(item => item.product?._id === productId)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        addToCart,
        removeFromCart,
        removeFromCartByQuantity,
        removeProductFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        cartTotal,
        isInCart,
        refreshCart: fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export type { CartContextType }

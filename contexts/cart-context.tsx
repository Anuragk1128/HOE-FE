'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'id'>) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  cartTotal: number
  isInCart: (productId: string) => boolean
}

export const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart')
      return savedCart ? JSON.parse(savedCart) : []
    }
    return []
  })
  const router = useRouter()

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart))
    }
  }, [cart])

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    setCart(prevCart => {
      // Check if item already in cart
      const existingItemIndex = prevCart.findIndex(
        cartItem => cartItem.productId === item.productId
      )

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        const updatedCart = [...prevCart]
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + item.quantity
        }
        toast.success('Cart updated')
        return updatedCart
      }

      // Add new item
      toast.success('Added to cart')
      return [
        ...prevCart,
        {
          ...item,
          id: Math.random().toString(36).substr(2, 9)
        }
      ]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId))
    toast.success('Removed from cart')
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId)
      return
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0)

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )

  const isInCart = (productId: string) => {
    return cart.some(item => item.productId === productId)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        cartTotal,
        isInCart
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

// Export the context type for type safety
export type { CartContextType }

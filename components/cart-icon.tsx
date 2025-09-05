'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/cart-context'

export function CartIcon() {
  const { itemCount } = useCart()

  return (
    <Link href="/cart" className="relative p-2 text-gray-700 hover:text-gray-900">
      <ShoppingCart className="h-6 w-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </Link>
  )
}

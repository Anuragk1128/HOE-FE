'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';

export function CartIcon() {
  const { itemCount } = useCart();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Link href="/cart" className="relative p-2 rounded cursor-pointer group text-white hover:bg-white/10 hover:scale-105">
      <ShoppingCart className="h-6 w-6" />
      {isClient && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </Link>
  );
}

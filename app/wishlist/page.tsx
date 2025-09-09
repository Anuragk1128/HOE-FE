'use client';

import { useEffect } from 'react';
import { useWishlist } from '@/contexts/wishlist-context';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HeartOff, ShoppingBag } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, loading, removeFromWishlist, error } = useWishlist();
  
  console.log('Wishlist Page - wishlist state:', wishlist);
  console.log('Wishlist Page - loading state:', loading);
  console.log('Wishlist Page - error state:', error);
  
  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Auth token in localStorage:', token ? 'Exists' : 'Not found');
  }, []);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
            <h2 className="text-lg font-semibold">Error loading wishlist</h2>
            <p className="mt-1 text-sm">{error.message || 'Please try again later'}</p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Your Wishlist</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-64 rounded-md"></div>
              <div className="mt-2 h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="mt-1 h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto">
          <HeartOff className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your wishlist is empty</h1>
          <p className="text-gray-600 mb-6">Save your favorite items here for easy access later.</p>
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Your Wishlist</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((item) => (
          <div key={item._id} className="group relative border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <Link href={`/products/${item.product.slug}`} className="block">
              <div className="aspect-square bg-gray-100 relative">
                {item.product.images?.[0] ? (
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 line-clamp-2">{item.product.title}</h3>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  ₹{item.product.price.toLocaleString('en-IN')}
                </p>
              </div>
            </Link>
            <div className="p-4 pt-0 flex justify-between gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => removeFromWishlist(item._id)}
              >
                <HeartOff className="h-4 w-4 mr-2" />
                Remove
              </Button>
              <Button size="sm" className="w-full">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner';

interface Product {
  _id: string;
  title: string;
  slug: string;
  price: number;
  images: string[];
  brandId: string;
  categoryId: string;
  subcategoryId: string;
}

interface WishlistItem {
  _id: string;
  product: Product;
  createdAt: string;
  updatedAt: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  loading: boolean;
  error: Error | null;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (wishlistItemId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  fetchWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      console.log('Fetching wishlist data...');
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        console.log('No auth token found, clearing wishlist');
        setWishlist([]);
        return;
      }

      const response = await fetch('https://hoe-be.onrender.com/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
      }

      const data = await response.json();
      console.log('Wishlist data received:', data);
      setWishlist(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      const errorMessage = error instanceof Error ? error : new Error('Failed to load wishlist');
      setError(errorMessage);
      toast.error(errorMessage.message);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to add items to wishlist');
        return;
      }

      const response = await fetch('https://hoe-be.onrender.com/api/wishlist', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to wishlist');
      }

      await fetchWishlist();
      toast.success('Added to wishlist');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
    }
  };

  const removeFromWishlist = async (wishlistItemId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to modify wishlist');
        return;
      }

      const response = await fetch(`https://hoe-be.onrender.com/api/wishlist/${wishlistItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove from wishlist');
      }

      setWishlist(prev => prev.filter(item => item._id !== wishlistItemId));
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlist.some(item => item.product._id === productId);
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        error,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

// Mock product data and types

export interface Product {
  attributes: {
    size?: string[];
    color?: string[];
    material?: string;
    fit?: string;
    styling?: string;
    occasion?: string;
    gender?: string;
  };
  _id: string;
  brandId: string | { _id: string; name: string; slug: string };
  categoryId: string | { _id: string; name: string; slug: string };
  subcategoryId: string | { _id: string; name: string; slug: string };
  title: string;
  slug: string;
  description: string;
  images: string[];
  price: number;
  compareAtPrice: number;
  stock: number;
  status: string;
  tags: string[];
  sku?: string;
  shippingCategory?: string;
  weightKg?: number;
  dimensionsCm?: {
    length: number;
    breadth: number;
    height: number;
  };
  hsnCode?: string;
  gstRate?: number;
  productType?: string;
  lowStockThreshold?: number;
  isActive?: boolean;
  vendorId?: string;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  onSale?: boolean;
  rating?: number;
  numReviews?: number;
  totalSales?: number;
  viewCount?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  createdAt: string;
  updatedAt: string;
}

// Legacy storefront pages (e.g., `app/brands/page.tsx` and `app/categories/page.tsx`) import
// the following symbols from this module. Export minimal stubs to satisfy imports without
// changing runtime behavior. These default to empty arrays so pages render 0 items instead of
// crashing when prerendering.

// Brand is treated as a primitive string in `app/brands/page.tsx`
export type Brand = string;

// Category union keys are used by `categoryMeta` in `app/categories/page.tsx`
export type Category = "Shoes" | "Apparel" | "Accessories" | "Electronics" | "Home";

// Keep these arrays empty to avoid altering data-fetching behavior elsewhere
export const BRANDS: Brand[] = [];
export const CATEGORIES: Category[] = [];

// Some legacy code expects a PRODUCTS list with `{ brand: string; image: string }` fields.
// Provide an empty array; brand pages fall back to a default image when not found.
// Intentionally typed as any[] to avoid forcing a conflicting shape with the Product interface.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PRODUCTS: any[] = [];

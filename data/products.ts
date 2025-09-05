// Mock product data and types

export interface Product {
  attributes: {
    size: string[];
    color: string[];
    material?: string;
  };
  _id: string;
  brandId: string;
  categoryId: string;
  subcategoryId: string;
  title: string;
  slug: string;
  description: string;
  images: string[];
  price: number;
  compareAtPrice: number;
  stock: number;
  status: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  vendorId?: string;
}

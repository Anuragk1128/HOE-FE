import { notFound } from 'next/navigation';
import Image from 'next/image';
import SafeImage from '@/components/shared/safe-image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { formatPrice } from '@/lib/format';

interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  images: string[];
  price: number;
  compareAtPrice: number;
  stock: number;
  attributes: {
    color: string[];
    size: string[];
  };
  categoryId: {
    _id: string;
    name: string;
    slug: string;
  };
  subcategoryId?: {
    _id: string;
    name: string;
    slug: string;
  };
}

export default async function CategoryProductsPage({
  params,
}: {
  params: { brandSlug: string; categorySlug: string };
}) {
  const { brandSlug, categorySlug } = params;

  try {
    const response = await fetch(
      `https://hoe-be.onrender.com/api/brands/${brandSlug}/categories/${categorySlug}/products`,
      {
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const { data: products } = await response.json();

    if (!products || products.length === 0) {
      return (
        <div className="container mx-auto p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">No products found</h1>
          <p className="text-muted-foreground">
            We couldn't find any products in this category.
          </p>
          <Button asChild className="mt-4">
            <Link href="/categories">Back to Categories</Link>
          </Button>
        </div>
      );
    }

    const categoryName = products[0]?.categoryId?.name || 'Category';

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{categoryName}</h1>
          <p className="text-muted-foreground mt-2">
            Browse our collection of {categoryName.toLowerCase()}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: Product) => (
            <Card key={product._id} className="group overflow-hidden">
              <Link href={`/products/${product._id}`} className="block">
                <CardHeader className="p-0">
                  <div className="aspect-square relative overflow-hidden bg-slate-50">
                    {product.images?.[0] ? (
                      <>
                        <SafeImage
                          src={product.images[0]}
                          alt={product.title}
                          width={400}
                          height={400}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.compareAtPrice > product.price && (
                          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                            SALE
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-slate-400">No image available</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <h3 className="font-medium text-lg mb-1 line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-3 min-h-[2.5rem]">
                    {product.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{formatPrice(product.price)}</span>
                    {product.compareAtPrice > product.price && (
                      <span className="text-muted-foreground line-through text-sm">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full" asChild>
                    <span>View Details</span>
                  </Button>
                </CardFooter>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching category products:', error);
    notFound();
  }
}

export async function generateMetadata({
  params,
}: {
  params: { brandSlug: string; categorySlug: string };
}) {
  // You can add metadata generation here if needed
  return {
    title: `${params.categorySlug.replace(/-/g, ' ')} | ${params.brandSlug} | HOE`,
    description: `Browse our collection of ${params.categorySlug.replace(/-/g, ' ')} from ${params.brandSlug}`,
  };
}

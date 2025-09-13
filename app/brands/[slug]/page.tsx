import { BrandCategoriesClient } from './brand-categories-client'

export default function BrandCategoriesPage({ params }: { params: { slug: string } }) {
  return <BrandCategoriesClient slug={params.slug} />
}

export const dynamic = 'force-dynamic'

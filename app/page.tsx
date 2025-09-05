import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/sections/hero-section"
import { BrandsMarquee } from "@/components/sections/brands-marquee"
import { FeaturedGrid } from "@/components/sections/featured-grid"
import { ProductList } from "@/components/products/product-list"
import { DealsSection } from "@/components/sections/deals-section"

export default function Page() {
  return (
    <main>
    
      <HeroSection />
      <BrandsMarquee />
      <FeaturedGrid />
      <ProductList />
      <DealsSection />
    </main>
  )
}

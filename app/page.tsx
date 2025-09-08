import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/sections/hero-section"
import { FeaturedGrid } from "@/components/sections/featured-grid"
import { ProductList } from "@/components/products/product-list"
import { DealsSection } from "@/components/sections/deals-section"
import Newsletter from "@/components/newsletter"
import Slider from "@/components/slider"

export default function Page() {
  return (
    <main>
    
      <HeroSection />
      
      <FeaturedGrid />
      <ProductList />
      <Slider/>
      <DealsSection />
      <Newsletter/>
    </main>
  )
}

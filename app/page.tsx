import { HeroSection } from "@/components/sections/hero-section"
import { FeaturedGrid } from "@/components/sections/featured-grid"
import { ProductList } from "@/components/products/product-list"
import { DealsSection } from "@/components/sections/deals-section"
import { BrandStory } from "@/components/sections/brand-story"
import { Testimonials } from "@/components/sections/testimonials"
import { Features } from "@/components/sections/features"
import Newsletter from "@/components/newsletter"
import Cards from "@/components/card"
import Collections from "@/components/collections"
import Test from "@/components/test"

export default function Page() {
  return (
    <main className="flex flex-col">
      {/* Hero Banner */}
      <HeroSection />
      
      {/* Features */}
      <Features />
      
  
      <FeaturedGrid />
        
      
      {/* Deals Section */}
      <DealsSection />
     {/* <Cards/> */}
      <Test/>
      
 
      
      {/* Brand Story */}
      <BrandStory />
      
      {/* Testimonials */}
      <Testimonials />
      
      {/* Newsletter - full width */}
      <Newsletter />
    </main>
  )
}

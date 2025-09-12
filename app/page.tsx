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

export default function Page() {
  return (
    <main className="flex flex-col">
      {/* Hero Banner */}
      <HeroSection />
      
      {/* Features */}
      <Features />
      
      {/* Featured Products */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Featured Products</h2>
          <FeaturedGrid />
        </div>
      </section>
      
      {/* Deals Section */}
      <DealsSection />
      <Cards/>
      <Collections/>
 
      
      {/* Brand Story */}
      <BrandStory />
      
      {/* Testimonials */}
      <Testimonials />
      
      {/* Newsletter */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <Newsletter />
        </div>
      </section>
    </main>
  )
}

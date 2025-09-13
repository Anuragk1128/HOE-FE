import Image from "next/image"

export function BrandStory() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Discover the journey behind our brand and what makes us unique in the world of fashion and lifestyle.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900">Our Beginning</h3>
              <p className="text-gray-600">
                Founded in 2023, we started with a simple vision: to create high-quality, stylish products that combine comfort, durability, and modern design.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900">Our Mission</h3>
              <p className="text-gray-600">
                We're committed to sustainable practices, ethical sourcing, and creating products that you'll love for years to come.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900">Our Promise</h3>
              <p className="text-gray-600">
                Quality craftsmanship, attention to detail, and exceptional customer service are at the heart of everything we do.
              </p>
            </div>
          </div>
          
          <div className="relative h-96 rounded-lg overflow-hidden shadow-lg">
            <Image
              src="/hero-bg.png"
              alt="Our brand story"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}

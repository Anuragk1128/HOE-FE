import { CheckCircle } from "lucide-react"

const features = [
  {
    id: 1,
    title: "Made for comfort & style",
    description: "Our products are designed with both comfort and style in mind, ensuring you look and feel great."
  },
  {
    id: 2,
    title: "Ethically sourced materials",
    description: "We are committed to using only ethically sourced materials in all our products."
  },
  {
    id: 3,
    title: "Loved by our customers",
    description: "Join thousands of satisfied customers who trust us for their fashion needs."
  },
  {
    id: 4,
    title: "Free shipping on all orders",
    description: "Enjoy free shipping on all orders with no minimum purchase required."
  }
]

export function Testimonials() {
  return (
    <section className="py-8 sm:py-12 md:py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">What Makes Us Different</h2>
          <p className="text-sm sm:text-base text-gray-600">Discover the unique qualities that set us apart from the rest</p>
        </div>
        
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          {features.map((feature) => (
            <div key={feature.id} className="bg-white p-4 sm:p-5 md:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-start space-x-3 sm:space-x-4">
              <div className="flex-shrink-0">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

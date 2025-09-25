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
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Makes Us Different</h2>
          <p className="text-gray-600">Discover the unique qualities that set us apart from the rest</p>
        </div>
        
        <div className="space-y-6">
          {features.map((feature) => (
            <div key={feature.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-start space-x-4">
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

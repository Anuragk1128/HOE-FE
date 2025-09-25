import { Truck, ShieldCheck, RefreshCw, Heart } from "lucide-react"

const features = [
  {
    icon: <Truck className="w-8 h-8 text-blue-600" />,
    title: "Free Shipping",
    description: "Free shipping on all orders"
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-green-600" />,
    title: "Secure Payment",
    description: "100% secure payment processing"
  },
  {
    icon: <RefreshCw className="w-8 h-8 text-purple-600" />,
    title: "Easy Replacement",
    description: "7-day replacement policy"
  },
  {
    icon: <Heart className="w-8 h-8 text-red-600" />,
    title: "Quality Guarantee",
    description: "Handpicked products from trusted brands"
  }
]

export function Features() {
  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

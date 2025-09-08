import { Star } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Fashion Enthusiast",
    content: "The quality of the products is outstanding! I've received so many compliments on my new wardrobe.",
    rating: 5
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Loyal Customer",
    content: "Exceptional customer service and fast shipping. Will definitely be shopping here again!",
    rating: 5
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Style Blogger",
    content: "I love how versatile and comfortable their clothing is. Perfect for both casual and formal occasions.",
    rating: 4
  }
]

export function Testimonials() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
          <p className="text-gray-600">Don't just take our word for it - hear from our satisfied customers</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
              <div className="font-medium">
                <p className="text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

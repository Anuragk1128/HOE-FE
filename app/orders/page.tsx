'use client'

import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { formatINR } from '@/lib/format'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface Order {
  id: string
  orderNumber: string
  date: string
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: OrderItem[]
  total: number
  shippingAddress: {
    name: string
    address: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  paymentMethod: string
}

export default function OrdersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, you would fetch orders from your API
    // This is a mock implementation
    const fetchOrders = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data - in a real app, this would come from your API
        const mockOrders: Order[] = [
          {
            id: '1',
            orderNumber: 'ORD-123456',
            date: '2023-05-15',
            status: 'delivered',
            items: [
              {
                id: 'item1',
                name: 'Premium T-Shirt',
                price: 29.99,
                quantity: 2,
                image: '/placeholder-product.jpg'
              },
              {
                id: 'item2',
                name: 'Casual Jeans',
                price: 59.99,
                quantity: 1,
                image: '/placeholder-product.jpg'
              }
            ],
            total: 119.97,
            shippingAddress: {
              name: 'John Doe',
              address: '123 Main St',
              city: 'Mumbai',
              state: 'Maharashtra',
              postalCode: '400001',
              country: 'India'
            },
            paymentMethod: 'Credit Card (Visa)'
          },
          {
            id: '2',
            orderNumber: 'ORD-123455',
            date: '2023-06-20',
            status: 'shipped',
            items: [
              {
                id: 'item3',
                name: 'Running Shoes',
                price: 89.99,
                quantity: 1,
                image: '/placeholder-product.jpg'
              }
            ],
            total: 89.99,
            shippingAddress: {
              name: 'John Doe',
              address: '123 Main St',
              city: 'Mumbai',
              state: 'Maharashtra',
              postalCode: '400001',
              country: 'India'
            },
            paymentMethod: 'PayPal'
          }
        ]
        
        setOrders(mockOrders)
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchOrders()
    } else {
      setLoading(false)
    }
  }, [user])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="border rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="h-6 bg-gray-200 rounded w-48"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="space-y-4">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="flex items-center">
                      <div className="h-16 w-16 bg-gray-200 rounded"></div>
                      <div className="ml-4 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                  <div className="h-10 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-800">Sign in to view your orders</h2>
        <p className="mt-2 text-gray-600">Please sign in to view your order history.</p>
        <Button onClick={() => router.push('/signin')} className="mt-4">
          Sign In
        </Button>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
        <h2 className="mt-2 text-2xl font-semibold text-gray-800">No orders yet</h2>
        <p className="mt-1 text-gray-600">You haven't placed any orders yet.</p>
        <div className="mt-6">
          <Button onClick={() => router.push('/products')} className="px-6">
            Start Shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Orders</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b flex flex-col sm:flex-row justify-between">
              <div className="mb-2 sm:mb-0">
                <div className="text-sm text-gray-500">Order #{order.orderNumber}</div>
                <div className="text-sm text-gray-500">
                  Placed on {new Date(order.date).toLocaleDateString('en-IN')}
                </div>
              </div>
              <div className="flex items-center">
                <span 
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'delivered' 
                      ? 'bg-green-100 text-green-800' 
                      : order.status === 'shipped'
                      ? 'bg-blue-100 text-blue-800'
                      : order.status === 'processing'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start">
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="font-medium text-gray-900">{formatINR(item.price * item.quantity)}</p>
                      {item.quantity > 1 && (
                        <p className="text-sm text-gray-500">{formatINR(item.price)} each</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Shipping Address</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      {order.shippingAddress.name}<br />
                      {order.shippingAddress.address}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                      {order.shippingAddress.country}
                    </p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-sm font-medium text-gray-900">Order Total</h4>
                    <p className="mt-1 text-lg font-bold text-gray-900">{formatINR(order.total)}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Paid with {order.paymentMethod}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => router.push(`/orders/${order.id}`)}>
                    View Details
                  </Button>
                  {order.status === 'delivered' && (
                    <Button variant="outline">
                      Buy Again
                    </Button>
                  )}
                  <Button>
                    Track Order
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

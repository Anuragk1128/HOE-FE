'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/cart-context'
import { Button } from '@/components/ui/button'
import { formatINR } from '@/lib/utils'

type CheckoutStep = 'shipping' | 'payment' | 'review' | 'confirmation'

type ShippingInfo = {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
}

type PaymentInfo = {
  cardNumber: string
  cardName: string
  expiryDate: string
  cvv: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, cartTotal, clearCart } = useCart()
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping')
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  })
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  })
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  const shippingFee = 0 // Free shipping
  const tax = cartTotal * 0.1 // 10% tax
  const orderTotal = cartTotal + shippingFee + tax

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep('payment')
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep('review')
  }

  const handlePlaceOrder = async () => {
    // In a real app, you would send this data to your backend
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generate a random order number
      const orderNum = `ORD-${Math.floor(100000 + Math.random() * 900000)}`
      setOrderNumber(orderNum)
      
      // Clear cart and show confirmation
      clearCart()
      setOrderPlaced(true)
      setCurrentStep('confirmation')
    } catch (error) {
      console.error('Failed to place order:', error)
      alert('Failed to place order. Please try again.')
    }
  }

  if (!cart.length && !orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-800">Your cart is empty</h2>
        <p className="mt-2 text-gray-600">Please add some items to your cart before checking out.</p>
        <Button onClick={() => router.push('/products')} className="mt-4">
          Continue Shopping
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Progress Steps */}
      <div className="max-w-3xl mx-auto mb-12">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {['shipping', 'payment', 'review', 'confirmation'].map((step, index) => {
              const stepKey = step as CheckoutStep
              const isCurrent = currentStep === stepKey
              const isCompleted = 
                (stepKey === 'shipping' && currentStep !== 'shipping') ||
                (stepKey === 'payment' && ['review', 'confirmation'].includes(currentStep)) ||
                (stepKey === 'review' && currentStep === 'confirmation')
              
              return (
                <li key={step} className={`flex-1 flex ${index < 3 ? 'pr-8' : ''}`}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        isCompleted
                          ? 'bg-blue-600 text-white'
                          : isCurrent
                          ? 'border-2 border-blue-600 bg-white text-blue-600'
                          : 'border-2 border-gray-300 bg-white text-gray-500'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckIcon className="w-5 h-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${
                        isCurrent || isCompleted
                          ? 'text-blue-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.charAt(0).toUpperCase() + step.slice(1)}
                    </span>
                  </div>
                  {index < 3 && (
                    <div className="flex-1 flex items-center">
                      <div className="w-full h-0.5 bg-gray-200"></div>
                    </div>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      </div>

      <div className="max-w-4xl mx-auto">
        {currentStep === 'shipping' && (
          <form onSubmit={handleShippingSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Shipping Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  required
                  value={shippingInfo.firstName}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, firstName: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  required
                  value={shippingInfo.lastName}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, lastName: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={shippingInfo.email}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, email: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address *
                </label>
                <input
                  type="text"
                  id="address"
                  required
                  value={shippingInfo.address}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, address: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  required
                  value={shippingInfo.city}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, city: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                  Postal Code *
                </label>
                <input
                  type="text"
                  id="postalCode"
                  required
                  value={shippingInfo.postalCode}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, postalCode: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State *
                </label>
                <input
                  type="text"
                  id="state"
                  required
                  value={shippingInfo.state}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, state: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={shippingInfo.phone}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, phone: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button type="submit" className="px-6">
                Continue to Payment
              </Button>
            </div>
          </form>
        )}
        
        {currentStep === 'payment' && (
          <form onSubmit={handlePaymentSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Payment Information</h2>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="space-y-6">
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                    Card Number *
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    required
                    placeholder="1234 5678 9012 3456"
                    value={paymentInfo.cardNumber}
                    onChange={(e) =>
                      setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">
                    Name on Card *
                  </label>
                  <input
                    type="text"
                    id="cardName"
                    required
                    placeholder="John Doe"
                    value={paymentInfo.cardName}
                    onChange={(e) =>
                      setPaymentInfo({ ...paymentInfo, cardName: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                      Expiry Date *
                    </label>
                    <input
                      type="text"
                      id="expiryDate"
                      required
                      placeholder="MM/YY"
                      value={paymentInfo.expiryDate}
                      onChange={(e) =>
                        setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                      CVV *
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      required
                      placeholder="123"
                      value={paymentInfo.cvv}
                      onChange={(e) =>
                        setPaymentInfo({ ...paymentInfo, cvv: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep('shipping')}
              >
                Back
              </Button>
              <Button type="submit" className="px-6">
                Review Order
              </Button>
            </div>
          </form>
        )}
        
        {currentStep === 'review' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Review Your Order</h2>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Shipping Information</h3>
                <div className="mt-2 text-gray-600">
                  <p>{`${shippingInfo.firstName} ${shippingInfo.lastName}`}</p>
                  <p>{shippingInfo.address}</p>
                  <p>{`${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.postalCode}`}</p>
                  <p>{shippingInfo.country}</p>
                  <p className="mt-2">{shippingInfo.email}</p>
                  <p>{shippingInfo.phone}</p>
                </div>
              </div>
              
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Payment Method</h3>
                <div className="mt-2 text-gray-600">
                  <p>Visa ending in {paymentInfo.cardNumber.slice(-4)}</p>
                  <p>Expires {paymentInfo.expiryDate}</p>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatINR(item.price * item.quantity)}</p>
                    </div>
                  ))}
                  
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatINR(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{shippingFee === 0 ? 'Free' : formatINR(shippingFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (10%)</span>
                      <span>{formatINR(tax)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-lg">
                      <span>Total</span>
                      <span>{formatINR(orderTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('payment')}
              >
                Back
              </Button>
              <Button onClick={handlePlaceOrder} className="px-6">
                Place Order
              </Button>
            </div>
          </div>
        )}
        
        {currentStep === 'confirmation' && orderPlaced && (
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <CheckIcon className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Order Placed Successfully!</h2>
            <p className="mt-2 text-gray-600">
              Thank you for your order. Your order number is{' '}
              <span className="font-medium">{orderNumber}</span>.
            </p>
            <p className="mt-2 text-gray-600">
              We've sent a confirmation email to {shippingInfo.email} with order details.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <Button onClick={() => router.push('/products')} variant="outline">
                Continue Shopping
              </Button>
              <Button onClick={() => router.push('/orders')}>
                View Orders
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  )
}

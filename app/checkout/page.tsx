'use client'

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/utils';
import { useAuth } from '@/components/auth/auth-provider';
import { API_BASE_URL, type Address } from '@/lib/api';
import { toast } from 'sonner';
import { RazorpayButton } from '@/components/payment/razorpay-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { indianStates, getDistrictsByState } from '@/lib/indian-states-districts';

type CheckoutStep = 'shipping' | 'payment' | 'review' | 'confirmation'

type ShippingInfo = {
  firstName: string
  lastName: string
  email: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  district?: string
  postalCode: string
  country: string
  landmark?: string
  latitude?: string
  longitude?: string
}

type BillingInfo = {
  sameAsShipping: boolean
  firstName: string
  lastName: string
  email: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  landmark?: string
}

type PaymentInfo = {
  cardNumber: string
  cardName: string
  expiryDate: string
  cvv: string
}

// Removed direct Razorpay usage from this page; handled via RazorpayButton component

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, cartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping')
  const [isProcessing, setIsProcessing] = useState(false)
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    district: '',
    postalCode: '',
    country: 'India',
    landmark: '',
    latitude: '',
    longitude: '',
  })
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    sameAsShipping: true,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    landmark: '',
  })
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  })
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [mounted, setMounted] = useState(false)
 
  // Set mounted state after initial render to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Autofill shipping details from logged-in user
  useEffect(() => {
    if (!mounted) return // Skip on server-side
    
    const token = user?.token || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null)
    if (!token) return
    
    const controller = new AbortController()
    ;(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/me`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        })
        const data = await res.json().catch(() => ({} as any))
        if (!res.ok) return
        const u = (data && (data.user || data)) as any
        if (!u) return
        const name: string = u.name || ''
        const [firstName, ...rest] = name.trim().split(' ').filter(Boolean)
        const lastName = rest.join(' ')
        setShippingInfo(prev => ({
          ...prev,
          firstName: prev.firstName || firstName || '',
          lastName: prev.lastName || lastName || '',
          email: prev.email || u.email || '',
          phone: prev.phone || u.phone || '',
          addressLine1: prev.addressLine1 || u.address || '',
          // Keep city/state/postalCode empty to be required if not derivable
        }))
      } catch (e) {
        // noop
      }
    })()
    return () => controller.abort()
  }, [user?.token, mounted])

  // Address Management - using Address type from lib/api.ts

  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressesLoading, setAddressesLoading] = useState(false)
  const [addressesError, setAddressesError] = useState<string | null>(null)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [savingDefault, setSavingDefault] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)

  const [newAddress, setNewAddress] = useState<Address>({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    district: '',
    postalCode: '',
    country: 'India',
    phone: '',
    latitude: '',
    longitude: '',
    landmark: '',
  })

  // Get districts based on selected state for shipping
  const districts = useMemo(() => 
    shippingInfo.state ? getDistrictsByState(shippingInfo.state) : [],
    [shippingInfo.state]
  )

  const token = user?.token || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null)

  const fetchAddresses = async () => {
    if (!token) return
    setAddressesLoading(true)
    setAddressesError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/addresses`, {
        method: 'GET',
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({})) as any
      if (!res.ok) throw new Error((data as any)?.message || 'Failed to fetch addresses')
      const list: Address[] = (Array.isArray((data as any).data) ? (data as any).data : Array.isArray(data) ? data : (data as any).addresses) || []
      setAddresses(list)
      // If user has addresses and none selected, select the first and map to shipping
      if (list.length && !selectedAddressId) {
        setSelectedAddressId(list[0]._id || null)
        mapAddressToShipping(list[0])
      }
    } catch (e: any) {
      setAddressesError(e?.message || 'Unable to load addresses')
    } finally {
      setAddressesLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchAddresses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const mapAddressToShipping = (addr: Address) => {
    const fullName = addr.fullName || ''
    const [firstName, ...rest] = fullName.trim().split(' ').filter(Boolean)
    const lastName = rest.join(' ')
    setShippingInfo(prev => ({
      ...prev,
      firstName: firstName || prev.firstName,
      lastName: lastName || prev.lastName,
      email: prev.email, // keep email from user
      phone: addr.phone || prev.phone,
      addressLine1: addr.addressLine1 || prev.addressLine1,
      addressLine2: addr.addressLine2 || prev.addressLine2,
      city: addr.city || prev.city,
      state: addr.state || prev.state,
      district: addr.district || prev.district,
      postalCode: addr.postalCode || prev.postalCode,
      country: addr.country || prev.country,
      landmark: addr.landmark || prev.landmark,
      latitude: addr.latitude || prev.latitude,
      longitude: addr.longitude || prev.longitude,
    }))
  }

  const handleSelectAddress = (addrId: string) => {
    setSelectedAddressId(addrId)
    const addr = addresses.find(a => (a._id || '') === addrId)
    if (addr) mapAddressToShipping(addr)
  }

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setCreateLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/addresses`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAddress),
      })
      const data = await res.json().catch(() => ({})) as any
      if (!res.ok) throw new Error((data as any)?.message || 'Failed to create address')
      // Refresh list and select the newly created if returned
      await fetchAddresses()
      setShowAddForm(false)
      setNewAddress({
        fullName: '', addressLine1: '', addressLine2: '', city: '', state: '', district: '', postalCode: '', country: 'India', phone: '', latitude: '', longitude: '', landmark: ''
      })
    } catch (e: any) {
      alert(e?.message || 'Error creating address')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleSaveAsDefault = async () => {
    if (!token || !user?.id || !selectedAddressId) return
    const addr = addresses.find(a => (a._id || '') === selectedAddressId)
    if (!addr) return
    setSavingDefault(true)
    try {
      const res = await fetch(`${API_BASE_URL}/addresses/${encodeURIComponent(user.id)}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addr),
      })
      const data = await res.json().catch(() => ({})) as any
      if (!res.ok) throw new Error((data as any)?.message || 'Failed to update user address')
      // Optionally refetch user/me to keep local state aligned
    } catch (e: any) {
      alert(e?.message || 'Error updating address')
    } finally {
      setSavingDefault(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!token || !user?.id) return
    setSavingEdit(true)
    try {
      const res = await fetch(`${API_BASE_URL}/addresses/${encodeURIComponent(user.id)}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAddress),
      })
      const data = await res.json().catch(() => ({})) as any
      if (!res.ok) throw new Error((data as any)?.message || 'Failed to update address')
      setShowAddForm(false)
      setEditMode(false)
      await fetchAddresses()
    } catch (e: any) {
      alert(e?.message || 'Error updating address')
    } finally {
      setSavingEdit(false)
    }
  }

  const shippingFee = 0; // Free shipping
  const tax = cartTotal * 0.1; // 10% tax
  const orderTotal = cartTotal + shippingFee + tax;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep('payment')
  }

  const handlePaymentSuccess = () => {
    setOrderPlaced(true)
    setOrderNumber(`ORD-${Date.now()}`)
    setCurrentStep('confirmation')
  }

  const handlePaymentError = (error: Error) => {
    console.error('Payment error:', error)
    toast.error(error.message || 'Payment failed. Please try again.')
  }

  const renderPaymentButton = () => (
    <div className="space-y-6">
     
      
      <div className="mt-8">
        <RazorpayButton
          amount={cartTotal}
          orderId={`order_${Date.now()}`}
          name={`${shippingInfo.firstName} ${shippingInfo.lastName}`.trim()}
          email={shippingInfo.email}
          contact={shippingInfo.phone}
          shippingInfo={shippingInfo}
          billingInfo={billingInfo}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          disabled={isProcessing}
        />
        
        
      </div>
    </div>
  )

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
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Shipping Information</h2>
            </div>

            {/* Saved Addresses Section */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Saved Addresses</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(s => !s)
                    setEditMode(false)
                    setNewAddress({ fullName: '', addressLine1: '', addressLine2: '', city: '', state: '', district: '', postalCode: '', country: 'India', phone: '', latitude: '', longitude: '', landmark: '' })
                  }}
                  className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                  title="Add new address"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/></svg>
                  Add Address
                </button>
              </div>

              {addressesLoading && <p className="text-sm text-gray-500">Loading addresses...</p>}
              {addressesError && <p className="text-sm text-red-600">{addressesError}</p>}
              {!addressesLoading && !addressesError && (
                <div className="space-y-3">
                  {addresses.length ? (
                    addresses.map(addr => (
                      <label key={(addr._id || addr.addressLine1) + addr.postalCode} className="flex items-start gap-3 p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="selectedAddress"
                          className="mt-1"
                          checked={selectedAddressId === (addr._id || '')}
                          onChange={() => handleSelectAddress(addr._id || '')}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900">{addr.fullName} <span className="text-gray-500 font-normal">• {addr.phone}</span></p>
                            {selectedAddressId === (addr._id || '') && (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className="text-sm text-blue-600 hover:underline"
                                  onClick={() => {
                                    setEditMode(true)
                                    setShowAddForm(true)
                                    setNewAddress({ ...addr })
                                  }}
                                >
                                  Edit
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
                          <p className="text-sm text-gray-700">{addr.city}, {addr.state} {addr.postalCode}, {addr.country}</p>
                          {addr.landmark ? <p className="text-xs text-gray-500">Landmark: {addr.landmark}</p> : null}
                          {(addr.latitude || addr.longitude) ? <p className="text-xs text-gray-500">Lat/Lng: {addr.latitude || '-'}, {addr.longitude || '-'}</p> : null}
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No saved addresses yet. Add a new address.</p>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const addr = addresses.find(a => (a._id || '') === selectedAddressId)
                        if (addr) mapAddressToShipping(addr)
                      }}
                      disabled={!selectedAddressId}
                    >
                      Use Selected for Shipping
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSaveAsDefault}
                      disabled={!selectedAddressId || savingDefault}
                    >
                      {savingDefault ? 'Saving...' : 'Save as Default'}
                    </Button>
                  </div>
                </div>
              )}

              {showAddForm && (
                <form onSubmit={(e) => {
                  if (editMode) {
                    e.preventDefault()
                    // Save edited address as default for user
                    handleSaveEdit()
                  } else {
                    handleCreateAddress(e)
                  }
                }} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                    <input type="text" required value={newAddress.fullName} onChange={(e)=>setNewAddress({...newAddress, fullName: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Address Line 1 *</label>
                    <input type="text" required value={newAddress.addressLine1} onChange={(e)=>setNewAddress({...newAddress, addressLine1: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
                    <input type="text" value={newAddress.addressLine2 || ''} onChange={(e)=>setNewAddress({...newAddress, addressLine2: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City *</label>
                    <input type="text" required value={newAddress.city} onChange={(e)=>setNewAddress({...newAddress, city: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State *</label>
                    <input type="text" required value={newAddress.state} onChange={(e)=>setNewAddress({...newAddress, state: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Postal Code *</label>
                    <input type="text" required value={newAddress.postalCode} onChange={(e)=>setNewAddress({...newAddress, postalCode: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country *</label>
                    <input type="text" required value={newAddress.country} onChange={(e)=>setNewAddress({...newAddress, country: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone *</label>
                    <input type="tel" required value={newAddress.phone} onChange={(e)=>setNewAddress({...newAddress, phone: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Latitude</label>
                    <input type="text" value={newAddress.latitude || ''} onChange={(e)=>setNewAddress({...newAddress, latitude: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Longitude</label>
                    <input type="text" value={newAddress.longitude || ''} onChange={(e)=>setNewAddress({...newAddress, longitude: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Landmark</label>
                    <input type="text" value={newAddress.landmark || ''} onChange={(e)=>setNewAddress({...newAddress, landmark: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>

                  <div className="md:col-span-2 flex items-center gap-3 pt-2">
                    <Button type="submit" disabled={createLoading}>
                      {editMode ? (savingEdit ? 'Saving...' : 'Save Changes') : (createLoading ? 'Adding...' : 'Add Address')}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => { setShowAddForm(false); setEditMode(false); }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>

            
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
                <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  id="addressLine1"
                  required
                  value={shippingInfo.addressLine1}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, addressLine1: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">
                  Address Line 2
                </label>
                <input
                  type="text"
                  id="addressLine2"
                  value={shippingInfo.addressLine2 || ''}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, addressLine2: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="landmark" className="block text-sm font-medium text-gray-700">
                  Landmark
                </label>
                <input
                  type="text"
                  id="landmark"
                  value={shippingInfo.landmark || ''}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, landmark: e.target.value })
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
                <Select
                  value={shippingInfo.state}
                  onValueChange={(value) => setShippingInfo({ ...shippingInfo, state: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {indianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                  District *
                </label>
                <Select
                  value={shippingInfo.district}
                  onValueChange={(value) => setShippingInfo({ ...shippingInfo, district: value })}
                  disabled={!shippingInfo.state}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={
                      shippingInfo.state ? 'Select District' : 'Select State First'
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
        
        {currentStep === 'payment' && renderPaymentButton()}
        
        {currentStep === 'review' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Review Your Order</h2>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Shipping Information</h3>
                <div className="mt-2 text-gray-600">
                  <p>{`${shippingInfo.firstName} ${shippingInfo.lastName}`}</p>
                  <p>{shippingInfo.addressLine1}</p>
                  {shippingInfo.addressLine2 && <p>{shippingInfo.addressLine2}</p>}
                  <p>{`${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.postalCode}`}</p>
                  <p>{shippingInfo.country}</p>
                  {shippingInfo.landmark && <p className="text-sm text-gray-500">Landmark: {shippingInfo.landmark}</p>}
                  <p className="mt-2">{shippingInfo.email}</p>
                  <p>{shippingInfo.phone}</p>
                </div>
              </div>
              
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Payment Method</h3>
                <div className="mt-2 text-gray-600">
                  <p>Razorpay</p>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item._id} className="flex justify-between">
                      <div>
                        <p className="font-medium">{item.product.title}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatINR(item.product.price * item.quantity)}</p>
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
              <Button 
                type="button"
                onClick={() => setCurrentStep('payment')} 
                className="px-6"
              >
                Go to Payment
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

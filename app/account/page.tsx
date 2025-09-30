'use client'

import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'
import { AuthModal } from '@/components/auth/auth-modal'
import { User, Package, MapPin, Heart, LogOut } from 'lucide-react'
import { API_BASE_URL, type Address, fetchOrders, type Order } from '@/lib/api'
import { toast } from 'sonner'
import { LocationButton } from '@/components/checkout/LocationButton'
import { useWishlist } from '@/contexts/wishlist-context'

export default function AccountPage() {
  const { user, logout } = useAuth()
  const { wishlist, loading: wishlistLoading, fetchWishlist, removeFromWishlist } = useWishlist()
  const router = useRouter()
  const [authOpen,setAuthOpen]=useState(false);
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [serverProfile, setServerProfile] = useState<{
    _id?: string
    name?: string
    email?: string
    role?: string
    isActive?: boolean
    phone?: string
    address?: string
    createdAt?: string
    updatedAt?: string
  } | null>(null)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  // Addresses state (reusing API used in checkout)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressesLoading, setAddressesLoading] = useState(false)
  const [addressesError, setAddressesError] = useState<string | null>(null)
  
  // Orders state
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState<string | null>(null)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
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

  useEffect(() => {
    const fetchMe = async () => {
      if (!user?.token) return
      try {
        setLoadingProfile(true)
        const res = await fetch(`${API_BASE_URL}/users/me`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
        })
        if (!res.ok) return
        const data = await res.json()
        if (data?.user) {
          setServerProfile(data.user)
          // Update form data with server profile data if not editing
          if (!isEditing) {
            setFormData({
              name: data.user.name || '',
              email: data.user.email || '',
              phone: data.user.phone || '',
            })
          }
        }
      } finally {
        setLoadingProfile(false)
      }
    }
    fetchMe()
  }, [user?.token])

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrdersData = async () => {
      if (!user?.token) return
      setOrdersLoading(true)
      setOrdersError(null)
      try {
        const ordersData = await fetchOrders(user.token)
        // Only show paid orders
        const paidOrders = ordersData.filter(order => order.status === 'paid')
        setOrders(paidOrders)
      } catch (error: any) {
        console.error('Failed to fetch orders:', error)
        setOrdersError(error.message || 'Failed to fetch orders')
      } finally {
        setOrdersLoading(false)
      }
    }
    fetchOrdersData()
  }, [user?.token])

  // Fetch saved addresses from backend
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user?.token) return
      setAddressesLoading(true)
      setAddressesError(null)
      try {
        const res = await fetch(`${API_BASE_URL}/addresses`, {
          method: 'GET',
          headers: { Accept: 'application/json', Authorization: `Bearer ${user.token}` },
        })
        const data = await res.json().catch(() => ({} as any))
        if (!res.ok) throw new Error(data?.message || 'Failed to fetch addresses')
        const list: Address[] = (Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : data?.addresses) || []
        setAddresses(list)
      } catch (e: any) {
        setAddressesError(e?.message || 'Unable to load addresses')
      } finally {
        setAddressesLoading(false)
      }
    }
    fetchAddresses()
  }, [user?.token])

  // Fetch wishlist when user changes
  useEffect(() => {
    if (user?.token) {
      fetchWishlist()
    }
    // Note: fetchWishlist iintentionally excluded from dependencies to prevent infinite loop
    // since it's a function from the wishlist context that gets recreated on every render
  }, [user?.token])

  const handleStartEdit = () => {
    setFormData({
      name: serverProfile?.name || user?.name || '',
      email: serverProfile?.email || user?.email || '',
      phone: serverProfile?.phone || user?.phone || '',
    })
    setIsEditing(true)
  }

  const handleCreateAddress = async (e?: React.FormEvent) => {
    if (e && 'preventDefault' in e) e.preventDefault()
    if (!user?.token) return
    // Basic required fields
    if (!newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.postalCode || !newAddress.country) {
      toast.error('Please fill all required fields')
      return
    }
    setCreateLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/addresses`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          ...newAddress,
          latitude: (newAddress.latitude || '').toString(),
          longitude: (newAddress.longitude || '').toString(),
        }),
      })
      const data = await res.json().catch(() => ({} as any))
      if (!res.ok) throw new Error(data?.message || 'Failed to create address')
      // Refresh list
      setShowAddAddress(false)
      setNewAddress({ fullName: '', addressLine1: '', addressLine2: '', city: '', state: '', district: '', postalCode: '', country: 'India', phone: '', latitude: '', longitude: '', landmark: '' })
      // Re-fetch
      try {
        const res2 = await fetch(`${API_BASE_URL}/addresses`, {
          method: 'GET',
          headers: { Accept: 'application/json', Authorization: `Bearer ${user.token}` },
        })
        const data2 = await res2.json().catch(() => ({} as any))
        if (res2.ok) {
          const list: Address[] = (Array.isArray(data2?.data) ? data2.data : Array.isArray(data2) ? data2 : data2?.addresses) || []
          setAddresses(list)
        }
      } catch {}
      toast.success('Address added successfully')
    } catch (e: any) {
      toast.error(e?.message || 'Error adding address')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.token) return
    const payload: Record<string, any> = {
      name: formData.name,
      phone: formData.phone,
    }
    try {
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) return
      const data = await res.json()
      if (data?.user) {
        // update server view
        // @ts-ignore
        setServerProfile(data.user)
        setIsEditing(false)
      }
    } catch {}
  }

  // Simple icon components with proper TypeScript types
  const UserIcon = ({ className }: { className?: string }) => (
    <User className={className} />
  )
  
  const PackageIcon = ({ className }: { className?: string }) => (
    <Package className={className} />
  )
  
  const MapPinIcon = ({ className }: { className?: string }) => (
    <MapPin className={className} />
  )
  
  const HeartIcon = ({ className }: { className?: string }) => (
    <Heart className={className} />
  )
  
  const LogOutIcon = ({ className }: { className?: string }) => (
    <LogOut className={className} />
  )

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-800">Sign in to view your account</h2>
        <p className="mt-2 text-gray-600">Please sign in to access your account details.</p>
        <div className="mt-6 space-x-3">
          <Button onClick={() => setAuthOpen(true)}>
            Sign In
          </Button>
          <Button variant="outline" onClick={() => setAuthOpen(true)}>
            Create Account
          </Button>
        </div>
        <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user.name || 'User'}</p>
      </div>

      <Tabs defaultValue="profile" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <TabsList className="flex flex-col h-auto p-2 bg-transparent">
              <TabsTrigger 
                value="profile" 
                className="w-full justify-start data-[state=active]:bg-gray-100 data-[state=active]:shadow-none"
              >
                <UserIcon className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="orders" 
                className="w-full justify-start data-[state=active]:bg-gray-100 data-[state=active]:shadow-none"
              >
                <PackageIcon className="w-4 h-4 mr-2" />
                My Orders
              </TabsTrigger>
              <TabsTrigger 
                value="addresses" 
                className="w-full justify-start data-[state=active]:bg-gray-100 data-[state=active]:shadow-none"
              >
                <MapPinIcon className="w-4 h-4 mr-2" />
                Addresses
              </TabsTrigger>
              <TabsTrigger 
                value="wishlist" 
                className="w-full justify-start data-[state=active]:bg-gray-100 data-[state=active]:shadow-none"
              >
                <HeartIcon className="w-4 h-4 mr-2" />
                Wishlist
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-4 p-4 border-t">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => {
                  logout()
                  router.push('/')
                }}
              >
                <LogOutIcon className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <TabsContent value="profile" className="mt-0">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Profile Information</CardTitle>
                    {!isEditing ? (
                      <Button variant="outline" size="sm" onClick={handleStartEdit}>
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setIsEditing(false)
                            // Reset form data to original values
                            setFormData({
                              name: serverProfile?.name || user?.name || '',
                              email: serverProfile?.email || user?.email || '',
                              phone: serverProfile?.phone || user?.phone || '',
                            })
                          }}
                        >
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveProfile}>
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      {loadingProfile ? (
                        <div className="text-sm text-gray-600">Loading profile…</div>
                      ) : (
                        <>
                          <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="text-gray-900">{serverProfile?.name || user.name || '(please update your name)'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="text-gray-900">{serverProfile?.email || user.email || '(please update your email)'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone Number</p>
                            <p className="text-gray-900">{serverProfile?.phone || user.phone || '(please add your phone)'}</p>
                          </div>
                          <div>
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-medium text-gray-500">Saved Addresses</p>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setActiveTab('addresses')}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                Manage Addresses
                              </Button>
                            </div>
                            {addressesLoading ? (
                              <div className="mt-2 text-sm text-gray-500">Loading addresses...</div>
                            ) : addresses.length === 0 ? (
                              <p className="mt-2 text-sm text-gray-500">No saved addresses. Add one in the Addresses tab.</p>
                            ) : (
                              <div className="mt-2 space-y-3">
                                {addresses.map((address) => (
                                  <div 
                                    key={address._id} 
                                    className={`p-3 border rounded-md cursor-pointer transition-colors ${selectedAddressId === address._id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
                                    onClick={() => setSelectedAddressId(address._id || null)}
                                  >
                                    <div className="flex items-start">
                                      <div className="flex-1">
                                        <div className="flex items-center">
                                          <p className="font-medium">{address.fullName}</p>
                                          {selectedAddressId === address._id && (
                                            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">Default</span>
                                          )}
                                        </div>
                                        <p className="text-sm">{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}</p>
                                        <p className="text-sm">{address.city}, {address.state} {address.postalCode}</p>
                                        <p className="text-sm">{address.country}</p>
                                        {address.landmark && <p className="text-xs text-gray-500 mt-1">Landmark: {address.landmark}</p>}
                                        <p className="text-sm mt-1">Phone: {address.phone}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                        
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>My Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading orders...</p>
                    </div>
                  ) : ordersError ? (
                    <div className="text-center py-8">
                      <PackageIcon className="mx-auto h-12 w-12 text-red-400" />
                      <h3 className="mt-2 text-lg font-medium text-red-900">Error loading orders</h3>
                      <p className="mt-1 text-red-500">{ordersError}</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <PackageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-lg font-medium text-gray-900">No completed orders yet</h3>
                      <p className="mt-1 text-gray-500">You haven't completed any paid orders yet.</p>
                      <div className="mt-6">
                        <Button onClick={() => router.push('/products')}>
                          Start Shopping
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order._id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">Order #{order.orderNumber}</h4>
                              <p className="text-sm text-gray-500">
                                Placed on {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">₹{order.totalPrice}</p>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                order.status === 'paid' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex items-center space-x-3">
                                {item.image && (
                                  <img 
                                    src={item.image} 
                                    alt={item.title}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                </div>
                                <p className="text-sm font-medium text-gray-900">₹{item.price}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="addresses" className="mt-0">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Saved Addresses</CardTitle>
                    <Button size="sm" onClick={() => setShowAddAddress(s => !s)}>
                      {showAddAddress ? 'Close' : 'Add New Address'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {addressesLoading && (
                    <p className="text-sm text-gray-600">Loading addresses…</p>
                  )}
                  {addressesError && (
                    <p className="text-sm text-red-600">{addressesError}</p>
                  )}
                  {!addressesLoading && !addressesError && (
                    <>
                      {addresses.length === 0 ? (
                        <div className="text-center py-8">
                          <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-lg font-medium text-gray-900">No saved addresses</h3>
                          <p className="mt-1 text-gray-500">You haven't saved any addresses yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {addresses.map(addr => (
                            <div key={(addr._id || addr.addressLine1) + addr.postalCode} className="p-4 border rounded-md">
                              <div className="flex items-center justify-between">
                                <div>
                                 
                                  <p className="text-sm text-gray-700">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
                                  <p className="text-sm text-gray-700">{addr.city}, {addr.state} {addr.postalCode}, {addr.country}</p>
                                  {addr.landmark ? <p className="text-xs text-gray-500">Landmark: {addr.landmark}</p> : null}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {showAddAddress && (
                        <form onSubmit={handleCreateAddress} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Quick Location Detection for New Address */}
                          <div className="md:col-span-2">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                              <div className="flex items-center gap-3 mb-3">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <h4 className="text-sm font-medium text-blue-900">Quick Location Detection</h4>
                              </div>
                              <LocationButton
                                onLocationDetected={(locationData: any) => {
                                  setNewAddress({
                                    ...newAddress,
                                    // Don't auto-fill address fields - keep existing values
                                    city: locationData.city || newAddress.city,
                                    state: locationData.state || newAddress.state,
                                    postalCode: locationData.postalCode || newAddress.postalCode,
                                    country: locationData.country || 'India',
                                    latitude: locationData.latitude,
                                    longitude: locationData.longitude,
                                  })
                                  toast.success('Location detected!')
                                }}
                                className="w-full"
                              />
                              <p className="text-xs text-blue-700 mt-2">
                                Check your location
                              </p>
                            </div>
                          </div>
                         
                          <div className="md:col-span-2">
                            <Label htmlFor="fullName">Full Name *</Label>
                            <Input 
                              id="fullName" 
                              required 
                              value={newAddress.fullName} 
                              onChange={(e) => setNewAddress({...newAddress, fullName: e.target.value})} 
                              className="mt-1" 
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input 
                              id="phone" 
                              type="tel" 
                              required 
                              value={newAddress.phone} 
                              onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} 
                              className="mt-1" 
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="line1">Address Line 1 *</Label>
                            <Input 
                              id="line1" 
                              required 
                              value={newAddress.addressLine1} 
                              onChange={(e) => setNewAddress({...newAddress, addressLine1: e.target.value})} 
                              className="mt-1" 
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="line2">Address Line 2</Label>
                            <Input id="line2" value={newAddress.addressLine2 || ''} onChange={(e)=>setNewAddress({...newAddress, addressLine2: e.target.value})} className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="city">City *</Label>
                            <Input id="city" required value={newAddress.city} onChange={(e)=>setNewAddress({...newAddress, city: e.target.value})} className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="state">State *</Label>
                            <Input 
                              id="state" 
                              required 
                              value={newAddress.state} 
                              onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} 
                              className="mt-1" 
                            />
                          </div>
                          <div>
                            <Label htmlFor="district">District *</Label>
                            <Input 
                              id="district" 
                              required 
                              value={newAddress.district} 
                              onChange={(e) => setNewAddress({...newAddress, district: e.target.value})} 
                              className="mt-1" 
                            />
                          </div>
                          <div>
                            <Label htmlFor="postal">Postal Code *</Label>
                            <Input id="postal" required value={newAddress.postalCode} onChange={(e)=>setNewAddress({...newAddress, postalCode: e.target.value})} className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="country">Country *</Label>
                            <Input id="country" required value={newAddress.country} onChange={(e)=>setNewAddress({...newAddress, country: e.target.value})} className="mt-1" />
                          </div>
                        
                          <div className="md:col-span-2 flex items-center gap-3 pt-2">
                            <Button type="submit" disabled={createLoading}>{createLoading ? 'Adding…' : 'Add Address'}</Button>
                            <Button type="button" variant="outline" onClick={()=>setShowAddAddress(false)}>Cancel</Button>
                          </div>
                        </form>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wishlist" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Wishlist ({wishlist.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {wishlistLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading wishlist....</p>
                    </div>
                  ) : wishlist.length === 0 ? (
                    <div className="text-center py-8">
                      <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-lg font-medium text-gray-900">Your wishlist is empty</h3>
                      <p className="mt-1 text-gray-500">Save items you love for easy access later.</p>
                      <div className="mt-6">
                        <Button onClick={() => router.push('/products')}>
                          Browse Products
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {wishlist.map((item) => (
                        <div key={item._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start space-x-3">
                            {item.product.images?.[0] && (
                              <img 
                                src={item.product.images[0]} 
                                alt={item.product.title}
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {item.product.title}
                              </h4>
                              <p className="text-sm text-gray-500">₹{item.product.price}</p>
                              <div className="mt-2 flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => router.push(`/products/${item.product._id}`)}
                                >
                                  View
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={async () => {
                                    try {
                                      await removeFromWishlist(item.product._id)
                                      toast.success('Removed from wishlist')
                                    } catch (error) {
                                      toast.error('Failed to remove from wishlist')
                                    }
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}

// Simple icon components (you can replace these with actual icons from your icon library)
function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function PackageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  )
}

function MapPinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  )
}

function LogOutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  )
}

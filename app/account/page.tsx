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
import { API_BASE_URL, type Address } from '@/lib/api'
import { toast } from 'sonner'
import { LocationButton } from '@/components/checkout/LocationButton'

export default function AccountPage() {
  const { user, logout } = useAuth()
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
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    addressBuilding: '',
    addressStreet: '',
    addressDistrict: '',
    addressPincode: '',
    addressState: '',
  })

  // Addresses state (reusing API used in checkout)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressesLoading, setAddressesLoading] = useState(false)
  const [addressesError, setAddressesError] = useState<string | null>(null)
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
        }
      } finally {
        setLoadingProfile(false)
      }
    }
    fetchMe()
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

  const handleCreateAddress = async (e?: React.FormEvent) => {
    if (e && 'preventDefault' in e) e.preventDefault()
    if (!user?.token) return
    // Basic required fields
    if (!newAddress.fullName || !newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.postalCode || !newAddress.phone) {
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
    const composedAddress = [
      formData.addressBuilding,
      formData.addressStreet,
      formData.addressDistrict,
      formData.addressState,
      formData.addressPincode,
    ]
      .map((p) => (p || '').trim())
      .filter(Boolean)
      .join(', ')
    const payload: Record<string, any> = {
      name: formData.name,
      phone: formData.phone,
      address: composedAddress,
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
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setIsEditing(false)
                            setFormData({
                              name: serverProfile?.name || user.name || '',
                              email: serverProfile?.email || user.email || '',
                              phone: serverProfile?.phone || user.phone || '',
                              addressBuilding: '',
                              addressStreet: '',
                              addressDistrict: '',
                              addressPincode: '',
                              addressState: '',
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="addressBuilding">Building / House</Label>
                          <Input
                            id="addressBuilding"
                            name="addressBuilding"
                            value={formData.addressBuilding}
                            onChange={handleInputChange}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="addressStreet">Street / Road</Label>
                          <Input
                            id="addressStreet"
                            name="addressStreet"
                            value={formData.addressStreet}
                            onChange={handleInputChange}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="addressDistrict">District</Label>
                          <Input
                            id="addressDistrict"
                            name="addressDistrict"
                            value={formData.addressDistrict}
                            onChange={handleInputChange}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="addressState">State</Label>
                          <Input
                            id="addressState"
                            name="addressState"
                            value={formData.addressState}
                            onChange={handleInputChange}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="addressPincode">Pincode</Label>
                          <Input
                            id="addressPincode"
                            name="addressPincode"
                            value={formData.addressPincode}
                            onChange={handleInputChange}
                            className="mt-1"
                          />
                        </div>
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
                            <p className="text-gray-900">{serverProfile?.name || user.name || 'Not provided (please update your name)'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="text-gray-900">{serverProfile?.email || user.email || 'Not provided (please update your email)'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone Number</p>
                            <p className="text-gray-900">{serverProfile?.phone || user.phone || 'Not provided (please add your phone)'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Address</p>
                            {addresses.length > 0 ? (
                              <div className="text-gray-900">
                                <p>{addresses[0].addressLine1}{addresses[0].addressLine2 ? `, ${addresses[0].addressLine2}` : ''}</p>
                                <p>{addresses[0].city}, {addresses[0].state} {addresses[0].postalCode}</p>
                                <p>{addresses[0].country}</p>
                                {addresses[0].landmark ? <p className="text-gray-700 text-sm">Landmark: {addresses[0].landmark}</p> : null}
                              </div>
                            ) : (
                              <p className="text-gray-900">{serverProfile?.address || 'Not provided (please add your address)'}</p>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Role</p>
                              <p className="text-gray-900">{serverProfile?.role || 'customer'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Status</p>
                              <p className="text-gray-900">{serverProfile?.isActive ? 'Active' : 'Inactive'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Joined</p>
                              <p className="text-gray-900">{serverProfile?.createdAt ? new Date(serverProfile.createdAt).toLocaleDateString() : '—'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Updated</p>
                              <p className="text-gray-900">{serverProfile?.updatedAt ? new Date(serverProfile.updatedAt).toLocaleDateString() : '—'}</p>
                            </div>
                          </div>
                          {!serverProfile?.phone || !serverProfile?.address ? (
                            <div className="pt-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                              Some details are missing. Please click "Edit Profile" to update your information.
                            </div>
                          ) : null}
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
                  <div className="text-center py-8">
                    <PackageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No orders yet</h3>
                    <p className="mt-1 text-gray-500">You haven't placed any orders yet.</p>
                    <div className="mt-6">
                      <Button onClick={() => router.push('/products')}>
                        Start Shopping
                      </Button>
                    </div>
                  </div>
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
                                  <p className="font-medium text-gray-900">{addr.fullName} <span className="text-gray-500 font-normal">• {addr.phone}</span></p>
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
                                    addressLine1: locationData.addressLine1 || newAddress.addressLine1,
                                    addressLine2: locationData.addressLine2 || newAddress.addressLine2,
                                    city: locationData.city || newAddress.city,
                                    state: locationData.state || newAddress.state,
                                    postalCode: locationData.postalCode || newAddress.postalCode,
                                    country: locationData.country || 'India',
                                    latitude: locationData.latitude,
                                    longitude: locationData.longitude,
                                  })
                                  toast.success('Location detected! Please verify and complete the remaining fields.')
                                }}
                                className="w-full"
                              />
                              <p className="text-xs text-blue-700 mt-2">
                                Click to auto-detect your location and pre-fill address fields, then complete any missing information below.
                              </p>
                            </div>
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="fullName">Full Name *</Label>
                            <Input id="fullName" required value={newAddress.fullName} onChange={(e)=>setNewAddress({...newAddress, fullName: e.target.value})} className="mt-1" />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="line1">Address Line 1 *</Label>
                            <Input id="line1" required value={newAddress.addressLine1} onChange={(e)=>setNewAddress({...newAddress, addressLine1: e.target.value})} className="mt-1" />
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
                            <Input id="state" required value={newAddress.state} onChange={(e)=>setNewAddress({...newAddress, state: e.target.value})} className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="postal">Postal Code *</Label>
                            <Input id="postal" required value={newAddress.postalCode} onChange={(e)=>setNewAddress({...newAddress, postalCode: e.target.value})} className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="country">Country *</Label>
                            <Input id="country" required value={newAddress.country} onChange={(e)=>setNewAddress({...newAddress, country: e.target.value})} className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone *</Label>
                            <Input id="phone" required value={newAddress.phone} onChange={(e)=>setNewAddress({...newAddress, phone: e.target.value})} className="mt-1" />
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
                  <CardTitle>Wishlist</CardTitle>
                </CardHeader>
                <CardContent>
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

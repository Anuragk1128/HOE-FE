'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fetchAdminOrders, updateOrderStatus, type Order } from '@/lib/api'
import { formatINR } from '@/lib/format'
import { toast } from 'sonner'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params: any = {}
      if (statusFilter) params.status = statusFilter
      
      const response = await fetchAdminOrders(params)
      setOrders(response.orders)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrder(orderId)
      
      let trackingInfo = undefined
      if (newStatus === 'shipped') {
        const trackingNumber = prompt('Enter tracking number:')
        const carrier = prompt('Enter carrier name:')
        if (trackingNumber) {
          trackingInfo = {
            trackingNumber,
            carrier: carrier || 'Unknown',
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
          }
        }
      }
      
      await updateOrderStatus(orderId, newStatus, trackingInfo)
      toast.success('Order status updated successfully')
      await fetchOrders() // Refresh the list
    } catch (err) {
      console.error('Failed to update order status:', err)
      toast.error('Failed to update order status')
    } finally {
      setUpdatingOrder(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-purple-100 text-purple-800'
      case 'shipped': return 'bg-indigo-100 text-indigo-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerDetails.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchOrders}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
        <Button onClick={fetchOrders} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search">Search Orders</Label>
          <Input
            id="search"
            placeholder="Search by order number, customer name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="status">Filter by Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter 
                  ? 'Try adjusting your search criteria'
                  : 'No orders have been placed yet'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order._id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>Customer: {order.shippingAddress.fullName}</span>
                      <span>Email: {order.customerDetails.email}</span>
                      <span>Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{formatINR(order.totalPrice)}</div>
                      <div className="text-sm text-gray-500">{order.items.length} item(s)</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium mb-3">Order Items</h4>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={`${item.product._id}-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-12 h-12 bg-white rounded-md overflow-hidden">
                            <img 
                              src={item.product.images?.[0] || '/placeholder-product.jpg'} 
                              alt={item.product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{item.title || item.product.title}</h5>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            {(item.sku || item.product.sku) && (
                              <p className="text-xs text-gray-400">SKU: {item.sku || item.product.sku}</p>
                            )}
                            {item.category && (
                              <p className="text-xs text-gray-400">Category: {item.category}</p>
                            )}
                            {item.weight && (
                              <p className="text-xs text-gray-400">Weight: {item.weight}kg</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-sm">{formatINR(item.finalPrice || item.totalPrice || (item.price * item.quantity))}</div>
                            {item.quantity > 1 && (
                              <div className="text-xs text-gray-500">{formatINR(item.unitPrice || item.price)} each</div>
                            )}
                            {(item.taxAmount || 0) > 0 && (
                              <div className="text-xs text-gray-500">Tax: {formatINR(item.taxAmount || 0)}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div>
                    <h4 className="font-medium mb-3">Order Details</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <h5 className="font-medium text-sm mb-2">Shipping Address</h5>
                        <p className="text-sm text-gray-600">
                          {order.shippingAddress.fullName}<br />
                          {order.shippingAddress.addressLine1}<br />
                          {order.shippingAddress.addressLine2 && `${order.shippingAddress.addressLine2}<br />`}
                          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                          {order.shippingAddress.country}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Phone: {order.shippingAddress.phone}</p>
                        {order.shippingAddress.landmark && (
                          <p className="text-sm text-gray-500">Landmark: {order.shippingAddress.landmark}</p>
                        )}
                      </div>

                      {order.billingAddress && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <h5 className="font-medium text-sm mb-2">Billing Address</h5>
                          <p className="text-sm text-gray-600">
                            {order.billingAddress.fullName}<br />
                            {order.billingAddress.addressLine1}<br />
                            {order.billingAddress.addressLine2 && `${order.billingAddress.addressLine2}<br />`}
                            {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}<br />
                            {order.billingAddress.country}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">Phone: {order.billingAddress.phone}</p>
                          {order.billingAddress.landmark && (
                            <p className="text-sm text-gray-500">Landmark: {order.billingAddress.landmark}</p>
                          )}
                        </div>
                      )}

                      <div className="p-3 bg-gray-50 rounded-lg">
                        <h5 className="font-medium text-sm mb-2">Payment Details</h5>
                        <p className="text-sm text-gray-600">
                          Method: {order.paymentMethod}<br />
                          Amount: {formatINR(order.totalPrice)}<br />
                          {order.razorpayDetails && (
                            <>
                              {order.razorpayDetails.razorpayOrderId && (
                                <>Order ID: {order.razorpayDetails.razorpayOrderId}<br /></>
                              )}
                              {order.razorpayDetails.razorpayPaymentId && (
                                <>Payment ID: {order.razorpayDetails.razorpayPaymentId}<br /></>
                              )}
                              Status: <Badge className={getStatusColor(order.razorpayDetails.paymentStatus)}>
                                {order.razorpayDetails.paymentStatus}
                              </Badge>
                            </>
                          )}
                        </p>
                      </div>

                      {order.shipmentDetails && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h5 className="font-medium text-sm mb-2">Shipment Information</h5>
                          {order.shipmentDetails.awbNumber && (
                            <p className="text-sm text-blue-700">AWB: {order.shipmentDetails.awbNumber}</p>
                          )}
                          {order.shipmentDetails.courierPartner && (
                            <p className="text-sm text-blue-700">Courier: {order.shipmentDetails.courierPartner}</p>
                          )}
                          {order.shipmentDetails.trackingUrl && (
                            <p className="text-sm text-blue-700">
                              <a href={order.shipmentDetails.trackingUrl} target="_blank" rel="noopener noreferrer" className="underline">
                                Track Package
                              </a>
                            </p>
                          )}
                          {order.shipmentDetails.estimatedDeliveryDate && (
                            <p className="text-sm text-blue-700">Est. Delivery: {new Date(order.shipmentDetails.estimatedDeliveryDate).toLocaleDateString('en-IN')}</p>
                          )}
                          {order.shipmentDetails.lastTrackingUpdate && (
                            <div className="mt-2">
                              <p className="text-xs text-blue-600">Last Update:</p>
                              <p className="text-sm text-blue-700">{order.shipmentDetails.lastTrackingUpdate.description}</p>
                              <p className="text-xs text-blue-600">{new Date(order.shipmentDetails.lastTrackingUpdate.timestamp).toLocaleString('en-IN')}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Order Summary</h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Items:</span>
                      <div className="font-medium">{formatINR(order.itemsPrice)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Tax:</span>
                      <div className="font-medium">{formatINR(order.taxPrice)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Shipping:</span>
                      <div className="font-medium">{formatINR(order.shippingPrice)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Total:</span>
                      <div className="font-bold text-lg">{formatINR(order.totalPrice)}</div>
                    </div>
                  </div>
                </div>

                {/* Status Update Actions */}
                <div className="mt-6 pt-6 border-t flex justify-end gap-3">
                  {order.status === 'pending' && (
                    <Button 
                      onClick={() => handleStatusUpdate(order._id, 'confirmed')}
                      disabled={updatingOrder === order._id}
                      variant="outline"
                    >
                      Confirm Order
                    </Button>
                  )}
                  {order.status === 'confirmed' && (
                    <Button 
                      onClick={() => handleStatusUpdate(order._id, 'processing')}
                      disabled={updatingOrder === order._id}
                      variant="outline"
                    >
                      Mark Processing
                    </Button>
                  )}
                  {order.status === 'processing' && (
                    <Button 
                      onClick={() => handleStatusUpdate(order._id, 'shipped')}
                      disabled={updatingOrder === order._id}
                      variant="outline"
                    >
                      Mark Shipped
                    </Button>
                  )}
                  {order.status === 'shipped' && (
                    <Button 
                      onClick={() => handleStatusUpdate(order._id, 'delivered')}
                      disabled={updatingOrder === order._id}
                      variant="outline"
                    >
                      Mark Delivered
                    </Button>
                  )}
                  {!['delivered', 'cancelled', 'refunded'].includes(order.status) && (
                    <Button 
                      onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                      disabled={updatingOrder === order._id}
                      variant="destructive"
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

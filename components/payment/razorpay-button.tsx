'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/utils';
import { openRazorpay } from '@/lib/payment';
import { toast } from 'sonner';
import { useCart } from '@/contexts/cart-context';
import { createOrder, type CreateOrderInput, type Address, type SellerDetails } from '@/lib/api';

export function RazorpayButton({
  amount,
  orderId,
  name,
  email,
  contact,
  shippingInfo,
  billingInfo,
  onSuccess,
  onError,
  disabled = false,
}: {
  amount: number;
  orderId: string;
  name: string;
  email: string;
  contact: string;
  shippingInfo: any;
  billingInfo?: any;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
}) {
  const { cart, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (disabled || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      await openRazorpay({
        amount,
        orderId,
        name,
        email,
        contact,
        items: cart.map((item) => ({
          product: item.product._id,
          title: item.product.title,
          image: item.product.images?.[0],
          price: item.product.price,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: shippingInfo.firstName ? `${shippingInfo.firstName} ${shippingInfo.lastName || ''}`.trim() : name,
          addressLine1: shippingInfo.addressLine1,
          addressLine2: shippingInfo.addressLine2,
          city: shippingInfo.city,
          state: shippingInfo.state,
          postalCode: shippingInfo.postalCode,
          country: shippingInfo.country || 'India',
          phone: shippingInfo.phone || contact,
          latitude: shippingInfo.latitude,
          longitude: shippingInfo.longitude,
          landmark: shippingInfo.landmark,
        },
        billingAddress: billingInfo?.sameAsShipping ? undefined : {
          fullName: (billingInfo && `${billingInfo.firstName} ${billingInfo.lastName || ''}`.trim()) || (shippingInfo.firstName ? `${shippingInfo.firstName} ${shippingInfo.lastName || ''}`.trim() : name),
          addressLine1: billingInfo?.addressLine1,
          addressLine2: billingInfo?.addressLine2,
          city: billingInfo?.city,
          state: billingInfo?.state,
          postalCode: billingInfo?.postalCode,
          country: billingInfo?.country || 'India',
          phone: billingInfo?.phone,
          latitude: billingInfo?.latitude,
          longitude: billingInfo?.longitude,
          landmark: billingInfo?.landmark,
        },
        onSuccess: async (paymentId: string, razorpayOrderId: string) => {
          try {
            // Create shipping address
            const shippingAddress: Address = {
              fullName: shippingInfo.firstName ? `${shippingInfo.firstName} ${shippingInfo.lastName || ''}`.trim() : name,
              addressLine1: shippingInfo.addressLine1,
              addressLine2: shippingInfo.addressLine2,
              city: shippingInfo.city,
              state: shippingInfo.state,
              postalCode: shippingInfo.postalCode,
              country: shippingInfo.country || 'India',
              phone: shippingInfo.phone || contact,
              landmark: shippingInfo.landmark,
              latitude: shippingInfo.latitude,
              longitude: shippingInfo.longitude,
            };

            // Create billing address if different from shipping
            const billingAddress: Address | undefined = billingInfo?.sameAsShipping ? undefined : {
              fullName: billingInfo ? `${billingInfo.firstName} ${billingInfo.lastName || ''}`.trim() : shippingAddress.fullName,
              addressLine1: billingInfo?.addressLine1 || shippingAddress.addressLine1,
              addressLine2: billingInfo?.addressLine2 || shippingAddress.addressLine2,
              city: billingInfo?.city || shippingAddress.city,
              state: billingInfo?.state || shippingAddress.state,
              postalCode: billingInfo?.postalCode || shippingAddress.postalCode,
              country: billingInfo?.country || shippingAddress.country,
              phone: billingInfo?.phone || shippingAddress.phone,
              landmark: billingInfo?.landmark || shippingAddress.landmark,
              latitude: billingInfo?.latitude || shippingAddress.latitude,
              longitude: billingInfo?.longitude || shippingAddress.longitude,
            };

            // Default seller details (should be configurable)
            const sellerDetails: SellerDetails = {
              address: {
                fullAddress: 'Your Store Address, City, State, Pincode',
                pincode: 123456,
                city: 'Your City',
                state: 'Your State',
                country: 'India',
              },
              contact: {
                name: 'Store Manager',
                mobile: 9876543210,
              },
            };

            // Create order with new structure
            const orderData: CreateOrderInput = {
              items: cart.map(item => ({
                productId: item.product._id,
                quantity: item.quantity,
                title: item.product.title,
                image: item.product.images?.[0],
                price: item.product.price,
                sku: item.product.sku,
                category: item.product.shippingCategory,
                weight: item.product.weightKg,
                dimensions: item.product.dimensionsCm ? {
                  length: item.product.dimensionsCm.length,
                  breadth: item.product.dimensionsCm.breadth,
                  height: item.product.dimensionsCm.height,
                } : undefined,
                hsnCode: item.product.hsnCode,
              })),
              customerDetails: {
                name: name,
                email: email,
                mobile: contact,
              },
              shippingAddress,
              billingAddress,
              sellerDetails,
              paymentMethod: 'online',
              razorpayDetails: {
                razorpayOrderId: razorpayOrderId,
                razorpayPaymentId: paymentId,
                paymentMethod: 'card', // or detect from Razorpay response
                paymentStatus: 'captured',
              },
              itemsPrice: amount,
              shippingPrice: 0, // Calculate based on shipping logic
              taxPrice: Math.round(amount * 0.18), // Calculate based on items
              totalPrice: amount,
              currency: 'INR',
              orderNotes: `Order created via Razorpay payment. Payment ID: ${paymentId}`,
            };

            const order = await createOrder(orderData);
            console.log('Order created successfully:', order);

            // Clear cart and show success
            await clearCart();
            toast.success('Order placed successfully!');
            onSuccess?.();
          } catch (error) {
            console.error('Order creation error:', error);
            toast.error('Payment successful but failed to create order. Please contact support.');
            onError?.(error as Error);
          }
        },
        onError: (error: Error) => {
          console.error('Payment error:', error);
          toast.error(error.message || 'Payment failed. Please try again.');
          onError?.(error);
        },
      });
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process payment. Please try again.');
      onError?.(error as Error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-blue-800">Secure Payment</h3>
        <p className="mt-1 text-sm text-blue-700">
          You will be redirected to Razorpay's secure payment page to complete your purchase.
        </p>
      </div>
      
      <div className="mt-8">
        <Button
          onClick={handlePayment}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={disabled || isProcessing}
        >
          {isProcessing ? 'Processing...' : `Pay Securely - ${formatINR(amount)}`}
        </Button>
        
        <div className="mt-4 flex items-center justify-center">
          <img 
            src="https://res.cloudinary.com/deamrxfwp/image/upload/v1758003588/Razorpay-Logo_lzrhke.jpg" 
            alt="Razorpay" 
            className="h-6 opacity-80"
          />
        </div>
      </div>
    </div>
  );
}

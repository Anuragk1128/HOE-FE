'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/utils';
import { openRazorpay } from '@/lib/payment';
import { toast } from 'sonner';
import { useCart } from '@/contexts/cart-context';
// Removed unused createOrder-related types to prevent accidental duplicate order creation

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
        onSuccess: async (_paymentId: string, _razorpayOrderId: string) => {
          try {
            // The order record is already handled by backend initiate/confirm & webhook
            await clearCart();
            toast.success('Payment successful! Order placed.');
            onSuccess?.();
          } catch (error) {
            console.error('Post-payment cleanup error:', error);
            toast.error('Payment successful, but there was an issue clearing your cart.');
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

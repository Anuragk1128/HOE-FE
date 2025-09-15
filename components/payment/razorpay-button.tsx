'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/utils';
import { openRazorpay } from '@/lib/payment';
import { toast } from 'sonner';
import { useCart } from '@/contexts/cart-context';
import { API_BASE_URL } from '@/lib/api';

export function RazorpayButton({
  amount,
  orderId,
  name,
  email,
  contact,
  shippingInfo,
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
          quantity: item.quantity,
          price: item.product.price,
        })),
        shippingAddress: {
          fullName: shippingInfo.firstName ? `${shippingInfo.firstName} ${shippingInfo.lastName || ''}`.trim() : name,
          addressLine1: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          postalCode: shippingInfo.postalCode,
          country: shippingInfo.country || 'India',
          phone: shippingInfo.phone || contact,
        },
        onSuccess: async (paymentId: string, razorpayOrderId: string) => {
          try {
            // Call your order creation API here
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/orders`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                paymentId,
                orderId: razorpayOrderId,
                amount,
                shippingInfo,
                items: cart.map(item => ({
                  product: item.product._id,
                  quantity: item.quantity,
                  price: item.product.price
                }))
              }),
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.message || 'Failed to create order');
            }

            // Clear cart and show success
            await clearCart();
            toast.success('Order placed successfully!');
            onSuccess?.();
          } catch (error) {
            console.error('Order creation error:', error);
            toast.error('Order created but there was an issue updating the status.');
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
            src="https://razorpay.com/build/browser/static/razorpay-logo.5a165a21.svg" 
            alt="Razorpay" 
            className="h-6 opacity-80"
          />
        </div>
      </div>
    </div>
  );
}

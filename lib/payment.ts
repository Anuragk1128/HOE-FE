import { loadRazorpayScript } from '@/utils/razorpay';
import { API_BASE_URL } from './api';

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface InitiatePaymentResponse {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
}

export const initiatePayment = async (amount: number, orderId: string): Promise<InitiatePaymentResponse> => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}/payments/initiate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount: amount * 100, // Convert to paise
      orderId,
      currency: 'INR',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to initiate payment');
  }

  return response.json();
};

export const verifyPayment = async (paymentResponse: RazorpayPaymentResponse) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}/payments/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(paymentResponse),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Payment verification failed');
  }

  return response.json();
};

export const openRazorpay = async (options: {
  amount: number;
  orderId: string;
  name: string;
  email: string;
  contact: string;
  onSuccess: (paymentId: string, orderId: string) => void;
  onError: (error: Error) => void;
}) => {
  try {
    // Load Razorpay script if not already loaded
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error('Failed to load Razorpay');
    }

    // Get payment details from your API
    const paymentData = await initiatePayment(options.amount, options.orderId);

    const razorpayOptions = {
      key: paymentData.key,
      amount: paymentData.amount.toString(),
      currency: paymentData.currency,
      name: 'Your Store Name',
      description: 'Order Payment',
      order_id: paymentData.orderId,
      handler: async function (response: RazorpayPaymentResponse) {
        try {
          await verifyPayment(response);
          options.onSuccess(response.razorpay_payment_id, response.razorpay_order_id);
        } catch (error) {
          options.onError(error as Error);
        }
      },
      prefill: {
        name: options.name,
        email: options.email,
        contact: options.contact,
      },
      theme: {
        color: '#3399cc',
      },
      modal: {
        ondismiss: () => {
          options.onError(new Error('Payment cancelled by user'));
        },
      },
    };

    const razorpay = new (window as any).Razorpay(razorpayOptions);
    razorpay.open();
  } catch (error) {
    options.onError(error as Error);
  }
};

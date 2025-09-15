import { loadRazorpayScript } from '@/utils/razorpay';
import { API_BASE_URL } from './api';

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface InitiatePaymentResponse {
  orderId?: string; // some APIs return orderId
  id?: string;      // some return id
  amount: number | string;
  currency: string;
  key?: string;     // can be key
  key_id?: string;  // or key_id
}

type InitiatePayload = {
  amount: number; // paise
  orderId: string;
  currency: string;
  items: Array<{ product: string; quantity: number; price: number }>;
  customerDetails: { name: string; email: string; mobile: string };
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  receipt?: string;
};

export const initiatePayment = async (payloadIn: InitiatePayload): Promise<InitiatePaymentResponse> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Not authenticated. Please login to proceed with payment.');
  }
  const payload = { ...payloadIn, receipt: payloadIn.receipt || payloadIn.orderId };
  console.debug('[Razorpay] initiate request:', `${API_BASE_URL}/orders/payment/initiate`, payload);
  const response = await fetch(`${API_BASE_URL}/orders/payment/initiate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = `Failed to initiate payment (status ${response.status})`;
    try {
      const text = await response.text();
      console.error('[Razorpay] initiatePayment error body:', text);
      try {
        const error = JSON.parse(text);
        message = error.message || message;
      } catch {}
    } catch {}
    throw new Error(message);
  }

  return response.json();
};

export const verifyPayment = async (
  paymentResponse: RazorpayPaymentResponse,
  meta: { amount: number; orderId: string }
) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}/orders/payment/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...paymentResponse,
      amount: meta.amount, // paise or as expected by your backend
      orderId: meta.orderId,
    }),
  });

  if (!response.ok) {
    let message = `Payment verification failed (status ${response.status})`;
    try {
      const text = await response.text();
      console.error('[Razorpay] verifyPayment error body:', text);
      try {
        const error = JSON.parse(text);
        message = error.message || message;
      } catch {}
    } catch {}
    throw new Error(message);
  }

  return response.json();
};

export const openRazorpay = async (options: {
  amount: number; // rupees
  orderId: string;
  name: string;
  email: string;
  contact: string;
  items: Array<{ product: string; quantity: number; price: number }>;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  onSuccess: (paymentId: string, orderId: string) => void;
  onError: (error: Error) => void;
}) => {
  try {
    // Load Razorpay script if not already loaded
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      console.error('[Razorpay] checkout.js failed to load');
      throw new Error('Unable to load Razorpay. Check your network and try again.');
    }

    // Get payment details from your API
    const paymentData = await initiatePayment({
      amount: Math.round(options.amount * 100), // ensure paise
      orderId: options.orderId,
      currency: 'INR',
      items: options.items,
      customerDetails: { name: options.name, email: options.email, mobile: options.contact },
      shippingAddress: options.shippingAddress,
    });
    console.debug('[Razorpay] initiatePayment response:', paymentData);

    // Normalize fields and add fallback for key
    const resolvedKey = (paymentData as any).key || (paymentData as any).key_id || (process as any)?.env?.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const resolvedOrderId = (paymentData as any).orderId || (paymentData as any).id;
    const resolvedAmount = typeof paymentData.amount === 'string' ? paymentData.amount : String(paymentData.amount);

    if (!resolvedKey) {
      throw new Error('Missing Razorpay key. Ensure backend returns key/key_id or set NEXT_PUBLIC_RAZORPAY_KEY_ID.');
    }
    if (!resolvedOrderId) {
      throw new Error('Missing Razorpay order_id. Ensure backend returns orderId or id.');
    }

    const razorpayOptions = {
      key: resolvedKey,
      amount: resolvedAmount,
      currency: paymentData.currency,
      name: 'Your Store Name',
      description: 'Order Payment',
      order_id: resolvedOrderId,
      handler: async function (response: RazorpayPaymentResponse) {
        try {
          await verifyPayment(response, {
            amount: Number(resolvedAmount),
            orderId: resolvedOrderId,
          });
          options.onSuccess(response.razorpay_payment_id, response.razorpay_order_id);
        } catch (error) {
          console.error('[Razorpay] verifyPayment error:', error);
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
    } as any;

    if (!(window as any).Razorpay) {
      console.error('[Razorpay] window.Razorpay not available after script load');
      throw new Error('Razorpay is not available. Please refresh and try again.');
    }

    const razorpay = new (window as any).Razorpay(razorpayOptions);
    // Capture explicit failure event for more context
    razorpay.on('payment.failed', function (resp: any) {
      const reason = resp?.error?.description || 'Payment failed';
      console.error('[Razorpay] payment.failed:', resp);
      options.onError(new Error(reason));
    });
    razorpay.open();
  } catch (error) {
    console.error('[Razorpay] open error:', error);
    options.onError(error as Error);
  }
};

import { loadRazorpayScript } from '@/utils/razorpay';
import { API_BASE_URL } from './api';

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface InitiatePaymentResponse {
  razorpayOrderId: string;    // backend-provided
  razorpayKeyId: string;      // backend-provided
  amount: number | string;    // amount in paise
  currency: string;           // e.g., 'INR'
  orderId: string;            // your platform order id
  orderNumber: string;        // human friendly order number
}

type InitiatePayload = {
  items: Array<{ product: string; title: string; image?: string; price: number; quantity: number }>;
  customerDetails: { name: string; email: string; mobile: string };
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    latitude?: string;
    longitude?: string;
    landmark?: string;
  };
  billingAddress?: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    latitude?: string;
    longitude?: string;
    landmark?: string;
  };
  paymentMethod: 'online';
};

export const initiatePayment = async (payloadIn: InitiatePayload): Promise<InitiatePaymentResponse> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Not authenticated. Please login to proceed with payment.');
  }
  const payload = { ...payloadIn };
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
) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}/orders/payment/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_signature: paymentResponse.razorpay_signature,
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
  amount: number; // rupees (for UI only; backend computes real amount)
  orderId: string; // local order identifier (not sent to initiate API)
  name: string;
  email: string;
  contact: string;
  items: Array<{ product: string; title: string; image?: string; price: number; quantity: number }>;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    latitude?: string;
    longitude?: string;
    landmark?: string;
  };
  billingAddress?: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    latitude?: string;
    longitude?: string;
    landmark?: string;
  };
  onSuccess: (paymentId: string, orderId: string) => void;
  onError: (error: Error) => void;
}) => {
  try {
    // Load Razorpay script first to fail fast if unavailable
    console.debug('[Razorpay] Loading script...');
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded || !(window as any).Razorpay) {
      throw new Error('Unable to load Razorpay. Check your network and try again.');
    }

    console.debug('[Razorpay] Script loaded, initiating payment...');

    // Get payment details from your API
    const paymentData = await initiatePayment({
      items: options.items,
      customerDetails: { name: options.name, email: options.email, mobile: options.contact },
      shippingAddress: options.shippingAddress,
      billingAddress: options.billingAddress,
      paymentMethod: 'online',
    });
    console.debug('[Razorpay] Payment initiated:', paymentData);

    // Use backend-provided fields
    const resolvedKey = paymentData.razorpayKeyId || (process as any)?.env?.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const resolvedOrderId = paymentData.razorpayOrderId;
    const resolvedAmount = typeof paymentData.amount === 'string' ? parseInt(paymentData.amount) : paymentData.amount;

    if (!resolvedKey) {
      throw new Error('Missing Razorpay key. Check backend response and environment variables.');
    }
    if (!resolvedOrderId) {
      throw new Error('Missing Razorpay order_id from backend response.');
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
          console.debug('[Razorpay] Payment success, verifying...', response);
          await verifyPayment(response);
          options.onSuccess(response.razorpay_payment_id, response.razorpay_order_id);
        } catch (error) {
          console.error('[Razorpay] Verification failed:', error);
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
          console.debug('[Razorpay] Payment cancelled by user');
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

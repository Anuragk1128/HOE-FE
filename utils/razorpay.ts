// utils/razorpay.ts
let razorpayScriptPromise: Promise<boolean> | null = null;

export const loadRazorpayScript = (): Promise<boolean> => {
  // Only run on client
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.resolve(false);
  }

  // If already loaded and available
  if ((window as any).Razorpay) {
    return Promise.resolve(true);
  }

  // Return in-flight promise if present
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise<boolean>((resolve) => {
    const existingScript = document.getElementById('razorpay-script') as HTMLScriptElement | null;
    if (existingScript) {
      // If script tag exists, wait briefly for global to appear
      const start = Date.now();
      const maxWait = 5000; // 5s
      const check = () => {
        if ((window as any).Razorpay) return resolve(true);
        if (Date.now() - start > maxWait) return resolve(false);
        setTimeout(check, 100);
      };
      check();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.id = 'razorpay-script';
    script.async = true;

    script.onload = () => {
      // Some environments may fire onload before global is ready; poll briefly.
      const start = Date.now();
      const maxWait = 5000; // 5s
      const check = () => {
        if ((window as any).Razorpay) return resolve(true);
        if (Date.now() - start > maxWait) return resolve(false);
        setTimeout(check, 100);
      };
      check();
    };
    script.onerror = () => {
      resolve(false);
    };

    // Append to head if available; otherwise to body
    const target = document.head || document.body || document.documentElement;
    target.appendChild(script);
  }).finally(() => {
    // Allow re-attempt if it failed
    if (!(window as any).Razorpay) {
      razorpayScriptPromise = null;
    }
  });

  return razorpayScriptPromise;
};

// Declare Razorpay global
declare global {
  interface Window {
    Razorpay: any;
  }
}
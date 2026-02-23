/**
 * Razorpay Web Checkout Integration
 *
 * Loads Razorpay script and opens payment modal.
 * Same flow as mobile app but using web checkout.
 */

export interface RazorpayOptions {
  orderId: string;
  amount: number;
  currency?: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Window.Razorpay is declared in recharge/page.tsx to avoid duplicate global declarations

let razorpayScriptLoaded = false;

/**
 * Load Razorpay checkout script (once)
 */
function loadRazorpayScript(): Promise<void> {
  if (razorpayScriptLoaded) return Promise.resolve();

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Razorpay requires browser environment'));
      return;
    }

    if (window.Razorpay) {
      razorpayScriptLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      razorpayScriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.head.appendChild(script);
  });
}

/**
 * Open Razorpay checkout modal
 *
 * Returns payment details on success, throws on failure/dismissal.
 */
export async function openRazorpayCheckout(
  options: RazorpayOptions
): Promise<RazorpaySuccessResponse> {
  await loadRazorpayScript();

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!keyId) {
    throw new Error('Razorpay key not configured');
  }

  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rzp = new (window as any).Razorpay({
      key: keyId,
      amount: options.amount * 100,
      currency: options.currency || 'INR',
      name: options.name || 'NakshatraTalks',
      description: options.description || 'Wallet Recharge',
      order_id: options.orderId,
      prefill: {
        name: options.prefill?.name || '',
        email: options.prefill?.email || '',
        contact: options.prefill?.contact || '',
      },
      theme: { color: '#2930A6' },
      handler: (response: RazorpaySuccessResponse) => {
        resolve(response);
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled by user')),
        escape: true,
        confirm_close: true,
      },
    });

    rzp.open();
  });
}

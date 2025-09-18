export const API_BASE_URL = "https://hoe-be.onrender.com/api";

const ADMIN_TOKEN_STORAGE_KEY = "hoe_admin_token_v1";

export type AdminLoginResponse = {
  token: string;
};

export type Brand = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  active?: boolean;
};

export async function fetchBrands(): Promise<Brand[]> {
  const res = await fetch(`${API_BASE_URL}/brands`, {
    method: "GET",
    headers: {
      Accept: "application/json, */*",
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch brands");
  }
  const data = (await res.json()) as { data?: Brand[] } | Brand[];
  // Support both { data: [...] } and [...] shapes
  return Array.isArray(data) ? (data as Brand[]) : (data.data ?? []);
}

export type CreateBrandInput = {
  name: string;
  slug: string;
  description?: string;
  active?: boolean;
};

export async function createBrand(payload: CreateBrandInput): Promise<Brand> {
  const token = getAdminToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_BASE_URL}/admin/brands`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let message = "Failed to create brand";
    try {
      const err = (await res.json()) as { message?: string; error?: string };
      message = err.message || err.error || message;
    } catch {}
    throw new Error(message);
  }
  const data = (await res.json()) as { data?: Brand } | Brand;
  return (data as any).data ?? (data as Brand);
}

export type Category = {
  _id: string;
  brandId: string;
  name: string;
  slug: string;
  image?: string;
};

export async function fetchCategoriesByBrandSlug(slug: string): Promise<Category[]> {
  const res = await fetch(`${API_BASE_URL}/brands/${encodeURIComponent(slug)}/categories`, {
    method: "GET",
    headers: { Accept: "application/json, */*" },
  });
  if (!res.ok) throw new Error("Failed to fetch categories");
  const data = (await res.json()) as { data?: Category[] } | Category[];
  return Array.isArray(data) ? (data as Category[]) : (data.data ?? []);
}

export type CreateCategoryInput = {
  brandId: string;
  name: string;
  slug: string;
  image?: string;
};

export async function createCategory(payload: CreateCategoryInput): Promise<Category> {
  const token = getAdminToken();
  if (!token) throw new Error("Not authenticated");
  const { brandId, ...body } = payload;
  const res = await fetch(`${API_BASE_URL}/admin/brands/${encodeURIComponent(brandId)}/categories`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let message = "Failed to create category";
    try {
      const err = (await res.json()) as { message?: string; error?: string };
      message = err.message || err.error || message;
    } catch {}
    throw new Error(message);
  }
  const data = (await res.json()) as { data?: Category } | Category;
  return (data as any).data ?? (data as Category);
}

export type Subcategory = {
  _id: string;
  brandId: string;
  categoryId: string;
  name: string;
  slug: string;
  image?: string;
};

export async function fetchSubcategoriesByBrandAndCategorySlug(
  brandSlug: string,
  categorySlug: string,
): Promise<Subcategory[]> {
  const res = await fetch(
    `${API_BASE_URL}/brands/${encodeURIComponent(brandSlug)}/categories/${encodeURIComponent(categorySlug)}/subcategories`,
    {
      method: "GET",
      headers: { Accept: "application/json, */*" },
    },
  );
  if (!res.ok) throw new Error("Failed to fetch subcategories");
  const data = (await res.json()) as { data?: Subcategory[] } | Subcategory[];
  return Array.isArray(data) ? (data as Subcategory[]) : (data.data ?? []);
}

export type CreateSubcategoryInput = {
  brandId: string;
  categoryId: string;
  name: string;
  slug: string;
  image?: string;
};

export async function createSubcategory(payload: CreateSubcategoryInput): Promise<Subcategory> {
  const token = getAdminToken();
  if (!token) throw new Error("Not authenticated");
  const { brandId, categoryId, ...body } = payload;
  const res = await fetch(
    `${API_BASE_URL}/admin/brands/${encodeURIComponent(brandId)}/categories/${encodeURIComponent(categoryId)}/subcategories`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    let message = "Failed to create subcategory";
    try {
      const err = (await res.json()) as { message?: string; error?: string };
      message = err.message || err.error || message;
    } catch {}
    throw new Error(message);
  }
  const data = (await res.json()) as { data?: Subcategory } | Subcategory;
  return (data as any).data ?? (data as Subcategory);
}

export type AdminProduct = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  images: string[];
  price: number;
  compareAtPrice?: number;
  stock: number;
  status: string;
  tags?: string[];
  sku?: string;
  shippingCategory?: string;
  weightKg?: number;
  dimensionsCm?: {
    length: number;
    breadth: number;
    height: number;
  };
  hsnCode?: string;
  gstRate?: number;
  productType?: string;
  attributes?: {
    size?: string[];
    color?: string[];
    material?: string;
    fit?: string;
    styling?: string;
    occasion?: string;
    gender?: string;
  };
  lowStockThreshold?: number;
  isActive?: boolean;
  vendorId?: string;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  onSale?: boolean;
  rating?: number;
  numReviews?: number;
  totalSales?: number;
  viewCount?: number;
  // Computed fields from backend
  taxAmount?: number;
  priceIncludingTax?: number;
  inStock?: boolean;
  isLowStock?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  brandId: { _id: string; name: string; slug: string };
  categoryId: { _id: string; name: string; slug: string };
  subcategoryId: { _id: string; name: string; slug: string };
  createdAt: string;
  updatedAt: string;
};

export async function fetchAdminProducts(params: {
  brand: string;
  category: string;
  subcategory: string;
}): Promise<AdminProduct[]> {
  const token = getAdminToken();
  if (!token) throw new Error("Not authenticated");
  const query = new URLSearchParams({
    brand: params.brand,
    category: params.category,
    subcategory: params.subcategory,
  }).toString();
  const res = await fetch(`${API_BASE_URL}/admin/products?${query}`, {
    method: "GET",
    headers: {
      Accept: "application/json, */*",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch products");
  const data = (await res.json()) as { data?: AdminProduct[] } | AdminProduct[];
  return Array.isArray(data) ? (data as AdminProduct[]) : (data.data ?? []);
}

export async function fetchStorefrontProducts(params: {
  brand: string;
  category: string;
  subcategory: string;
}): Promise<AdminProduct[]> {
  // Assuming a public endpoint mirroring the admin filter without auth
  const query = new URLSearchParams({
    brand: params.brand,
    category: params.category,
    subcategory: params.subcategory,
  }).toString();
  const res = await fetch(`${API_BASE_URL}/products?${query}`, {
    method: "GET",
    headers: { Accept: "application/json, */*" },
  });
  if (!res.ok) throw new Error("Failed to fetch products");
  const data = (await res.json()) as { data?: AdminProduct[] } | AdminProduct[];
  return Array.isArray(data) ? (data as AdminProduct[]) : (data.data ?? []);
}

export type CreateProductInput = {
  brandId: string;
  categoryId: string;
  subcategoryId: string;
  title: string;
  slug: string;
  description?: string;
  images?: string[];
  price: number;
  compareAtPrice?: number;
  stock: number;
  status: string;
  tags?: string[];
  sku?: string;
  shippingCategory?: string;
  weightKg?: number;
  dimensionsCm?: {
    length: number;
    breadth: number;
    height: number;
  };
  hsnCode?: string;
  gstRate?: number;
  productType?: string;
  attributes?: {
    size?: string[];
    color?: string[];
    material?: string;
    fit?: string;
    styling?: string;
    occasion?: string;
    gender?: string;
  };
  lowStockThreshold?: number;
  isActive?: boolean;
  vendorId?: string;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  onSale?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
};

export async function createProduct(payload: CreateProductInput): Promise<AdminProduct> {
  const token = getAdminToken();
  if (!token) throw new Error("Not authenticated");
  const { brandId, categoryId, subcategoryId, ...body } = payload;
  const res = await fetch(
    `${API_BASE_URL}/admin/brands/${encodeURIComponent(brandId)}/categories/${encodeURIComponent(categoryId)}/subcategories/${encodeURIComponent(subcategoryId)}/products`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    let message = "Failed to create product";
    try {
      const err = (await res.json()) as { message?: string; error?: string };
      message = err.message || err.error || message;
    } catch {}
    throw new Error(message);
  }
  const data = (await res.json()) as { data?: AdminProduct } | AdminProduct;
  return (data as any).data ?? (data as AdminProduct);
}

// Storefront: fetch products by brand/category/subcategory slugs via nested endpoint
export type SlugProduct = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  images: string[];
  price: number;
  compareAtPrice?: number;
  stock: number;
  status: string;
  tags?: string[];
  attributes?: Record<string, unknown>;
  brandId: string | { _id: string; name: string; slug: string };
  categoryId: { _id: string; name: string; slug: string };
  subcategoryId: { _id: string; name: string; slug: string };
  createdAt: string;
  updatedAt: string;
};

export async function fetchProductsBySlugs(params: {
  brandSlug: string;
  categorySlug: string;
  subcategorySlug: string;
}): Promise<SlugProduct[]> {
  const { brandSlug, categorySlug, subcategorySlug } = params;
  const url = `${API_BASE_URL}/brands/${encodeURIComponent(brandSlug)}/categories/${encodeURIComponent(categorySlug)}/subcategories/${encodeURIComponent(subcategorySlug)}/products`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to fetch products by slugs');
  const data = (await res.json()) as { data?: SlugProduct[] } | SlugProduct[];
  return Array.isArray(data) ? (data as SlugProduct[]) : (data.data ?? []);
}

export type UpdateProductPayload = {
  title?: string;
  slug?: string;
  description?: string;
  images?: string[];
  price?: number;
  compareAtPrice?: number;
  stock?: number;
  status?: string;
  tags?: string[];
  sku?: string;
  shippingCategory?: string;
  weightKg?: number;
  dimensionsCm?: {
    length: number;
    breadth: number;
    height: number;
  };
  hsnCode?: string;
  gstRate?: number;
  productType?: string;
  attributes?: {
    size?: string[];
    color?: string[];
    material?: string;
    fit?: string;
    styling?: string;
    occasion?: string;
    gender?: string;
  };
  lowStockThreshold?: number;
  isActive?: boolean;
  vendorId?: string;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  onSale?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
};

export async function updateProduct(params: {
  brandId: string;
  categoryId: string;
  subcategoryId: string;
  productId: string;
  payload: UpdateProductPayload;
}): Promise<AdminProduct> {
  const token = getAdminToken();
  if (!token) throw new Error("Not authenticated");
  const { brandId, categoryId, subcategoryId, productId, payload } = params;
  const res = await fetch(
    `${API_BASE_URL}/admin/brands/${encodeURIComponent(brandId)}/categories/${encodeURIComponent(categoryId)}/subcategories/${encodeURIComponent(subcategoryId)}/products/${encodeURIComponent(productId)}`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );
  if (!res.ok) {
    let message = "Failed to update product";
    try {
      const err = (await res.json()) as { message?: string; error?: string };
      message = err.message || err.error || message;
    } catch {}
    throw new Error(message);
  }
  const data = (await res.json()) as { data?: AdminProduct } | AdminProduct;
  return (data as any).data ?? (data as AdminProduct);
}

export async function adminLogin(email: string, password: string): Promise<AdminLoginResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/admin/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    let message = "Login failed";
    try {
      const data = (await res.json()) as { message?: string; error?: string };
      message = data.message || data.error || message;
    } catch {}
    throw new Error(message);
  }

  const data = (await res.json()) as AdminLoginResponse;
  return data;
}

export function saveAdminToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
}

export function clearAdminToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
}

export async function adminAuthedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = getAdminToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}

// Order Types
export type OrderItem = {
  product: {
    _id: string;
    title: string;
    price: number;
    images: string[];
    sku?: string;
    shippingCategory?: string;
    weightKg?: number;
    hsnCode?: string;
    gstRate?: number;
    productType?: string;
    attributes?: {
      size?: string[];
      color?: string[];
      material?: string;
      fit?: string;
      styling?: string;
      occasion?: string;
      gender?: string;
    };
  };
  title: string;
  image?: string;
  price: number;
  quantity: number;
  // Additional fields for Shipyaari
  sku?: string;
  category?: string;
  weight?: number; // in kg
  dimensions?: {
    length: number; // in cm
    breadth: number;
    height: number;
  };
  hsnCode?: string;
  unitPrice?: number;
  totalPrice?: number;
  taxAmount?: number;
  finalPrice?: number;
};

// Address Schema
export type Address = {
  _id?: string; // For saved addresses
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  district?: string;
  postalCode: string;
  country: string;
  phone: string;
  // Additional fields for location services
  latitude?: string;
  longitude?: string;
  landmark?: string;
};

// Razorpay Payment Schema
export type RazorpayPayment = {
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentMethod?: string; // card, netbanking, upi, etc.
  paymentStatus: 'pending' | 'authorized' | 'captured' | 'failed';
};

// Shipment Schema
export type Shipment = {
  shipyaariOrderId?: string;
  awbNumber?: string;
  courierPartner?: string;
  trackingUrl?: string;
  shipmentStatus: 'pending' | 'processing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'cancelled';
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  shipmentError?: string;
  trackingHistory?: Array<{
    status: string;
    location: string;
    timestamp: string;
    description: string;
    updatedAt: string;
  }>;
  shippingLabel?: {
    labelUrl?: string;
    invoiceUrl?: string;
    manifestUrl?: string;
    generatedAt?: string;
  };
  cancellation?: {
    isCancelled: boolean;
    cancelledAt?: string;
    cancelReason?: string;
    cancelledBy?: string; // 'customer', 'admin', 'system'
  };
  lastTrackingUpdate?: {
    status: string;
    location: string;
    timestamp: string;
    description: string;
  };
};

// Seller Details Schema
export type SellerDetails = {
  address: {
    fullAddress: string;
    pincode: number;
    city: string;
    state: string;
    country: string;
    latitude?: string;
    longitude?: string;
  };
  contact: {
    name: string;
    mobile: number;
    alternateMobile?: number;
  };
};

// Status History
export type StatusHistory = {
  status: string;
  timestamp: string;
  updatedBy: string;
  notes?: string;
};

export type Order = {
  _id: string;
  orderId: string;
  orderNumber: string;
  user: string;
  customerDetails: {
    name: string;
    email: string;
    mobile: string;
  };
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  sellerDetails: SellerDetails;
  paymentMethod: 'online' | 'cod' | 'wallet';
  razorpayDetails?: RazorpayPayment;
  shipmentDetails?: Shipment;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'paid' | 'processing' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled';
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  orderNotes?: string;
  specialInstructions?: string;
  insurance?: boolean;
  statusHistory: StatusHistory[];
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderInput = {
  items: Array<{
    productId: string;
    quantity: number;
    title?: string;
    image?: string;
    price?: number;
    sku?: string;
    category?: string;
    weight?: number;
    dimensions?: {
      length: number;
      breadth: number;
      height: number;
    };
    hsnCode?: string;
  }>;
  customerDetails: {
    name: string;
    email: string;
    mobile: string;
  };
  shippingAddress: Address;
  billingAddress?: Address;
  sellerDetails: SellerDetails;
  paymentMethod: 'online' | 'cod' | 'wallet';
  razorpayDetails?: RazorpayPayment;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  currency?: string;
  orderNotes?: string;
  specialInstructions?: string;
  insurance?: boolean;
};

// Order API Functions
export async function createOrder(payload: CreateOrderInput): Promise<Order> {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Not authenticated');
  
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = 'Failed to create order';
    try {
      const err = (await response.json()) as { message?: string; error?: string };
      message = err.message || err.error || message;
    } catch {}
    throw new Error(message);
  }

  const data = (await response.json()) as { data?: Order } | Order;
  return (data as any).data ?? (data as Order);
}

export async function fetchOrders(): Promise<Order[]> {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Not authenticated');
  
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let message = 'Failed to fetch orders';
    try {
      const err = (await response.json()) as { message?: string; error?: string };
      message = err.message || err.error || message;
    } catch {}
    throw new Error(message);
  }

  const data = (await response.json()) as { data?: Order[] } | Order[];
  return Array.isArray(data) ? (data as Order[]) : (data.data ?? []);
}

export async function fetchOrderById(orderId: string): Promise<Order> {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Not authenticated');
  
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let message = 'Failed to fetch order';
    try {
      const err = (await response.json()) as { message?: string; error?: string };
      message = err.message || err.error || message;
    } catch {}
    throw new Error(message);
  }

  const data = (await response.json()) as { data?: Order } | Order;
  return (data as any).data ?? (data as Order);
}

// Admin Order Functions
export async function fetchAdminOrders(params?: {
  status?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}): Promise<{ orders: Order[]; total: number; page: number; limit: number }> {
  const token = getAdminToken();
  if (!token) throw new Error('Not authenticated');
  
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.userId) query.set('userId', params.userId);
  if (params?.dateFrom) query.set('dateFrom', params.dateFrom);
  if (params?.dateTo) query.set('dateTo', params.dateTo);
  if (params?.page) query.set('page', params.page.toString());
  if (params?.limit) query.set('limit', params.limit.toString());
  
  const response = await fetch(`${API_BASE_URL}/admin/orders?${query.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let message = 'Failed to fetch admin orders';
    try {
      const err = (await response.json()) as { message?: string; error?: string };
      message = err.message || err.error || message;
    } catch {}
    throw new Error(message);
  }

  return response.json();
}

export async function updateOrderStatus(orderId: string, status: string, trackingInfo?: {
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
}): Promise<Order> {
  const token = getAdminToken();
  if (!token) throw new Error('Not authenticated');
  
  const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ status, trackingInfo }),
  });

  if (!response.ok) {
    let message = 'Failed to update order status';
    try {
      const err = (await response.json()) as { message?: string; error?: string };
      message = err.message || err.error || message;
    } catch {}
    throw new Error(message);
  }

  const data = (await response.json()) as { data?: Order } | Order;
  return (data as any).data ?? (data as Order);
}



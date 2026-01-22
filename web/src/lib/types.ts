export interface TokenRemember {
    token: string;
    remember: boolean;
}

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role?: "customer" | "staff" | "admin";
    mobile_number?: string;
    user_address?: string;
    dob?: string;
    bio?: string;
    pics?: string;
    status?: "0" | "1" | "2";
}
export interface StoreSettings {
    id: number;
    store_name: string;
    store_email: string;
    store_phone: string;
    store_address: string;
    store_gst: string;
    store_free_shipping: number;
    store_free_shipping_threshold: number;
}
export interface StoreContextValue {
    store_settings: StoreSettings | null;
    setStoreSettings: (next: StoreSettings | null) => void;
}
export type Permission = string;
export interface AccessLevel {
	permissions: Permission[];
}
export interface AuthContextValue {
	auth: boolean;
	token: string | null;
	my_id: string | null;
	my_details: User | null;
	my_access_level: AccessLevel | null;
	hydrated: boolean;
	detailsReady: boolean;
	setAuth: (next: boolean) => void;
	setToken: (next: string | null) => void;
	setMyID: (next: string | null) => void;
	setMyDetails: (next: User | null) => void;
	setMyAccessLevel: (next: AccessLevel | null) => void;
	setHydrated: (next: boolean) => void;
	setDetailsReady: (next: boolean) => void;
	login: (tokenRemember: { token: string; remember: boolean }) => Promise<void>;
	logout: () => void;
}

export interface ApiResp {
    code: any,
    data: any;
    error: boolean;
    token: string;
}

export interface Team {
  id: number;
  full_name: string;
  position: string;
  company?: string;
  image: string | null;
  facebook: string | null;
  linkedin: string | null;
  twitter: string | null;
  email?: string;
  phone?: string;
  joined_date?: string;
}
 
export interface Product {
  id: string;
  name: string;
  slug?: string;
  category_id?: number | string;
  category_slug?: string;
  category: string;

  price: number;
  originalPrice?: number | null;

  image: string;
  gallery?: string[];

  description: string;
  features: string[];

  variants?: ProductVariant[];

  isNew: boolean;
  isBestSeller: boolean;
  inStock: boolean;

  stock?: string;

  stockQuantity?: number;
  lowStockAlert?: number;

  weight?: number | string;
  item_height?: number | string;
  item_width?: number | string;
  item_depth?: number | string;

  sku?: string;
  is_wishlist?: string;

  rating?: string;

  createdAt?: string;
}
export interface ProductVariantOption {
  id?: number;
  option_id?: number;
  value: string;
  price_modifier?: string;
}
export interface ProductVariant {
  id?: number;
  type: string;
  options: ProductVariantOption[];
}
export interface Order {
  id: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: { name: string; quantity: number; price: number; image: string }[];
  total: number;
  shippingAddress: string;
  trackingData?: any;
}

export interface CartItem {
  product: Product; // This now has variant-adjusted price
  quantity: number;
  selectedVariants?: Record<string, ProductVariantOption>;
  variantDetails?: Array<{
    type: string;
    value: string;
    priceModifier: number;
  }>;
}
export interface Discount {
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  minPurchase: number;
}
export interface GalleryImage {
  id: number;
  image: string;
  sort_order: number;
}

export interface ProductFeature {
  id: number;
  feature: string;
  sort_order: number;
}

export interface Order {
  id: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: { name: string; quantity: number; price: number; image: string }[];
  total: number;
  shippingAddress: string;
}

export interface Address {
  id: number;
  label: string;
  name: string;
  street_address: string;
  city: string;
  province: string;
  postal_code: string;
  mobile_number: string;
  is_default: boolean | number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
}
export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  inStock: boolean;
}
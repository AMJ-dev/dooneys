// Mock data for user account and admin dashboard

export interface Order {
  id: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: { name: string; quantity: number; price: number; image: string }[];
  total: number;
  shippingAddress: string;
}

export interface Address {
  id: string;
  label: string;
  name: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  inStock: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "inactive";
  joinedDate: string;
  totalOrders: number;
  totalSpent: number;
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
 
// Mock orders
export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    date: "2024-01-15",
    status: "delivered",
    items: [
      { name: "Luxury Human Hair Wig - Natural Black", quantity: 1, price: 299.99, image: "/placeholder.svg" },
      { name: "Argan Oil Hair Serum", quantity: 2, price: 24.99, image: "/placeholder.svg" },
    ],
    total: 349.97,
    shippingAddress: "123 Main Street, Edmonton, AB T5J 1G2",
  },
  {
    id: "ORD-002",
    date: "2024-01-10",
    status: "shipped",
    items: [
      { name: "Knotless Box Braids - Ombre Brown", quantity: 1, price: 189.99, image: "/placeholder.svg" },
    ],
    total: 189.99,
    shippingAddress: "456 Jasper Ave, Edmonton, AB T5K 0L5",
  },
  {
    id: "ORD-003",
    date: "2024-01-05",
    status: "processing",
    items: [
      { name: "Professional Ceramic Flat Iron", quantity: 1, price: 149.99, image: "/placeholder.svg" },
      { name: "Shea Butter Body Lotion", quantity: 3, price: 18.99, image: "/placeholder.svg" },
    ],
    total: 206.96,
    shippingAddress: "789 Whyte Ave, Edmonton, AB T6E 2E3",
  },
];

// Mock addresses
export const mockAddresses: Address[] = [
  {
    id: "addr-1",
    label: "Home",
    name: "John Doe",
    street: "123 Main Street",
    city: "Edmonton",
    province: "Alberta",
    postalCode: "T5J 1G2",
    phone: "+1 (825) 123-4567",
    isDefault: true,
  },
  {
    id: "addr-2",
    label: "Work",
    name: "John Doe",
    street: "456 Corporate Plaza",
    city: "Edmonton",
    province: "Alberta",
    postalCode: "T5K 0L5",
    phone: "+1 (825) 987-6543",
    isDefault: false,
  },
];

// Mock wishlist
export const mockWishlist: WishlistItem[] = [
  { id: "wish-1", name: "HD Lace Front Wig - Honey Blonde", price: 349.99, image: "/placeholder.svg", inStock: true },
  { id: "wish-2", name: "Vitamin E Skin Oil", price: 29.99, originalPrice: 39.99, image: "/placeholder.svg", inStock: true },
  { id: "wish-3", name: "Professional Hair Dryer Set", price: 199.99, image: "/placeholder.svg", inStock: false },
  { id: "wish-4", name: "Bohemian Locs - 24 inch", price: 89.99, image: "/placeholder.svg", inStock: true },
];

// Mock admin users
export const mockAdminUsers: AdminUser[] = [
  { id: "user-1", name: "Sarah Johnson", email: "sarah@email.com", role: "user", status: "active", joinedDate: "2023-06-15", totalOrders: 12, totalSpent: 1549.88 },
  { id: "user-2", name: "Michael Brown", email: "michael@email.com", role: "user", status: "active", joinedDate: "2023-08-22", totalOrders: 5, totalSpent: 678.45 },
  { id: "user-3", name: "Emily Davis", email: "emily@email.com", role: "user", status: "inactive", joinedDate: "2023-09-10", totalOrders: 2, totalSpent: 189.99 },
  { id: "user-4", name: "James Wilson", email: "james@email.com", role: "user", status: "active", joinedDate: "2023-11-05", totalOrders: 8, totalSpent: 1123.67 },
  { id: "user-5", name: "Admin User", email: "admin@doonneys.com", role: "admin", status: "active", joinedDate: "2023-01-01", totalOrders: 0, totalSpent: 0 },
];

// Dashboard stats
export const mockDashboardStats: DashboardStats = {
  totalRevenue: 45678.90,
  totalOrders: 234,
  totalCustomers: 156,
  totalProducts: 89,
  revenueGrowth: 12.5,
  ordersGrowth: 8.3,
  customersGrowth: 15.2,
};

// Recent orders for admin
export const mockRecentOrders: (Order & { customer: string })[] = [
  { ...mockOrders[0], customer: "Sarah Johnson" },
  { ...mockOrders[1], customer: "Michael Brown" },
  { ...mockOrders[2], customer: "Emily Davis" },
];
/*
api response from 

<br/><b>Deprecated</b>:  Implicit conversion from float 1898.9999999999998 to int loses 
precision in <b>/var/www/html/doonneys/api/include/functions.php</b> on line <b>349</b><br/>{
    "error": false,
    "data": {
        "canada_post": {
            "carrier": "Canada Post",
            "price": 11.41,
            "delivery": "6 days"
        },
        "fedex": {
            "carrier": "FedEx",
            "price": 23,
            "delivery": "3 days"
        },
        "dhl": {
            "carrier": "DHL",
            "price": 15.75,
            "delivery": "2 days"
        }
    }
}
    */
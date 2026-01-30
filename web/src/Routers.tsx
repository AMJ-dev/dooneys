import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LoadingScreen from "@/components/ui/loading-screen";
import AdminLayout from "@/components/layout/AdminLayout";
import AccountLayout from "@/components/layout/AccountLayout";
import RequireAuth from "@/components/RequireAuth";

const Index = lazy(() => import("@/pages/public/Index"));
const Shop = lazy(() => import("@/pages/public/Shop"));
const Category = lazy(() => import("@/pages/public/Category"));
const ProductDetail = lazy(() => import("@/pages/public/ProductDetail"));
const Deals = lazy(() => import("@/pages/public/Deals"));
const About = lazy(() => import("@/pages/public/About"));
const Contact = lazy(() => import("@/pages/public/Contact"));
const Cart = lazy(() => import("@/pages/public/Cart"));
const Checkout = lazy(() => import("@/pages/public/Checkout"));
const OrderConfirmation = lazy(() => import("@/pages/public/OrderConfirmation"));
const TermsAndCondition = lazy(()=>import("@/pages/public/TermsAndCondition"))
const PrivacyPolicy = lazy(()=>import("@/pages/public/PrivacyPolicy"))

const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const UserVerifyOTP = lazy(() => import("@/pages/auth/UserOTP"));
const AdminVerifyOTP = lazy(() => import("@/pages/auth/AdminOTP"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const AdminLogin = lazy(() => import("@/pages/auth/AdminLogin"));
const Logout = lazy(() => import("@/pages/auth/Logout"));

const ProfilePage = lazy(() => import("@/pages/account/ProfilePage"));
const OrdersPage = lazy(() => import("@/pages/account/OrdersPage"));
const OrderDetails = lazy(() => import("@/pages/account/OrderDetails"));
const TrackOrder = lazy(() => import("@/pages/account/TrackOrder"));
const AddressesPage = lazy(() => import("@/pages/account/AddressesPage"));
const WishlistPage = lazy(() => import("@/pages/account/WishlistPage"));
const SettingsPage = lazy(() => import("@/pages/account/SettingsPage"));
 
const DashboardPage = lazy(() => import("@/pages/admin/DashboardPage"));
const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics"));
const AdminPOS = lazy(() => import("@/pages/admin/AdminPOS"));
const AdminOrders = lazy(() => import("@/pages/admin/AdminOrders"));
const AdminOrderDetails = lazy(() => import("@/pages/admin/AdminOrderDetails"));
const AdminProducts = lazy(() => import("@/pages/admin/AdminProducts"));
const AdminProductForm = lazy(() => import("@/pages/admin/AdminProductForm"));
const AdminCategories = lazy(() => import("@/pages/admin/AdminCategories"));
const AdminCategoryForm = lazy(() => import("@/pages/admin/AdminCategoryForm"));
const AdminInventory = lazy(() => import("@/pages/admin/AdminInventory"));
const AdminStaffs = lazy(() => import("@/pages/admin/AdminStaffs"));
const AdminCustomers = lazy(() => import("@/pages/admin/AdminCustomers"));
const AdminStaffForm = lazy(() => import("@/pages/admin/AdminStaffForm"));
const AdminAccessControl = lazy(() => import("@/pages/admin/AdminAccessControl"));
const AdminAccessControlDetails = lazy(() => import("@/pages/admin/AccessControlDetails"));
const AdminAccessControlForm = lazy(() => import("@/pages/admin/AdminAccessControlForm"));
const AdminDiscounts = lazy(() => import("@/pages/admin/AdminDiscounts"));
const AdminDiscountForm = lazy(() => import("@/pages/admin/AdminDiscountForm"));
const AdminPickupLocations = lazy(() => import("@/pages/admin/AdminPickupLocations"));
const AdminPickupForm = lazy(() => import("@/pages/admin/AdminPickupForm"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));

const NotFound = lazy(() => import("@/pages/error/NotFound"));
const UnAuthorized = lazy(() => import("@/pages/error/UnAuthorized"));
const AccountSuspended = lazy(() => import("@/pages/error/AccountSuspended"));
const TestPage = lazy(()=>import("@/pages/public/Test"))


import { usePageTracking } from "@/lib/usePageTracking";

const variants = {
  initial: { opacity: 0, y: 12, filter: "blur(2px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -12,
    filter: "blur(2px)",
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  },
};

export default function AnimatedRoutes() {
  const location = useLocation();
  const staticRoute =
    location.pathname.startsWith("/cart") ||
    location.pathname.startsWith("/checkout") ||
    location.pathname.startsWith("/admin");
  usePageTracking();

  const Wrapper = staticRoute ? "div" : motion.div;

  return (
    <Suspense fallback={<LoadingScreen />}>
      <AnimatePresence mode="wait" initial={false}>
        <Wrapper
          key={staticRoute ? "static" : location.pathname}
          {...(!staticRoute && {
            variants,
            initial: "initial",
            animate: "animate",
            exit: "exit",
          })}
          className="min-h-screen will-change-transform"
        >
          <Routes location={location}>
            <Route path="/" element={<Index />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/category/:id/:slug" element={<Category />} />
            <Route path="/product/:id/:slug" element={<ProductDetail />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />

            <Route path="/terms" element={<TermsAndCondition />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-user-otp" element={<UserVerifyOTP />} />
            <Route path="/verify-admin-otp" element={<AdminVerifyOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:link1/:link2" element={<ResetPassword />} />
            <Route path="/admin-login" element={<AdminLogin />} />

            <Route 
              path="/account" 
              element={
                <RequireAuth roles={["admin", "staff", "customer"]}>
                  <AccountLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="profile" replace />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="order-details/:id" element={<OrderDetails />} />
              <Route path="track-order" element={<TrackOrder />} />
              <Route path="addresses" element={<AddressesPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route 
              path="/admin" 
              element={
                <RequireAuth roles={["admin", "staff"]}>
                  <AdminLayout />
                </RequireAuth>
              }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="pos" element={<AdminPOS />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="order/:id/:name" element={<AdminOrderDetails />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="product/new" element={<AdminProductForm />} />
              <Route path="product/:id/:name" element={<AdminProductForm />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="categories/new" element={<AdminCategoryForm />} />
              <Route path="categories/:id/:name" element={<AdminCategoryForm />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="staffs" element={<AdminStaffs />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="staff/new" element={<AdminStaffForm />} />
              <Route path="staff/:id/:name" element={<AdminStaffForm />} />
              <Route path="access-control" element={<AdminAccessControl />} />
              <Route path="access-control/new" element={<AdminAccessControlForm />} />
              <Route path="access-control/:id/:name" element={<AdminAccessControlForm />} />
              <Route path="access-control/:id/:name/details" element={<AdminAccessControlDetails />} />
              <Route path="discounts" element={<AdminDiscounts />} />
              <Route path="discount/new" element={<AdminDiscountForm />} />
              <Route path="discount/:id/:name" element={<AdminDiscountForm />} />
              <Route path="pickup-locations" element={<AdminPickupLocations />} />
              <Route path="pickup-location/new" element={<AdminPickupForm />} />
              <Route path="pickup-location/:id/:name" element={<AdminPickupForm />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            <Route path="/logout" element={<Logout />} />
            <Route path="/suspended" element={<AccountSuspended />} />
            <Route path="/unauthorized" element={<UnAuthorized />} />
            <Route path="/test-page" element={<TestPage />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Wrapper>
      </AnimatePresence>
    </Suspense>
  );
}

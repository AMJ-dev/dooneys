import { startTransition, useState } from "react";
import { motion } from "framer-motion";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  FolderTree,
  Package,
  BadgePercent,
  Receipt,
  ShoppingCart,
  Boxes,
  UserCircle,
  UsersRound,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Bell,
  Search,
  Warehouse,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import logo from "@/assets/logo.png";
import { comp_name } from "@/lib/constants";
import usePermissions from "@/hooks/usePermissions";





const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    view_analytics,
    view_categories,
    view_customers,
    view_discount,
    view_inventory,
    view_orders,
    view_pickup_location,
    view_products,
    view_roles,
    view_staff,
    view_pos,
    manage_settings
    } = usePermissions([
    "view_analytics",
    "view_categories",
    "view_customers",
    "view_discount",
    "view_inventory",
    "view_orders",
    "view_pickup_location",
    "view_products",
    "view_roles",
    "view_staff",
    "view_pos",
    "manage_settings"
  ]);
  const menuItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/analytics", label: "Analytics", icon: BarChart3, permission: view_analytics },
    { to: "/admin/pos", label: "Cashier / POS", icon: Receipt, permission: view_pos },
    { to: "/admin/orders", label: "Orders", icon: ShoppingCart, permission: view_orders },
    { to: "/admin/discounts", label: "Discounts", icon: BadgePercent, permission: view_discount },
    { to: "/admin/products", label: "Products", icon: Package, permission: view_products },
    { to: "/admin/categories", label: "Categories", icon: FolderTree, permission: view_categories },
    { to: "/admin/inventory", label: "Inventory", icon: Boxes, permission: view_inventory },
    { to: "/admin/customers", label: "Customers", icon: UserCircle, permission: view_customers },
    { to: "/admin/staffs", label: "Staffs", icon: UsersRound, permission: view_staff },
    { to: "/admin/pickup-locations", icon: Warehouse, label: "Pickup Location", permission: view_pickup_location },
    { to: "/admin/access-control", label: "Access Control", icon: ShieldCheck, permission: view_roles },
    { to: "/admin/settings", label: "Settings", icon: Settings, permission: manage_settings },
  ];
    const Sidebar = () => (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt={comp_name} className="h-10" />
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          (item?.permission == true || item?.permission == undefined) && (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          )
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => navigate("/account/profile")}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Store
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-destructive"
          onClick={() => startTransition(()=>navigate("/logout"))}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 fixed inset-y-0 left-0 z-50">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Area */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </Button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">AD</span>
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  Admin
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content (ROUTED + ANIMATED) */}
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-4 lg:p-6"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
};

export default AdminLayout;

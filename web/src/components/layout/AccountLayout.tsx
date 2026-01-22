import { startTransition, useContext } from "react";
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  User,
  Package,
  MapPin,
  Heart,
  Settings,
  LogOut,
  Shield,
  Store,
} from "lucide-react";
import UserContext from "@/lib/userContext";

const menuItems = [
  { to: "profile", icon: User, label: "Profile" },
  { to: "orders", icon: Package, label: "Order History" },
  { to: "addresses", icon: MapPin, label: "Addresses" },
  { to: "wishlist", icon: Heart, label: "Wishlist" },
  { to: "settings", icon: Settings, label: "Settings" },
];

const AccountLayout = () => {
  const navigate = useNavigate();
  const {auth, my_details} = useContext(UserContext);
  return (
    <Layout>
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl md:text-4xl mb-2">
                My Account
              </h1>
              <p className="text-muted-foreground">Welcome back, {my_details.first_name}!</p>
            </div>
            {
              ["admin", "staff"].includes(my_details.role) && (
                <Button variant="outline" asChild>
                  <Link to="/admin">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </Link>
                </Button>                
              )
            }
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <motion.div className="md:col-span-1">
              <div className="bg-card rounded-xl p-4 shadow-card space-y-1 sticky top-24">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </NavLink>
                ))}

                <button
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white text-destructive"
                  onClick={()=>startTransition(()=>navigate("/logout"))}
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </div>
            </motion.div>

            {/* Page Content */}
            <motion.div className="md:col-span-3">
              <div className="bg-card rounded-xl p-6 md:p-8 shadow-card">
                <Outlet />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AccountLayout;

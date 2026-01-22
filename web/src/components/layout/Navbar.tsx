import { useState, useEffect, useContext, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, X, ShoppingBag, Search, Phone, User, ChevronDown,
  Package, MapPin, LayoutDashboard, Settings, LogOut,
  Sparkles, Crown, Gem, Home, ShoppingCart, Star, Mail,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import GlobalSearch from "@/components/search/GlobalSearch";
import { comp_address, comp_name, comp_phone } from "@/lib/constants";
import UserContext from "@/lib/userContext";
import { resolveSrc } from "@/lib/functions";

const navLinks = [
  { name: "Home", path: "/", icon: Home },
  { name: "Shop", path: "/shop", icon: ShoppingCart },
  { name: "New Arrivals", path: "/new", icon: Star },
  { name: "About", path: "/about", icon: Sparkles },
  { name: "Contact", path: "/contact", icon: Mail },
];

const Navbar = () => {
  const { auth, my_details, logout } = useContext(UserContext);
  const { getTotalItems } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    pics: "",
  });
  
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (auth && my_details) {
      setUser({
        first_name: my_details.first_name || "",
        last_name: my_details.last_name || "",
        email: my_details.email || "",
        role: my_details.role || "",
        pics: resolveSrc(my_details.pics) || "",
      });
    }
  }, [auth, my_details]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getInitials = () => `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  
  const getRoleConfig = () => {
    const role = user.role.toLowerCase();
    if (role === "admin") {
      return {
        icon: Crown,
        color: "bg-gradient-to-r from-red-500/15 to-red-600/15 text-red-400 border-red-400/30",
        badgeColor: "bg-red-500/20 text-red-400"
      };
    }
    if (role === "staff") {
      return {
        icon: Sparkles,
        color: "bg-gradient-to-r from-blue-500/15 to-blue-600/15 text-blue-400 border-blue-400/30",
        badgeColor: "bg-blue-500/20 text-blue-400"
      };
    }
    return {
      icon: Gem,
      color: "bg-gradient-to-r from-primary/15 to-accent/15 text-primary border-primary/30",
      badgeColor: "bg-primary/20 text-primary"
    };
  };

  const roleConfig = getRoleConfig();

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-background/90 backdrop-blur-xl shadow-lg border-b border-white/5"
            : "bg-transparent"
        )}
      >
        <div className="relative">
          {/* Premium top accent line */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-highlight"
          />
          
          <nav className="container">
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <Link to="/" className="flex items-center group relative z-10">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <motion.img
                    src={logo}
                    alt={comp_name}
                    className="h-14 w-auto"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                  <motion.div
                    className="absolute -inset-4 bg-gradient-primary rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              </Link>

              {/* Desktop Navigation - Centered */}
              <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-1 bg-background/50 backdrop-blur-sm rounded-2xl border border-white/10 px-2 py-1.5">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={link.path}
                        className={cn(
                          "relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                          location.pathname === link.path
                            ? "bg-gradient-primary text-primary-foreground shadow-lg shadow-primary/25"
                            : "text-foreground/80 hover:text-primary hover:bg-white/5"
                        )}
                      >
                        <link.icon className="h-4 w-4" />
                        {link.name}
                        {location.pathname === link.path && (
                          <motion.div
                            layoutId="nav-indicator"
                            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-primary-foreground rounded-full"
                          />
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                {/* Search */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full h-10 w-10 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 group"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    <Search className="h-4 w-4" />
                    <div className="absolute -bottom-1 -right-1 bg-primary text-[10px] text-primary-foreground px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      ⌘K
                    </div>
                  </Button>
                </motion.div>

                {/* Cart */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full h-10 w-10 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20"
                    asChild
                  >
                    <Link to="/cart">
                      <ShoppingBag className="h-4 w-4" />
                      {getTotalItems() > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-primary text-primary-foreground text-xs flex items-center justify-center shadow-lg"
                        >
                          {Math.min(getTotalItems(), 99)}
                        </motion.span>
                      )}
                    </Link>
                  </Button>
                </motion.div>

                {/* User Menu / Auth */}
                {auth ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="ghost"
                          className="h-10 px-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7 border-2 border-white/20">
                              <AvatarImage src={user.pics} />
                              <AvatarFallback className="bg-gradient-primary text-sm">
                                {getInitials()}
                              </AvatarFallback>
                            </Avatar>
                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </Button>
                      </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      className="w-72 border-white/20 bg-background/95 backdrop-blur-xl shadow-2xl rounded-2xl p-2"
                      align="end"
                      sideOffset={5}
                    >
                      {/* Header */}
                      <div className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border-3 border-white/30 shadow-lg">
                            <AvatarImage src={user.pics} />
                            <AvatarFallback className="bg-gradient-primary text-lg">
                              {getInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold truncate">{user.first_name} {user.last_name}</p>
                              <Badge variant="outline" className={cn("text-xs px-2", roleConfig.badgeColor)}>
                                <roleConfig.icon className="h-2.5 w-2.5 mr-1" />
                                {user.role}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <DropdownMenuSeparator className="bg-white/10" />

                      {/* Menu Items */}
                      <DropdownMenuGroup className="p-1">
                        <DropdownMenuItem 
                          className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/5"
                          onClick={() => navigate("/account")}
                        >
                          <User className="h-4 w-4 mr-3 text-primary" />
                          <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/5"
                          onClick={() => navigate("/account/orders")}
                        >
                          <Package className="h-4 w-4 mr-3 text-primary" />
                          <span>Orders</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/5"
                          onClick={() => navigate("/account/addresses")}
                        >
                          <MapPin className="h-4 w-4 mr-3 text-primary" />
                          <span>Addresses</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/5"
                          onClick={() => navigate("/account/settings")}
                        >
                          <Settings className="h-4 w-4 mr-3 text-primary" />
                          <span>Settings</span>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>

                      {/* Admin Section */}
                      {(user.role.toLowerCase() === "admin" || user.role.toLowerCase() === "staff") && (
                        <>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuLabel className="text-xs text-muted-foreground px-3 py-2">
                            ADMINISTRATION
                          </DropdownMenuLabel>
                          <DropdownMenuItem 
                            className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-red-500/10 text-red-400"
                            onClick={() => navigate("/admin")}
                          >
                            <LayoutDashboard className="h-4 w-4 mr-3" />
                            <span>Admin Dashboard</span>
                          </DropdownMenuItem>
                        </>
                      )}

                      <DropdownMenuSeparator className="bg-white/10" />
                      
                      {/* Logout */}
                      <DropdownMenuItem 
                        className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-destructive/10 text-destructive mt-1"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      className="rounded-full bg-gradient-primary text-primary-foreground px-5 hover:shadow-lg hover:shadow-primary/25"
                      asChild
                    >
                      <Link to="/login">
                        <User className="h-4 w-4 mr-2" />
                        Sign In
                      </Link>
                    </Button>
                  </motion.div>
                )}

                {/* Mobile Menu Toggle */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="lg:hidden"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-10 w-10 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20"
                    onClick={() => setIsMobileMenuOpen(true)}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu - Elegant Slide-in */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            
            {/* Menu Panel */}
            <motion.div
              ref={mobileMenuRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 z-50 h-screen w-full max-w-md bg-gradient-to-b from-background to-background/95 backdrop-blur-xl shadow-2xl border-l border-white/10 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-white/20">
                      <AvatarImage src={user.pics} />
                      <AvatarFallback className="bg-gradient-primary">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {auth ? `${user.first_name} ${user.last_name}` : "Welcome"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {auth ? user.email : "Sign in to your account"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-white/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Menu Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Quick Actions */}
                <div className="p-6">
                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl bg-white/5 border-white/10 hover:bg-white/10 mb-4"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsSearchOpen(true);
                    }}
                  >
                    <Search className="h-4 w-4 mr-3" />
                    Search Products...
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl bg-white/5 border-white/10 hover:bg-white/10"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/contact");
                    }}
                  >
                    <Phone className="h-4 w-4 mr-3" />
                    Book Appointment
                  </Button>
                </div>

                {/* Navigation */}
                <div className="px-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
                    Navigation
                  </h3>
                  <div className="space-y-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                          location.pathname === link.path
                            ? "bg-gradient-primary text-primary-foreground"
                            : "hover:bg-white/5"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <link.icon className="h-5 w-5" />
                        <span className="font-medium">{link.name}</span>
                        {location.pathname === link.path && (
                          <motion.div
                            layoutId="mobile-indicator"
                            className="ml-auto h-2 w-2 rounded-full bg-primary-foreground"
                          />
                        )}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Account Section */}
                {auth && (
                  <div className="px-4 mt-8">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
                      Account
                    </h3>
                    <div className="space-y-1">
                      <Link
                        to="/account"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/account/orders"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Package className="h-5 w-5" />
                        <span>Orders</span>
                      </Link>
                      <Link
                        to="/account/addresses"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <MapPin className="h-5 w-5" />
                        <span>Addresses</span>
                      </Link>
                      {(user.role.toLowerCase() === "admin" || user.role.toLowerCase() === "staff") && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <LayoutDashboard className="h-5 w-5" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10 bg-gradient-to-t from-background to-background/50">
                {auth ? (
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                ) : (
                  <Button
                    className="w-full rounded-xl bg-gradient-primary hover:shadow-lg hover:shadow-primary/25"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/login");
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
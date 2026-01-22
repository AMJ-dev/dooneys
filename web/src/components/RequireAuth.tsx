import { useContext, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import UserContext from "@/lib/userContext";
import LoadingScreen from "@/components/ui/loading-screen";

type Role = "admin" | "customer" | "staff";

export default function RequireAuth({children, roles}: { 
  children: ReactNode; roles?: Role[];}) {
  const ctx = useContext(UserContext);
  const location = useLocation();

  if (!ctx) return null;

  const { auth, token, my_details, hydrated, detailsReady } = ctx;

  if (!hydrated) return <LoadingScreen />;
  

  if (!auth || !token) {
    sessionStorage.setItem("redirect", location.pathname + location.search + location.hash);
    return <Navigate to="/auth/login" replace />;
  }
  
  if(my_details && my_details.status == "2"){
    sessionStorage.setItem("redirect", location.pathname + location.search + location.hash);
    return <Navigate to="/suspended" replace />;
  }
  if (roles && roles.length > 0) {
    if (!detailsReady) return <LoadingScreen />;
    const ok = roles.includes(my_details.role as Role);
    if (!ok) return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

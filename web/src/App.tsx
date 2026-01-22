import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { Bounce, ToastContainer } from 'react-toastify';
import LoadingScreen from "@/components/ui/loading-screen";
import UserProvider from "@/contexts/userProvider";
import ErrorBoundary from '@/components/ErrorBoundary';
import { useStripeKey } from "@/lib/useStripeKey";
import { Elements } from "@stripe/react-stripe-js";
import Routers from "@/Routers";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const AppContent = () => {
  const { stripe, loading, error } = useStripeKey();
  if (loading) return <LoadingScreen />; 
  if (error) return <p>Failed to load Stripe: {error}</p>; 
  if (!stripe) return <p>Stripe not initialized</p>;
  return (
    <UserProvider>
      <Elements stripe={stripe}>
        <CartProvider>
          <Toaster />
          <Sonner />
          <ErrorBoundary>
            <BrowserRouter>
              <Routers />
            </BrowserRouter>
          </ErrorBoundary>
        </CartProvider>
      </Elements>
    </UserProvider>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          transition={Bounce}
        />
        
        {isLoading ? (
          <LoadingScreen 
            minimumLoadTime={1000} 
            onLoadingComplete={() => setIsLoading(false)}
          />
        ) : (
          <AppContent />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
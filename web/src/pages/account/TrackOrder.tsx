import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  ExternalLink,
  Box,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrackingStep {
  status: string;
  location: string;
  date: string;
  time: string;
  completed: boolean;
  current: boolean;
}

interface OrderTracking {
  orderId: string;
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  status: string;
  steps: TrackingStep[];
  items: { name: string; quantity: number; image: string }[];
}

const mockTracking: OrderTracking = {
  orderId: "ORD-2024-001234",
  carrier: "Canada Post",
  trackingNumber: "1Z999AA10123456784",
  estimatedDelivery: "December 20, 2024",
  status: "In Transit",
  steps: [
    {
      status: "Order Placed",
      location: "Online",
      date: "Dec 15, 2024",
      time: "10:30 AM",
      completed: true,
      current: false,
    },
    {
      status: "Processing",
      location: "Edmonton Warehouse",
      date: "Dec 15, 2024",
      time: "2:45 PM",
      completed: true,
      current: false,
    },
    {
      status: "Shipped",
      location: "Edmonton, AB",
      date: "Dec 16, 2024",
      time: "9:15 AM",
      completed: true,
      current: false,
    },
    {
      status: "In Transit",
      location: "Calgary, AB",
      date: "Dec 17, 2024",
      time: "3:30 PM",
      completed: true,
      current: true,
    },
    {
      status: "Out for Delivery",
      location: "",
      date: "",
      time: "",
      completed: false,
      current: false,
    },
    {
      status: "Delivered",
      location: "",
      date: "",
      time: "",
      completed: false,
      current: false,
    },
  ],
  items: [
    {
      name: "HD Lace Front Wig - Body Wave",
      quantity: 1,
      image: "/placeholder.svg",
    },
    {
      name: "Hair Growth Serum - Premium Formula",
      quantity: 2,
      image: "/placeholder.svg",
    },
  ],
};

const TrackOrder = () => {
  const [orderIdInput, setOrderIdInput] = useState("");
  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    // Mock: always show tracking for demo
    if (orderIdInput.trim()) {
      setTracking(mockTracking);
    }
  };

  return (
    <div className="space-y-6">
      <ScrollReveal>
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl mb-4">Track Your Order</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Enter your order ID or tracking number to see the current status of your delivery.
          </p>
        </div>
      </ScrollReveal>

      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Label className="sr-only">Order ID or Tracking Number</Label>
                <Input
                  placeholder="Enter order ID (e.g., ORD-2024-001234) or tracking number"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  className="h-12"
                />
              </div>
              <Button type="submit" size="lg">
                <Search className="h-4 w-4 mr-2" />
                Track
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tracking Results */}
      {searched && tracking && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">{tracking.orderId}</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {tracking.carrier} • {tracking.trackingNumber}
                  </p>
                </div>
                <Badge
                  className={cn(
                    "text-sm px-3 py-1",
                    tracking.status === "Delivered"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  )}
                >
                  {tracking.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Truck className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Estimated Delivery</p>
                  <p className="text-muted-foreground">{tracking.estimatedDelivery}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tracking History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {tracking.steps.map((step, index) => (
                  <div key={index} className="flex gap-4 pb-8 last:pb-0">
                    {/* Timeline Line */}
                    <div className="relative flex flex-col items-center">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center z-10",
                          step.current
                            ? "bg-primary text-primary-foreground"
                            : step.completed
                            ? "bg-green-100 text-green-600"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {step.completed ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : step.status === "Out for Delivery" ? (
                          <Truck className="h-5 w-5" />
                        ) : step.status === "Delivered" ? (
                          <Package className="h-5 w-5" />
                        ) : (
                          <Clock className="h-5 w-5" />
                        )}
                      </div>
                      {index < tracking.steps.length - 1 && (
                        <div
                          className={cn(
                            "absolute top-10 w-0.5 h-full",
                            step.completed ? "bg-green-200" : "bg-muted"
                          )}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1.5">
                      <p
                        className={cn(
                          "font-medium",
                          step.current && "text-primary"
                        )}
                      >
                        {step.status}
                      </p>
                      {step.location && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {step.location}
                        </p>
                      )}
                      {step.date && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {step.date} at {step.time}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Items in This Order</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tracking.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to={`/order/${tracking.orderId}`}>
                    <Box className="h-4 w-4 mr-2" />
                    View Order Details
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href={`https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${tracking.trackingNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Track on Carrier Site
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* No Results */}
      {searched && !tracking && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-lg mb-2">Order Not Found</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find an order with that ID. Please check and try again.
              </p>
              <Button variant="outline" asChild>
                <Link to="/contact">Contact Support</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default TrackOrder;

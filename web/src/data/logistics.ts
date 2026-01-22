// Logistics companies for shipping
export interface LogisticsCompany {
  id: string;
  name: string;
  logo?: string;
  estimatedDays: string;
  price: number;
  description: string;
  trackingUrl: string;
}

export const logisticsCompanies: LogisticsCompany[] = [
  {
    id: "canada-post",
    name: "Canada Post",
    estimatedDays: "3-7 business days",
    price: 12.99,
    description: "Standard shipping across Canada with tracking",
    trackingUrl: "https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=",
  },
  {
    id: "fedex",
    name: "FedEx",
    estimatedDays: "1-3 business days",
    price: 24.99,
    description: "Express shipping with guaranteed delivery",
    trackingUrl: "https://www.fedex.com/fedextrack/?trknbr=",
  },
  {
    id: "dhl",
    name: "DHL Express",
    estimatedDays: "1-2 business days",
    price: 34.99,
    description: "Premium express delivery service",
    trackingUrl: "https://www.dhl.com/en/express/tracking.html?AWB=",
  },
];

export const getLogisticsById = (id: string) => logisticsCompanies.find((l) => l.id === id);

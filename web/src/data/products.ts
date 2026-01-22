import productWig1 from "@/assets/product-wig-1.jpg";
import productWig2 from "@/assets/product-wig-2.jpg";
import productSerum from "@/assets/product-serum.jpg";
import productLotion from "@/assets/product-lotion.jpg";
import productBraids from "@/assets/product-braids.jpg";
import productFlatiron from "@/assets/product-flatiron.jpg";
import categoryHair from "@/assets/category-hair.jpg";
import categoryHaircare from "@/assets/category-haircare.jpg";

export interface Product {
  id: string;
  name: string;
  slug?: string;
  price: number;
  originalPrice?: number;
  image: string;
  gallery?: string[];
  category: string;
  subcategory?: string;
  description: string;
  features: string[];
  variants?: {
    type: string;
    options: string[];
  }[];
  isNew?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  inStock: boolean;
  rating?: number;
}

export const products: Product[] = [
  {
    id: "1",
    name: "HD Lace Front Wig - Body Wave",
    slug: "hd-lace-front-wig-body-wave",
    price: 289.99,
    originalPrice: 349.99,
    image: productWig1,
    category: "Wigs",
    subcategory: "Lace Front Wigs",
    description: "Premium HD lace front wig with natural-looking hairline. Perfect for everyday wear or special occasions.",
    features: [
      "High-quality human hair",
      "Pre-plucked hairline",
      "Adjustable cap size",
      "Heat resistant up to 180°C"
    ],
    variants: [
      { type: "Length", options: ["16\"", "18\"", "20\"", "22\"", "24\""] },
      { type: "Color", options: ["Natural Black", "Dark Brown", "Off Black"] }
    ],
    isNew: true,
    isBestSeller: true,
    inStock: true,
    rating: 4.9
  },
  {
    id: "2",
    name: "Blonde Ombre Wig - Loose Wave",
    slug: "blonde-ombre-wig-loose-wave",
    price: 329.99,
    image: productWig2,
    category: "Wigs",
    subcategory: "HD Lace Wigs",
    description: "Stunning blonde ombre wig with gorgeous loose waves. A head-turner for any occasion.",
    features: [
      "Premium human hair blend",
      "Transparent HD lace",
      "Comfortable fit",
      "Natural movement"
    ],
    variants: [
      { type: "Length", options: ["18\"", "20\"", "22\"", "26\""] },
      { type: "Cap Size", options: ["Small", "Medium", "Large"] }
    ],
    isBestSeller: true,
    inStock: true,
    rating: 4.8
  },
  {
    id: "3",
    name: "Hair Growth Serum - Premium Formula",
    slug: "hair-growth-serum-premium-formula",
    price: 45.99,
    originalPrice: 59.99,
    image: productSerum,
    category: "Hair Care",
    subcategory: "Hair Growth Products",
    description: "Advanced hair growth serum with natural botanical extracts. Promotes thicker, healthier hair.",
    features: [
      "Natural ingredients",
      "Promotes hair growth",
      "Strengthens hair follicles",
      "Suitable for all hair types"
    ],
    variants: [
      { type: "Size", options: ["30ml", "60ml", "100ml"] }
    ],
    isOnSale: true,
    isBestSeller: true,
    inStock: true,
    rating: 4.7
  },
  {
    id: "4",
    name: "Luxury Body Lotion Set",
    slug: "luxury-body-lotion-set",
    price: 38.99,
    image: productLotion,
    category: "Skin & Body Care",
    subcategory: "Body Creams & Lotions",
    description: "Indulgent body lotion and cream set for silky smooth skin. Long-lasting hydration.",
    features: [
      "Deep moisturizing formula",
      "Light, fresh scent",
      "Fast absorbing",
      "Suitable for sensitive skin"
    ],
    variants: [
      { type: "Scent", options: ["Rose", "Vanilla", "Lavender", "Unscented"] }
    ],
    isNew: true,
    inStock: true,
    rating: 4.6
  },
  {
    id: "5",
    name: "Pre-Stretched Braiding Hair - Rainbow Pack",
    slug: "pre-stretched-braiding-hair-rainbow-pack",
    price: 24.99,
    image: productBraids,
    category: "Braids & Crochet",
    subcategory: "Pre-Stretched Braids",
    description: "Vibrant pre-stretched braiding hair in assorted colors. Easy to work with and long-lasting.",
    features: [
      "Pre-stretched for easy braiding",
      "Lightweight and comfortable",
      "Tangle-free",
      "Hot water sealed ends"
    ],
    variants: [
      { type: "Length", options: ["26\"", "30\""] },
      { type: "Color Pack", options: ["Rainbow Mix", "Natural Tones", "Bold Colors"] }
    ],
    isNew: true,
    inStock: true,
    rating: 4.5
  },
  {
    id: "6",
    name: "Professional Titanium Flat Iron",
    slug: "professional-titanium-flat-iron",
    price: 129.99,
    originalPrice: 169.99,
    image: productFlatiron,
    category: "Tools & Appliances",
    subcategory: "Flat Irons",
    description: "Professional-grade titanium flat iron for sleek, salon-quality results at home.",
    features: [
      "Titanium plates",
      "Adjustable temperature up to 450°F",
      "Fast heat-up time",
      "Dual voltage for travel"
    ],
    variants: [
      { type: "Plate Size", options: ["1\"", "1.5\"", "2\""] }
    ],
    isOnSale: true,
    isBestSeller: true,
    inStock: true,
    rating: 4.9
  },
  {
    id: "7",
    name: "Human Hair Bundles - Straight",
    slug: "human-hair-bundles-straight",
    price: 189.99,
    image: categoryHair,
    category: "Hair",
    subcategory: "Human Hair Bundles",
    description: "Premium 100% human hair bundles. Silky straight texture that can be styled and colored.",
    features: [
      "100% virgin human hair",
      "Double weft construction",
      "Minimal shedding",
      "Can be colored and styled"
    ],
    variants: [
      { type: "Length", options: ["12\"", "14\"", "16\"", "18\"", "20\"", "22\""] },
      { type: "Bundles", options: ["1 Bundle", "2 Bundles", "3 Bundles"] }
    ],
    isBestSeller: true,
    inStock: true,
    rating: 4.8
  },
  {
    id: "8",
    name: "Deep Conditioning Treatment",
    slug: "deep-conditioning-treatment",
    price: 28.99,
    image: categoryHaircare,
    category: "Hair Care",
    description: "Intensive deep conditioning treatment for dry and damaged hair. Restores moisture and shine.",
    features: [
      "Intensive moisture repair",
      "Keratin-infused formula",
      "Strengthens and softens",
      "For all hair types"
    ],
    variants: [
      { type: "Size", options: ["8oz", "16oz", "32oz"] }
    ],
    isNew: true,
    inStock: true,
    rating: 4.4
  }
];

export const categories = [
  { id: "hair", name: "Hair", slug: "hair" },
  { id: "wigs", name: "Wigs", slug: "wigs" },
  { id: "braids", name: "Braids & Crochet", slug: "braids-crochet" },
  { id: "haircare", name: "Hair Care", slug: "hair-care" },
  { id: "skincare", name: "Skin & Body Care", slug: "skin-body-care" },
  { id: "tools", name: "Tools & Appliances", slug: "tools-appliances" },
  { id: "fashion", name: "Fashion & Accessories", slug: "fashion-accessories" },
  { id: "kids", name: "Kids & Toys", slug: "kids-toys" }
];

export const getNewArrivals = () => products.filter(p => p.isNew);
export const getBestSellers = () => products.filter(p => p.isBestSeller);
export const getDeals = () => products.filter(p => p.isOnSale);
export const getProductsByCategory = (category: string) => 
  products.filter(p => p.category.toLowerCase() === category.toLowerCase());

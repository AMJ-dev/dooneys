import categoryHair from "@/assets/category-hair.jpg";
import categoryWigs from "@/assets/category-wigs.jpg";
import categoryBraids from "@/assets/category-braids.jpg";
import categoryHaircare from "@/assets/category-haircare.jpg";
import categorySkincare from "@/assets/category-skincare.jpg";
import categoryTools from "@/assets/category-tools.jpg";
import categoryFashion from "@/assets/category-fashion.jpg";
import categoryKids from "@/assets/category-kids.jpg";

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  subcategories?: string[];
}

export const categoryData: Category[] = [
  {
    id: "hair",
    name: "Hair",
    slug: "hair",
    image: categoryHair,
    description: "Premium hair extensions and bundles for every style.",
    subcategories: [
      "Human Hair Bundles",
      "Synthetic Hair",
      "Clip-Ins & Ponytails",
      "Tape-In / Sew-In Hair",
      "Hair Wefts",
      "Bulk Hair (for braiding)"
    ]
  },
  {
    id: "wigs",
    name: "Wigs",
    slug: "wigs",
    image: categoryWigs,
    description: "Explore our collection of wigs designed for comfort, confidence, and style.",
    subcategories: [
      "Lace Front Wigs",
      "Full Lace Wigs",
      "HD / Transparent Lace Wigs",
      "Glueless Wigs",
      "Closure Wigs",
      "Synthetic Wigs",
      "Headband Wigs",
      "Pre-Plucked Wigs"
    ]
  },
  {
    id: "braids",
    name: "Braids & Crochet",
    slug: "braids-crochet",
    image: categoryBraids,
    description: "Quality braiding and crochet hair for beautiful protective styles.",
    subcategories: [
      "Braiding Hair",
      "Crochet Hair",
      "Pre-Stretched Braids",
      "Passion Twist Hair",
      "Spring Twist Hair",
      "Faux Locs",
      "Goddess Locs",
      "Marley Hair"
    ]
  },
  {
    id: "haircare",
    name: "Hair Care",
    slug: "hair-care",
    image: categoryHaircare,
    description: "Professional hair care products for healthy, beautiful hair.",
    subcategories: [
      "Shampoos",
      "Conditioners",
      "Leave-In Treatments",
      "Oils & Serums",
      "Hair Growth Products",
      "Relaxers & Texturizers",
      "Edge Control",
      "Styling Gels & Mousse",
      "Hair Masks"
    ]
  },
  {
    id: "skincare",
    name: "Skin & Body Care",
    slug: "skin-body-care",
    image: categorySkincare,
    description: "Nourishing skincare and body care for radiant, healthy skin.",
    subcategories: [
      "Face Creams & Lotions",
      "Body Creams & Lotions",
      "Soaps & Cleansers",
      "Oils (Shea, Cocoa, Coconut, etc.)",
      "Acne Care",
      "Baby Skin Care"
    ]
  },
  {
    id: "tools",
    name: "Tools & Appliances",
    slug: "tools-appliances",
    image: categoryTools,
    description: "Professional styling tools for salon-quality results at home.",
    subcategories: [
      "Hair Dryers",
      "Flat Irons",
      "Curling Irons",
      "Hot Combs",
      "Clippers & Trimmers",
      "Hair Steamers",
      "Brushes & Combs",
      "Bonnets & Hair Caps"
    ]
  },
  {
    id: "fashion",
    name: "Fashion & Accessories",
    slug: "fashion-accessories",
    image: categoryFashion,
    description: "Trendy fashion and accessories to complete your look.",
    subcategories: [
      "Ladies Clothing",
      "Jewelry",
      "Handbags",
      "Belts",
      "Sunglasses",
      "Beauty Accessories",
      "Hair Accessories"
    ]
  },
  {
    id: "kids",
    name: "Kids & Toys",
    slug: "kids-toys",
    image: categoryKids,
    description: "Fun and educational items for the little ones.",
    subcategories: [
      "Kids Hair Accessories",
      "Kids Hair Care",
      "Dolls",
      "Educational Toys",
      "Gift Items"
    ]
  }
];

export const getCategoryBySlug = (slug: string) => 
  categoryData.find(c => c.slug === slug);

export const getCategoryById = (id: string) => 
  categoryData.find(c => c.id === id);

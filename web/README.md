my index.css code 

@tailwind base;
@tailwind components;
@tailwind utilities;

/* Doonneys Beauty Design System
   A luxury beauty e-commerce aesthetic with warm terracotta and elegant neutrals
   All colors MUST be HSL
*/

@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

@layer base {
  :root {
    /* Core Brand Colors - Warm Terracotta & Brown */
    --background: 30 20% 98%;
    --foreground: 20 30% 15%;

    --card: 0 0% 100%;
    --card-foreground: 20 30% 15%;

    --popover: 0 0% 100%;
    --popover-foreground: 20 30% 15%;

    /* Primary - Terracotta Orange */
    --primary: 20 85% 50%;
    --primary-foreground: 0 0% 100%;

    /* Secondary - Warm Brown */
    --secondary: 20 40% 25%;
    --secondary-foreground: 30 20% 98%;

    /* Muted - Soft Cream */
    --muted: 30 30% 94%;
    --muted-foreground: 20 20% 45%;

    /* Accent - Warm Coral */
    --accent: 15 70% 55%;
    --accent-foreground: 0 0% 100%;

    /* Highlight - Soft Rose */
    --highlight: 350 60% 65%;
    --highlight-foreground: 0 0% 100%;

    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;

    --border: 30 20% 88%;
    --input: 30 20% 88%;
    --ring: 20 85% 50%;

    --radius: 0.75rem;

    /* Custom Design Tokens */
    --gradient-primary: linear-gradient(135deg, hsl(20, 85%, 50%) 0%, hsl(15, 70%, 55%) 100%);
    --gradient-warm: linear-gradient(135deg, hsl(30, 40%, 96%) 0%, hsl(30, 30%, 94%) 100%);
    --gradient-hero: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%);
    --gradient-overlay: linear-gradient(180deg, rgba(139, 69, 19, 0.1) 0%, rgba(139, 69, 19, 0.05) 100%);
    
    --shadow-soft: 0 4px 20px -4px hsla(20, 30%, 20%, 0.08);
    --shadow-elevated: 0 8px 30px -8px hsla(20, 30%, 20%, 0.15);
    --shadow-card: 0 2px 15px -3px hsla(20, 30%, 20%, 0.1);
    --shadow-card-hover: 0 12px 40px -10px hsla(20, 85%, 50%, 0.2);

    /* Sidebar Colors */
    --sidebar-background: 30 20% 98%;
    --sidebar-foreground: 20 30% 25%;
    --sidebar-primary: 20 85% 50%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 30 30% 94%;
    --sidebar-accent-foreground: 20 30% 25%;
    --sidebar-border: 30 20% 88%;
    --sidebar-ring: 20 85% 50%;
  }

  .dark {
    --background: 20 25% 8%;
    --foreground: 30 20% 95%;

    --card: 20 25% 12%;
    --card-foreground: 30 20% 95%;

    --popover: 20 25% 12%;
    --popover-foreground: 30 20% 95%;

    --primary: 20 85% 55%;
    --primary-foreground: 20 25% 8%;

    --secondary: 20 30% 20%;
    --secondary-foreground: 30 20% 95%;

    --muted: 20 25% 18%;
    --muted-foreground: 30 15% 65%;

    --accent: 15 70% 60%;
    --accent-foreground: 20 25% 8%;

    --highlight: 350 60% 60%;
    --highlight-foreground: 20 25% 8%;

    --destructive: 0 70% 50%;
    --destructive-foreground: 30 20% 95%;

    --border: 20 25% 18%;
    --input: 20 25% 18%;
    --ring: 20 85% 55%;

    --sidebar-background: 20 25% 10%;
    --sidebar-foreground: 30 20% 90%;
    --sidebar-primary: 20 85% 55%;
    --sidebar-primary-foreground: 20 25% 8%;
    --sidebar-accent: 20 25% 15%;
    --sidebar-accent-foreground: 30 20% 90%;
    --sidebar-border: 20 25% 18%;
    --sidebar-ring: 20 85% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground antialiased;
    font-family: 'Inter', sans-serif;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Playfair Display', serif;
    @apply font-medium tracking-tight;
  }
}

@layer utilities {
  .font-display {
    font-family: 'Playfair Display', serif;
  }

  .font-body {
    font-family: 'Inter', sans-serif;
  }

  .text-gradient {
    @apply bg-clip-text text-transparent;
    background-image: var(--gradient-primary);
  }

  .bg-gradient-primary {
    background: var(--gradient-primary);
  }

  .bg-gradient-warm {
    background: var(--gradient-warm);
  }

  .bg-gradient-hero {
    background: var(--gradient-hero);
  }

  .bg-gradient-overlay {
    background: var(--gradient-overlay);
  }

  .shadow-soft {
    box-shadow: var(--shadow-soft);
  }

  .shadow-elevated {
    box-shadow: var(--shadow-elevated);
  }

  .shadow-card {
    box-shadow: var(--shadow-card);
  }

  .shadow-card-hover {
    box-shadow: var(--shadow-card-hover);
  }

  /* Smooth scrolling */
  .scroll-smooth {
    scroll-behavior: smooth;
  }

  /* Custom scrollbar */
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}


my tailwind.config.ts code

import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        highlight: {
          DEFAULT: "hsl(var(--highlight))",
          foreground: "hsl(var(--highlight-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        shimmer: "shimmer 2s linear infinite",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;


ROLE:

    You are a Principal React Architect + Award-Winning UI/UX Director who designs visually rich, animation-driven, luxury e-commerce interfaces for beauty and fashion brands.

    You specialize in:

        Image-heavy layouts
        Motion-first UX
        High-end product storytelling
        Smooth micro-interactions

    Your work matches or exceeds the quality of Sephora, Glossier, Zara, Shopify Plus premium stores.

    Your task is to build a complete, production-quality FRONTEND UI ONLY for Doonneys Beauty.



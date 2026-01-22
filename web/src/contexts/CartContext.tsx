import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { toast } from "@/hooks/use-toast";
import {
  CartItem,
  Product,
  ProductVariantOption,
} from "@/lib/types";
import { fetchCartItems } from "@/lib/functions";
import UserContext from "@/lib/userContext";
import { useTrackEvent } from "@/hooks/useTrackEvent";

interface CartContextType {
  items: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    variants?: Record<string, string>,
    requireVariants?: boolean
  ) => boolean;
  removeFromCart: (productId: string, variants?: Record<string, string>) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    variants?: Record<string, string>
  ) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  refreshCart: () => Promise<void>;
  getCartItemKey: (
    productId: string,
    variants?: Record<string, string>
  ) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const buildSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/gi, "-");

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const {auth} = useContext(UserContext);
  const trackEvent = useTrackEvent();

  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const getCartItemKey = (
    productId: string,
    variants?: Record<string, string>
  ) => {
    if (!variants || Object.keys(variants).length === 0) return productId;
    return (
      productId +
      "|" +
      Object.keys(variants)
        .sort()
        .map((k) => `${k}:${variants[k]}`)
        .join("|")
    );
  };

  const addToCart = (
    product: Product,
    quantity = 1,
    variants?: Record<string, string>,
    requireVariants = false
  ): boolean => {
    console.log({ product, quantity, variants, requireVariants });
    if (requireVariants && product.variants?.length) {
      const missing = product.variants.filter(
        (v) => !variants || !variants[v.type]
      );
      if (missing.length) {
        toast({
          title: "Variant selection required",
          description: `Please select: ${missing
            .map((m) => m.type)
            .join(", ")}`,
          variant: "destructive",
        });
        return false;
      }
    }

    const itemKey = getCartItemKey(product.id, variants);

    setItems((prev) => {
      const index = prev.findIndex(
        (i) =>
          getCartItemKey(
            i.product.id,
            Object.fromEntries(
              Object.entries(i.selectedVariants ?? {}).map(([k, v]) => [
                k,
                v.value,
              ])
            )
          ) === itemKey
      );

      if (index >= 0) {
        const copy = [...prev];
        copy[index].quantity += quantity;
        return copy;
      }

      let finalPrice = product.price;
      const selectedVariants: Record<string, ProductVariantOption> = {};

      if (variants && product.variants) {
        product.variants.forEach((variant) => {
          const selectedValue = variants[variant.type];
          if (!selectedValue) return;

          const rawOption = variant.options.find(
            (o) => o.value === selectedValue
          );

          if (!rawOption) return;

          const option: ProductVariantOption = {
            id: (rawOption as any).id ?? (rawOption as any).option_id,
            value: rawOption.value,
            price_modifier: rawOption.price_modifier,
          };
          if (!option) return;

          selectedVariants[variant.type] = option;

          if (option.price_modifier) {
            finalPrice += parseFloat(option.price_modifier);
          }
        });
      }

      return [
        ...prev,
        {
          product: {
            ...product,
            price: finalPrice,
            slug: product.slug ?? buildSlug(product.name),
          },
          quantity,
          selectedVariants:
            Object.keys(selectedVariants).length > 0
              ? selectedVariants
              : undefined,
        },
      ];
    });

    toast({
      title: "Added to cart",
      description: product.name,
    });
    const finalPrice = calculateFinalPrice(product, variants);
    trackEvent({
      event: "add_to_cart",
      entity_id: Number(product.id),
      value: finalPrice * quantity,
      metadata: {
        quantity,
        variants
      }
    });
    return true;
  };
  
  const calculateFinalPrice = (
    product: Product,
    variants?: Record<string, string>
  ): number => {
    let price = product.price;

    if (variants && product.variants) {
      product.variants.forEach((variant) => {
        const selectedValue = variants[variant.type];
        if (!selectedValue) return;

        const rawOption = variant.options.find(
          (o) => o.value === selectedValue
        );

        if (rawOption?.price_modifier) {
          price += parseFloat(rawOption.price_modifier);
        }
      });
    }

    return price;
  };

  const removeFromCart = (
    productId: string,
    variants?: Record<string, string>
  ) => {
    const key = getCartItemKey(productId, variants);
    setItems((prev) =>
      prev.filter(
        (i) =>
          getCartItemKey(
            i.product.id,
            Object.fromEntries(
              Object.entries(i.selectedVariants ?? {}).map(([k, v]) => [
                k,
                v.value,
              ])
            )
          ) !== key
      )
    );
  };

  const updateQuantity = (
    productId: string,
    quantity: number,
    variants?: Record<string, string>
  ) => {
    if (quantity < 1) {
      removeFromCart(productId, variants);
      return;
    }
    trackEvent({
      event: "update_cart_quantity",
      entity_id: Number(productId),
      metadata: {
        quantity,
        variants
      }
    });
    const key = getCartItemKey(productId, variants);

    setItems((prev) =>
      prev.map((i) =>
        getCartItemKey(
          i.product.id,
          Object.fromEntries(
            Object.entries(i.selectedVariants ?? {}).map(([k, v]) => [
              k,
              v.value,
            ])
          )
        ) === key
          ? { ...i, quantity }
          : i
      )
    );

  };

  const clearCart = () => {
    trackEvent({
      event: "clear_cart",
    });
    setItems([]);
  };

  const getTotalItems = () =>
    items.reduce((sum, i) => sum + i.quantity, 0);

  const getTotalPrice = () =>
    items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  interface CartApiResponseItem {
    product: any;
    quantity: number;
    variants?: {
      type: string;
      option: ProductVariantOption;
    }[];
  }
  const buildCartApiPayload = (items: CartItem[]) => {
    return items.map((i) => ({
      product_id: i.product.id,
      quantity: i.quantity,
      variants: i.selectedVariants
        ? Object.entries(i.selectedVariants).map(([type, opt]) => ({
            type,
            option_id: opt.id,
          }))
        : [],
    }));
  };
  const refreshCart = async () => {
    if (!items.length) return;

    const payload = buildCartApiPayload(items);

    const updated = (await fetchCartItems(
      payload
    )) as CartApiResponseItem[];

    setItems(
      updated.map((u) => ({
        product: u.product,
        quantity: u.quantity,
        selectedVariants: u.variants
          ? u.variants.reduce(
              (acc: Record<string, ProductVariantOption>, v) => {
                acc[v.type] = v.option;
                return acc;
              },
              {}
            )
          : undefined,
      }))
    );
  };


  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        refreshCart,
        getCartItemKey,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
};

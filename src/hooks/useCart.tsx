"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

interface CartVariant {
  id: string;
  title: string;
  price_in_cents: number;
  sale_price_in_cents: number | null;
  manage_inventory: boolean;
  currency_info?: {
    code?: string;
    symbol?: string;
    template?: string;
  };
}

interface CartProduct {
  id: string;
  title: string;
  image?: string;
}

interface CartItem {
  product: CartProduct;
  variant: CartVariant;
  quantity: number;
}

// Module-level helper to stay within sonarjs nesting depth limits
function mergeCartItem(prevItems: CartItem[], product: CartProduct, variant: CartVariant, quantity: number): CartItem[] {
  const existing = prevItems.find((item) => item.variant.id === variant.id)
  if (existing) {
    return prevItems.map((item) =>
      item.variant.id === variant.id ? { ...item, quantity: item.quantity + quantity } : item
    )
  }
  return [...prevItems, { product, variant, quantity }]
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (
    product: CartProduct,
    variant: CartVariant,
    quantity: number,
    availableQuantity?: number
  ) => Promise<void>;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => string;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = "e-commerce-cart";

export function formatCurrency(
  priceInCents: number,
  currencyInfo?: CartVariant["currency_info"]
): string {
  if (!currencyInfo || priceInCents === null || priceInCents === undefined) {
    return `€${(priceInCents / 100).toFixed(2)}`;
  }

  const { code, symbol, template } = currencyInfo;
  const currencyDisplay = symbol || code || "€";
  const amount = (priceInCents / 100).toFixed(2);

  if (template) {
    return template.replace("$1", amount);
  }

  return `${currencyDisplay}${amount}`;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      return storedCart ? JSON.parse(storedCart) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback(
    (
      product: CartProduct,
      variant: CartVariant,
      quantity: number,
      availableQuantity?: number
    ) => {
      return new Promise<void>((resolve, reject) => {
        if (variant.manage_inventory && availableQuantity !== undefined) {
          const existingItem = cartItems.find(
            (item) => item.variant.id === variant.id
          );
          const currentCartQuantity = existingItem
            ? existingItem.quantity
            : 0;
          if (currentCartQuantity + quantity > availableQuantity) {
            reject(
              new Error(
                `No hay suficiente stock para ${product.title} (${variant.title}). Solo quedan ${availableQuantity}.`
              )
            );
            return;
          }
        }

        setCartItems((prev) => mergeCartItem(prev, product, variant, quantity));
        resolve();
      });
    },
    [cartItems]
  );

  const removeFromCart = useCallback((variantId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.variant.id !== variantId)
    );
  }, []);

  const updateQuantity = useCallback(
    (variantId: string, quantity: number) => {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.variant.id === variantId ? { ...item, quantity } : item
        )
      );
    },
    []
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getCartTotal = useCallback(() => {
    if (cartItems.length === 0) return "€0.00";
    return formatCurrency(
      cartItems.reduce((total, item) => {
        const price =
          item.variant.sale_price_in_cents ?? item.variant.price_in_cents;
        return total + price * item.quantity;
      }, 0),
      cartItems[0]?.variant.currency_info
    );
  }, [cartItems]);

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
    }),
    [cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

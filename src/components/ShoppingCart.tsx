"use client";

import { useState } from "react";
import { useCart, formatCurrency } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { X, Trash2, Plus, Minus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ShoppingCartProps {
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

export function ShoppingCart({ isCartOpen, setIsCartOpen }: ShoppingCartProps) {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } =
    useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            variantId: item.variant.id,
            quantity: item.quantity,
          })),
          successUrl: `${window.location.origin}/pago-exitoso`,
          cancelUrl: `${window.location.origin}/tienda`,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("No se pudo iniciar el proceso de pago");
        setIsCheckingOut(false);
      }
    } catch {
      toast.error("Error al conectar con el servicio de pagos");
      setIsCheckingOut(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setIsCartOpen(false)}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background z-50 shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">
            Carrito ({cartItems.length})
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCartOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Tu carrito está vacío
            </p>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.variant.id}
                  className="flex gap-4 p-4 bg-card rounded-xl border border-border"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-sm">
                      {item.product.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {item.variant.title}
                    </p>
                    <p className="text-primary font-semibold text-sm mt-1">
                      {item.variant.sale_price_in_cents
                        ? formatCurrency(
                            item.variant.sale_price_in_cents,
                            item.variant.currency_info
                          )
                        : formatCurrency(
                            item.variant.price_in_cents,
                            item.variant.currency_info
                          )}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeFromCart(item.variant.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          item.quantity > 1 &&
                          updateQuantity(item.variant.id, item.quantity - 1)
                        }
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm w-6 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          updateQuantity(item.variant.id, item.quantity + 1)
                        }
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-6 border-t border-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-bold text-primary text-lg">
                {getCartTotal()}
              </span>
            </div>
            <Button
              className="w-full bg-primary text-white hover:bg-primary/90"
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirigiendo al pago...</>
              ) : (
                "Proceder al pago"
              )}
            </Button>
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={clearCart}
            >
              Vaciar carrito
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

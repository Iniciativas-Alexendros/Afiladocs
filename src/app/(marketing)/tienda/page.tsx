"use client";

import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

const products = [
  {
    id: "pack-autonomos",
    title: "Pack Autónomos",
    description:
      "Todo lo que necesitas para cumplir con la normativa: aviso legal, política de privacidad, política de cookies y condiciones generales.",
    price: 14900,
    salePrice: 9900,
    variant: "pack-autonomos-v1",
  },
  {
    id: "contrato-prestacion-servicios",
    title: "Contrato de prestación de servicios",
    description:
      "Contrato estándar para profesionales y autónomos. Personalizable y en lenguaje claro.",
    price: 4900,
    salePrice: null,
    variant: "contrato-prestacion-v1",
  },
  {
    id: "contrato-confidencialidad",
    title: "Contrato de confidencialidad (NDA)",
    description:
      "Protege tu información sensible con un NDA redactado en lenguaje claro y legalmente válido.",
    price: 3900,
    salePrice: null,
    variant: "nda-v1",
  },
  {
    id: "pack-web-legal",
    title: "Pack Web Legal",
    description:
      "Textos legales imprescindibles para tu web: aviso legal, política de privacidad y política de cookies.",
    price: 9900,
    salePrice: 6900,
    variant: "pack-web-v1",
  },
];

export default function TiendaPage() {
  const { addToCart } = useCart();

  const handleAddToCart = async (product: (typeof products)[0]) => {
    try {
      await addToCart(
        { id: product.id, title: product.title },
        {
          id: product.variant,
          title: product.title,
          price_in_cents: product.price,
          sale_price_in_cents: product.salePrice,
          manage_inventory: false,
          currency_info: { code: "EUR", symbol: "€", template: "€$1" },
        },
        1
      );
      toast.success(`${product.title} añadido al carrito`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al añadir");
    }
  };

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <ShoppingBag className="w-4 h-4" />
            <span>Tienda de documentos</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Documentos legales listos para usar
          </h1>
          <p className="text-lg text-muted-foreground">
            Plantillas y packs de documentos legales en lenguaje claro.
            Descarga inmediata tras el pago.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-card rounded-2xl p-8 shadow-sm border border-border hover:border-primary/30 transition-all duration-300"
            >
              <h2 className="text-xl font-bold text-foreground mb-3">
                {product.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {product.salePrice ? (
                    <>
                      <span className="text-primary font-bold text-lg">
                        €{(product.salePrice / 100).toFixed(2)}
                      </span>
                      <span className="text-muted-foreground line-through text-sm">
                        €{(product.price / 100).toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-primary font-bold text-lg">
                      €{(product.price / 100).toFixed(2)}
                    </span>
                  )}
                </div>
                <Button
                  onClick={() => handleAddToCart(product)}
                  variant="outline"
                  size="sm"
                >
                  Añadir al carrito <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-accent text-white rounded-2xl p-12 text-center">
          <h2 className="text-2xl font-bold mb-3">
            ¿Necesitas algo personalizado?
          </h2>
          <p className="opacity-90 mb-6">
            Si las plantillas no cubren tu caso, puedo redactarte un documento a
            medida.
          </p>
          <Button
            asChild
            className="bg-primary text-white hover:bg-primary/90"
          >
            <Link href="/contacto">Solicitar presupuesto</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

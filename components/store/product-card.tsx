"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Package } from "lucide-react"
import { toast } from "sonner"

type Product = {
  id: string
  name: string
  slug: string
  price: number
  original_price: number | null
  image_url: string | null
  unit: string
  stock: number
  is_new?: boolean
  is_discount?: boolean
}

export function addToCart(product: Product, qty = 1) {
  try {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const idx = cart.findIndex((i: { id: string }) => i.id === product.id)
    if (idx >= 0) {
      cart[idx].qty += qty
    } else {
      cart.push({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, unit: product.unit, qty })
    }
    localStorage.setItem("cart", JSON.stringify(cart))
    window.dispatchEvent(new Event("cart-updated"))
    toast.success("Adicionado ao carrinho!")
  } catch {
    toast.error("Erro ao adicionar ao carrinho")
  }
}

export default function ProductCard({ product }: { product: Product }) {
  const discount = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden group hover:shadow-xl transition-all duration-300 relative flex flex-col">
      {/* Tags */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.is_new && (
          <span className="px-2.5 py-1 bg-[#22c55e] text-white text-[10px] font-bold uppercase tracking-wide rounded-md shadow-sm">
            Novo
          </span>
        )}
        {discount > 0 && (
          <span className="px-2.5 py-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wide rounded-md shadow-sm">
            -{discount}% OFF
          </span>
        )}
        {product.is_discount && discount === 0 && (
          <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wide rounded-md shadow-sm">
            Oferta
          </span>
        )}
      </div>

      <Link href={`/produto/${product.slug}`} className="block relative aspect-square overflow-hidden bg-muted/30">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/50">
            <Package className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link href={`/produto/${product.slug}`}>
          <h3 className="text-sm font-semibold text-card-foreground line-clamp-2 mb-3 hover:text-primary transition leading-snug min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto">
          {product.original_price && product.original_price > product.price && (
            <p className="text-xs text-muted-foreground line-through mb-0.5">
              R$ {Number(product.original_price).toFixed(2).replace(".", ",")}
            </p>
          )}
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-xl font-bold text-primary">
              R$ {Number(product.price).toFixed(2).replace(".", ",")}
            </span>
          </div>
          {discount > 0 && product.original_price && (
            <p className="text-[11px] text-[#22c55e] font-semibold mb-3">
              Voce economiza R$ {(product.original_price - product.price).toFixed(2).replace(".", ",")}
            </p>
          )}
          {!discount && <div className="mb-3" />}

          <button
            onClick={() => addToCart(product)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 active:scale-[0.97] transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            Adicionar
          </button>
        </div>
      </div>
    </div>
  )
}

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
}

export function addToCart(product: Product, qty = 1) {
  try {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const idx = cart.findIndex((i: { id: string }) => i.id === product.id)
    if (idx >= 0) {
      cart[idx].qty += qty
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        unit: product.unit,
        qty,
      })
    }
    localStorage.setItem("cart", JSON.stringify(cart))
    window.dispatchEvent(new Event("cart-updated"))
    toast.success("Adicionado ao carrinho!")
  } catch {
    toast.error("Erro ao adicionar ao carrinho")
  }
}

export default function ProductCard({ product }: { product: Product }) {
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden group hover:shadow-lg transition-shadow">
      <Link href={`/produto/${product.slug}`} className="block relative aspect-square overflow-hidden bg-muted">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        {discount > 0 && (
          <span className="absolute top-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded">-{discount}%</span>
        )}
      </Link>
      <div className="p-4">
        <Link href={`/produto/${product.slug}`}>
          <h3 className="text-sm font-medium text-card-foreground line-clamp-2 mb-2 hover:text-primary transition">{product.name}</h3>
        </Link>
        <div className="mb-3">
          {product.original_price && product.original_price > product.price && (
            <p className="text-xs text-muted-foreground line-through">R$ {Number(product.original_price).toFixed(2)}</p>
          )}
          <p className="text-lg font-bold text-primary">R$ {Number(product.price).toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">/{product.unit}</p>
        </div>
        <button
          onClick={() => addToCart(product)}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition"
        >
          <ShoppingCart className="w-4 h-4" />
          Adicionar
        </button>
      </div>
    </div>
  )
}

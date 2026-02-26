"use client"

import { use, useState } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { ShoppingCart, Minus, Plus, Package, Star, ArrowLeft } from "lucide-react"
import { addToCart } from "@/components/store/product-card"
import Link from "next/link"

const supabase = createClient()

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [qty, setQty] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  const { data: product, isLoading } = useSWR(`product-${slug}`, async () => {
    const { data } = await supabase.from("products").select("*, categories(name, slug)").eq("slug", slug).single()
    return data
  })

  const { data: reviews } = useSWR(product ? `reviews-${product.id}` : null, async () => {
    if (!product) return []
    const { data } = await supabase.from("reviews").select("*").eq("product_id", product.id).eq("approved", true).order("created_at", { ascending: false })
    return data || []
  })

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
  if (!product) return <div className="max-w-7xl mx-auto px-4 py-20 text-center"><p className="text-muted-foreground">Produto nao encontrado.</p></div>

  const allImages = [product.image_url, ...(product.images || [])].filter(Boolean) as string[]
  const discount = product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0
  const avgRating = reviews?.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : null

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition mb-6">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border mb-3">
            {allImages.length > 0 ? (
              <Image src={allImages[selectedImage]} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Package className="w-20 h-20 text-muted-foreground" /></div>
            )}
            {discount > 0 && <span className="absolute top-4 left-4 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-bold rounded-lg">-{discount}%</span>}
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2">
              {allImages.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition ${i === selectedImage ? "border-primary" : "border-border"}`}>
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.categories && (
            <Link href={`/categoria/${product.categories.slug}`} className="text-sm text-primary font-medium hover:underline">{product.categories.name}</Link>
          )}
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mt-1 mb-3 text-balance">{product.name}</h1>

          {avgRating && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(avgRating)) ? "text-amber-400 fill-amber-400" : "text-muted"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{avgRating} ({reviews?.length} avaliacoes)</span>
            </div>
          )}

          <div className="mb-6">
            {product.original_price && product.original_price > product.price && (
              <p className="text-sm text-muted-foreground line-through">R$ {Number(product.original_price).toFixed(2)}</p>
            )}
            <p className="text-3xl font-bold text-primary">R$ {Number(product.price).toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">por {product.unit}</p>
          </div>

          {product.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-2">Descricao</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-border rounded-lg">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 text-foreground hover:bg-muted transition"><Minus className="w-4 h-4" /></button>
              <span className="px-4 py-3 font-medium text-foreground min-w-[48px] text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="p-3 text-foreground hover:bg-muted transition"><Plus className="w-4 h-4" /></button>
            </div>
            <span className="text-sm text-muted-foreground">{product.stock > 0 ? `${product.stock} em estoque` : "Sem estoque"}</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => addToCart(product, qty)}
              disabled={product.stock <= 0}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50"
            >
              <ShoppingCart className="w-5 h-5" /> Adicionar ao Carrinho
            </button>
            <a
              href={`https://wa.me/5516996447972?text=${encodeURIComponent(`Ola! Tenho interesse no produto: ${product.name} - R$ ${Number(product.price).toFixed(2)}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="px-6 py-3 bg-[#25d366] text-white rounded-lg font-semibold hover:bg-[#20c15c] transition"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Reviews */}
      {reviews && reviews.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Avaliacoes ({reviews.length})</h2>
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-card-foreground text-sm">{r.customer_name || "Cliente"}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < r.rating ? "text-amber-400 fill-amber-400" : "text-muted"}`} />
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

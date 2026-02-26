"use client"

import { use, useState } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { ShoppingCart, Minus, Plus, Package, Star, ChevronRight, Truck, ShieldCheck, Award } from "lucide-react"
import { addToCart } from "@/components/store/product-card"
import Link from "next/link"
import { toast } from "sonner"

const supabase = createClient()

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [qty, setQty] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, comment: "" })
  const [submittingReview, setSubmittingReview] = useState(false)

  const { data: product, isLoading } = useSWR(`product-${slug}`, async () => {
    const { data } = await supabase.from("products").select("*, categories(name, slug)").eq("slug", slug).single()
    return data
  })

  const { data: reviews, mutate: mutateReviews } = useSWR(product ? `reviews-${product.id}` : null, async () => {
    if (!product) return []
    const { data } = await supabase.from("reviews").select("*").eq("product_id", product.id).eq("approved", true).order("created_at", { ascending: false })
    return data || []
  })

  async function handleSubmitReview() {
    if (!product) return
    if (!reviewForm.name.trim()) { toast.error("Informe seu nome"); return }
    if (!reviewForm.comment.trim()) { toast.error("Escreva um comentario"); return }
    setSubmittingReview(true)
    const { error } = await supabase.from("reviews").insert({
      product_id: product.id,
      customer_name: reviewForm.name,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      approved: false,
    })
    if (error) { toast.error("Erro ao enviar avaliacao"); setSubmittingReview(false); return }
    toast.success("Avaliacao enviada! Aguarde aprovacao.")
    setReviewForm({ name: "", rating: 5, comment: "" })
    setSubmittingReview(false)
    mutateReviews()
  }

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" /></div>
  if (!product) return <div className="max-w-7xl mx-auto px-4 py-20 text-center"><p className="text-muted-foreground text-lg">Produto nao encontrado.</p></div>

  const allImages = [product.image_url, ...(product.images || [])].filter(Boolean) as string[]
  const discount = product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0
  const avgRating = reviews?.length ? (reviews.reduce((a: number, r: { rating: number }) => a + r.rating, 0) / reviews.length).toFixed(1) : "0.0"
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({ star, count: reviews?.filter((r: { rating: number }) => r.rating === star).length || 0 }))

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6 flex-wrap">
        <Link href="/" className="hover:text-primary transition">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        {product.categories && (
          <>
            <Link href={`/categoria/${product.categories.slug}`} className="hover:text-primary transition">{product.categories.name}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
          </>
        )}
        <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* Images */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted/30 border border-border mb-4">
            {allImages.length > 0 ? (
              <Image src={allImages[selectedImage]} alt={product.name} fill className="object-contain p-6" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Package className="w-24 h-24 text-muted-foreground/20" /></div>
            )}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {discount > 0 && <span className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg">-{discount}% OFF</span>}
              {product.is_new && <span className="px-3 py-1.5 bg-[#22c55e] text-white text-xs font-bold rounded-lg">Novo</span>}
            </div>
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allImages.map((img: string, i: number) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition shrink-0 ${i === selectedImage ? "border-primary shadow-md" : "border-border hover:border-primary/50"}`}>
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-3 text-balance">{product.name}</h1>

          {reviews && reviews.length > 0 && (
            <div className="flex items-center gap-2 mb-5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(avgRating)) ? "text-amber-400 fill-amber-400" : "text-border fill-border"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{avgRating} ({reviews.length} avaliacoes)</span>
            </div>
          )}

          {/* Price */}
          <div className="bg-muted/50 rounded-2xl p-5 mb-6">
            {product.original_price && product.original_price > product.price && (
              <div className="flex items-center gap-3 mb-1">
                <p className="text-base text-muted-foreground line-through">R$ {Number(product.original_price).toFixed(2).replace(".", ",")}</p>
                <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded">-{discount}% OFF</span>
              </div>
            )}
            <p className="text-4xl font-bold text-primary">R$ {Number(product.price).toFixed(2).replace(".", ",")}</p>
            {discount > 0 && product.original_price && (
              <p className="text-sm text-[#22c55e] font-semibold mt-1">
                Voce economiza R$ {(product.original_price - product.price).toFixed(2).replace(".", ",")}
              </p>
            )}
          </div>

          {/* Stock info */}
          <div className="flex items-center gap-2 mb-5">
            <div className={`w-2.5 h-2.5 rounded-full ${product.stock > 0 ? "bg-[#22c55e]" : "bg-destructive"}`} />
            <span className="text-sm font-medium text-foreground">{product.stock > 0 ? "Em estoque" : "Sem estoque"}</span>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-2">Quantidade:</label>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 text-foreground hover:bg-muted transition"><Minus className="w-4 h-4" /></button>
                <span className="px-5 py-3 font-semibold text-foreground min-w-[56px] text-center bg-muted/30">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="p-3 text-foreground hover:bg-muted transition"><Plus className="w-4 h-4" /></button>
              </div>
              <span className="text-sm text-muted-foreground">{product.stock} disponiveis</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => addToCart(product, qty)}
              disabled={product.stock <= 0}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
            >
              <ShoppingCart className="w-5 h-5" /> Adicionar ao Carrinho
            </button>
            <a
              href={`https://wa.me/5516996447972?text=${encodeURIComponent(`Ola! Tenho interesse no produto: ${product.name} - R$ ${Number(product.price).toFixed(2)}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="px-6 py-4 bg-[#25d366] text-white rounded-xl font-bold hover:bg-[#20c15c] transition shadow-lg shadow-[#25d366]/20"
            >
              WhatsApp
            </a>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: "Entrega\nRapida" },
              { icon: ShieldCheck, label: "Compra\nSegura" },
              { icon: Award, label: "Garantia\nOriginal" },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border text-center">
                <b.icon className="w-6 h-6 text-primary" />
                <span className="text-[11px] font-medium text-foreground whitespace-pre-line leading-tight">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <section className="mb-12">
          <div className="border border-border rounded-2xl overflow-hidden">
            <div className="bg-secondary px-6 py-4">
              <h2 className="text-lg font-bold text-secondary-foreground">Descricao do Produto</h2>
            </div>
            <div className="px-6 py-6">
              <p className="text-foreground leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section className="mb-12">
        <div className="border border-border rounded-2xl overflow-hidden">
          <div className="bg-secondary px-6 py-4">
            <h2 className="text-lg font-bold text-secondary-foreground">Avaliacoes dos Clientes</h2>
          </div>
          <div className="p-6">
            {/* Rating summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="text-center">
                <p className="text-5xl font-bold text-foreground mb-1">{avgRating}</p>
                <div className="flex items-center justify-center gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.round(Number(avgRating)) ? "text-amber-400 fill-amber-400" : "text-border fill-border"}`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">Baseado em {reviews?.length || 0} avaliacoes</p>
              </div>
              <div className="space-y-2">
                {ratingCounts.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground w-16">{star} estrelas</span>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: reviews?.length ? `${(count / reviews.length) * 100}%` : "0%" }} />
                    </div>
                    <span className="text-sm text-muted-foreground w-6">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Review Form */}
            <div className="bg-muted/50 rounded-xl p-5 mb-6">
              <h3 className="font-bold text-foreground mb-1">Avalie este produto</h3>
              <p className="text-sm text-muted-foreground mb-4">Compartilhe sua experiencia com {product.name}</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Seu nome</label>
                  <input value={reviewForm.name} onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none" placeholder="Digite seu nome" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Nota</label>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button key={i} onClick={() => setReviewForm({ ...reviewForm, rating: i + 1 })}>
                        <Star className={`w-7 h-7 cursor-pointer transition ${i < reviewForm.rating ? "text-amber-400 fill-amber-400" : "text-border"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Comentario</label>
                  <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none resize-none" placeholder="Conte sua experiencia..." />
                </div>
                <button onClick={handleSubmitReview} disabled={submittingReview} className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition disabled:opacity-50">
                  {submittingReview ? "Enviando..." : "Escrever Avaliacao"}
                </button>
              </div>
            </div>

            {/* Reviews list */}
            {reviews && reviews.length > 0 && (
              <div className="space-y-4">
                {reviews.map((r: { id: string; customer_name: string; rating: number; comment: string; created_at: string }) => (
                  <div key={r.id} className="border border-border rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{(r.customer_name || "C").charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{r.customer_name || "Cliente"}</p>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < r.rating ? "text-amber-400 fill-amber-400" : "text-border fill-border"}`} />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground ml-auto">{new Date(r.created_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}

            {(!reviews || reviews.length === 0) && (
              <p className="text-center text-muted-foreground py-4">Nenhuma avaliacao ainda. Seja o primeiro!</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

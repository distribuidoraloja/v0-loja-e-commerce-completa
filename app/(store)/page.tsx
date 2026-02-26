"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import HeroBanner from "@/components/store/hero-banner"
import ProductCard from "@/components/store/product-card"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Truck, ShieldCheck, Award, Headphones } from "lucide-react"

const supabase = createClient()

async function fetchHome() {
  const [featuredRes, categoriesRes, newRes, discountRes] = await Promise.all([
    supabase.from("products").select("*").eq("active", true).eq("featured", true).order("created_at", { ascending: false }).limit(8),
    supabase.from("categories").select("*, products(id)").eq("active", true).order("sort_order"),
    supabase.from("products").select("*").eq("active", true).eq("is_new", true).order("created_at", { ascending: false }).limit(8),
    supabase.from("products").select("*").eq("active", true).eq("is_discount", true).order("created_at", { ascending: false }).limit(8),
  ])
  return {
    featured: featuredRes.data || [],
    categories: categoriesRes.data || [],
    newProducts: newRes.data || [],
    discounts: discountRes.data || [],
  }
}

export default function HomePage() {
  const { data, isLoading } = useSWR("store-home", fetchHome)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      <HeroBanner />

      {/* Trust badges */}
      <section className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: "Entrega Rapida", desc: "Para toda regiao" },
              { icon: ShieldCheck, title: "Compra Segura", desc: "Dados protegidos" },
              { icon: Award, title: "Garantia Original", desc: "Produtos de qualidade" },
              { icon: Headphones, title: "Atendimento", desc: "Suporte via WhatsApp" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories - Round design centered */}
      {data?.categories && data.categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Categorias</h2>
            <p className="text-muted-foreground mt-1">Encontre o que precisa para sua obra</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {data.categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categoria/${cat.slug}`}
                className="flex flex-col items-center gap-3 group"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-border bg-card overflow-hidden flex items-center justify-center group-hover:border-primary group-hover:shadow-lg transition-all duration-300">
                  {cat.image_url ? (
                    <Image src={cat.image_url} alt={cat.name} width={96} height={96} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <span className="text-2xl md:text-3xl font-bold text-primary/50">{cat.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition">{cat.name}</p>
                  <p className="text-[11px] text-muted-foreground">{cat.products?.length || 0} produtos</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {data?.featured && data.featured.length > 0 && (
        <section className="bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Produtos em Destaque</h2>
                <p className="text-muted-foreground mt-1">Os mais procurados pelos nossos clientes</p>
              </div>
              <Link href="/produtos" className="hidden md:flex items-center gap-1.5 text-primary text-sm font-semibold hover:underline">
                Ver todos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {data.featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="md:hidden mt-6 text-center">
              <Link href="/produtos" className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold hover:underline">
                Ver todos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* New Products */}
      {data?.newProducts && data.newProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Produtos Novos</h2>
              <p className="text-muted-foreground mt-1">Ultimos lancamentos e novidades</p>
            </div>
            <Link href="/produtos" className="hidden md:flex items-center gap-1.5 text-primary text-sm font-semibold hover:underline">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {data.newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Promo Banner */}
      <section className="bg-secondary overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-4xl font-bold text-secondary-foreground text-balance">Precos de Atacado para Sua Obra</h2>
            <p className="text-secondary-foreground/70 mt-3 max-w-md">Entrega rapida para Ribeirao Preto e regiao. Faca seu orcamento agora mesmo!</p>
          </div>
          <a
            href={`https://wa.me/5516996447972?text=${encodeURIComponent("Ola! Gostaria de fazer um orcamento.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-10 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition shrink-0 shadow-lg shadow-primary/25"
          >
            Fazer Orcamento
          </a>
        </div>
      </section>

      {/* Discount Products */}
      {data?.discounts && data.discounts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Descontos Exclusivos</h2>
              <p className="text-muted-foreground mt-1">Ofertas especiais com os melhores precos</p>
            </div>
            <Link href="/produtos" className="hidden md:flex items-center gap-1.5 text-primary text-sm font-semibold hover:underline">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {data.discounts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

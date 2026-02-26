"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import HeroBanner from "@/components/store/hero-banner"
import ProductCard from "@/components/store/product-card"
import Link from "next/link"
import { ArrowRight, Package } from "lucide-react"

const supabase = createClient()

async function fetchHome() {
  const [featuredRes, categoriesRes, allRes] = await Promise.all([
    supabase.from("products").select("*").eq("active", true).eq("featured", true).limit(8),
    supabase.from("categories").select("*, products(id)").eq("active", true).order("sort_order"),
    supabase.from("products").select("*").eq("active", true).order("created_at", { ascending: false }).limit(12),
  ])
  return {
    featured: featuredRes.data || [],
    categories: categoriesRes.data || [],
    latest: allRes.data || [],
  }
}

export default function HomePage() {
  const { data, isLoading } = useSWR("store-home", fetchHome)

  return (
    <div>
      <HeroBanner />

      {/* Categories */}
      {data?.categories && data.categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Categorias</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {data.categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categoria/${cat.slug}`}
                className="bg-card rounded-xl border border-border p-4 flex flex-col items-center gap-3 hover:shadow-lg hover:border-primary/30 transition group"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition">
                  <Package className="w-7 h-7 text-primary" />
                </div>
                <p className="text-sm font-medium text-card-foreground text-center">{cat.name}</p>
                <p className="text-xs text-muted-foreground">{cat.products?.length || 0} produtos</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {data?.featured && data.featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Produtos em Destaque</h2>
            <Link href="/produtos" className="flex items-center gap-1 text-primary text-sm font-medium hover:underline">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Promo Banner */}
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground text-balance">Precos de Atacado para Sua Obra</h2>
            <p className="text-primary-foreground/80 mt-2">Entrega rapida para Ribeirao Preto e regiao. Faca seu orcamento!</p>
          </div>
          <a
            href={`https://wa.me/5516996447972?text=${encodeURIComponent("Ola! Gostaria de fazer um orcamento.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition shrink-0"
          >
            Fazer Orcamento
          </a>
        </div>
      </section>

      {/* Latest Products */}
      {data?.latest && data.latest.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Ultimos Produtos</h2>
            <Link href="/produtos" className="flex items-center gap-1 text-primary text-sm font-medium hover:underline">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.latest.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  )
}

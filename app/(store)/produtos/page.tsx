"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import ProductCard from "@/components/store/product-card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const supabase = createClient()

export default function ProductsPage() {
  const { data: products, isLoading } = useSWR("all-products", async () => {
    const { data } = await supabase.from("products").select("*").eq("active", true).order("created_at", { ascending: false })
    return data || []
  })

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition mb-6">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Todos os Produtos</h1>
      <p className="text-sm text-muted-foreground mb-8">{products?.length || 0} produtos disponiveis</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import ProductCard from "@/components/store/product-card"
import Link from "next/link"
import { ArrowLeft, Search } from "lucide-react"

const supabase = createClient()

function SearchResults() {
  const searchParams = useSearchParams()
  const q = searchParams.get("q") || ""

  const { data: products, isLoading } = useSWR(q ? `search-${q}` : null, async () => {
    const { data } = await supabase.from("products").select("*").eq("active", true).ilike("name", `%${q}%`)
    return data || []
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition mb-6">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <div className="flex items-center gap-2 mb-8">
        <Search className="w-5 h-5 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">
          {q ? `Resultados para "${q}"` : "Buscar Produtos"}
        </h1>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
      ) : !products?.length ? (
        <p className="text-center text-muted-foreground py-12">Nenhum produto encontrado.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
      <SearchResults />
    </Suspense>
  )
}

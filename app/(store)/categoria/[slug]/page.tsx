"use client"

import { use } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import ProductCard from "@/components/store/product-card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const supabase = createClient()

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)

  const { data, isLoading } = useSWR(`category-${slug}`, async () => {
    const { data: cat } = await supabase.from("categories").select("*").eq("slug", slug).single()
    if (!cat) return null
    const { data: products } = await supabase.from("products").select("*").eq("category_id", cat.id).eq("active", true).order("created_at", { ascending: false })
    return { category: cat, products: products || [] }
  })

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
  if (!data) return <div className="max-w-7xl mx-auto px-4 py-20 text-center"><p className="text-muted-foreground">Categoria nao encontrada.</p></div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition mb-6">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{data.category.name}</h1>
      <p className="text-sm text-muted-foreground mb-8">{data.products.length} produtos encontrados</p>
      {data.products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-12">Nenhum produto nesta categoria.</p>
      )}
    </div>
  )
}

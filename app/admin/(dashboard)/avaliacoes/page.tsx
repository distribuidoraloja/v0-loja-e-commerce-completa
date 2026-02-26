"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { Check, X, Star } from "lucide-react"
import { toast } from "sonner"

const supabase = createClient()
const fetcher = async () => {
  const { data } = await supabase.from("reviews").select("*, products(name)").order("created_at", { ascending: false })
  return data || []
}

export default function AvaliacoesPage() {
  const { data: reviews, mutate, isLoading } = useSWR("admin-reviews", fetcher)
  const pending = reviews?.filter((r) => !r.approved) || []
  const approved = reviews?.filter((r) => r.approved) || []

  async function handleApprove(id: string) {
    await supabase.from("reviews").update({ approved: true }).eq("id", id)
    toast.success("Avaliacao aprovada!"); mutate()
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta avaliacao?")) return
    await supabase.from("reviews").delete().eq("id", id)
    toast.success("Avaliacao excluida!"); mutate()
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{pending.length} pendentes</span>
        <span className="text-sm text-muted-foreground">{approved.length} aprovadas</span>
      </div>
      {(!reviews || reviews.length === 0) ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
          Nenhuma avaliacao recebida ainda.
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-card-foreground">{r.customer_name || "Cliente"}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${r.approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {r.approved ? "Aprovada" : "Pendente"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Produto: {r.products?.name || "-"}</p>
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < r.rating ? "text-amber-400 fill-amber-400" : "text-muted"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-card-foreground">{r.comment}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!r.approved && (
                    <button onClick={() => handleApprove(r.id)} className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition"><Check className="w-4 h-4" /></button>
                  )}
                  <button onClick={() => handleDelete(r.id)} className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition"><X className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

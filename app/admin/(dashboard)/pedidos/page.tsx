"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const supabase = createClient()
const fetcher = async () => {
  const { data } = await supabase.from("orders").select("*, customers(name, email), order_items(*)").order("created_at", { ascending: false })
  return data || []
}

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  shipping: "Em Transporte",
  delivered: "Entregue",
  cancelled: "Cancelado",
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipping: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}

export default function PedidosPage() {
  const { data: orders, mutate, isLoading } = useSWR("admin-orders", fetcher)

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id)
    if (error) { toast.error(error.message); return }
    toast.success("Status atualizado!")
    mutate()
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{orders?.length || 0} pedidos no sistema</p>
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Pedido</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Cliente</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Itens</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Total</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {(!orders || orders.length === 0) ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">Nenhum pedido registrado ainda.</td></tr>
            ) : orders.map((order) => (
              <tr key={order.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 text-sm font-medium text-card-foreground">#{order.id.slice(0, 8)}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{order.customers?.name || order.customers?.email || "-"}</td>
                <td className="px-5 py-3 text-sm text-card-foreground">{order.order_items?.length || 0}</td>
                <td className="px-5 py-3 text-sm font-medium text-card-foreground">R$ {Number(order.total).toFixed(2)}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-muted text-muted-foreground"}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="px-2 py-1 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
                  >
                    {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

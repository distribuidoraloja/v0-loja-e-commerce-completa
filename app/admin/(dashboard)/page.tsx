"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { FolderTree, Layers, Package, Star, ShoppingCart, Clock, Truck } from "lucide-react"

const supabase = createClient()

async function fetchDashboardData() {
  const [cats, subcats, prods, reviews, orders] = await Promise.all([
    supabase.from("categories").select("id", { count: "exact" }),
    supabase.from("subcategories").select("id", { count: "exact" }),
    supabase.from("products").select("id", { count: "exact" }),
    supabase.from("reviews").select("id", { count: "exact" }).eq("approved", false),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(10),
  ])
  const pendingOrders = orders.data?.filter((o) => o.status === "pending") || []
  const shippingOrders = orders.data?.filter((o) => o.status === "shipping") || []
  return {
    categories: cats.count || 0,
    subcategories: subcats.count || 0,
    products: prods.count || 0,
    pendingReviews: reviews.count || 0,
    orders: orders.data || [],
    pendingOrders: pendingOrders.length,
    shippingOrders: shippingOrders.length,
    totalOrders: orders.data?.length || 0,
  }
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useSWR("dashboard", fetchDashboardData)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  const stats = [
    { label: "Categorias", value: data?.categories || 0, icon: FolderTree, color: "bg-blue-500" },
    { label: "Subcategorias", value: data?.subcategories || 0, icon: Layers, color: "bg-indigo-500" },
    { label: "Produtos", value: data?.products || 0, icon: Package, color: "bg-primary" },
    { label: "Avaliacoes Pendentes", value: data?.pendingReviews || 0, icon: Star, color: "bg-amber-500" },
  ]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${s.color} rounded-lg flex items-center justify-center`}>
                <s.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Orders Summary */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Pedidos
          </h2>
          <p className="text-sm text-muted-foreground">{data?.totalOrders || 0} pedidos no sistema</p>
        </div>
        <div className="grid grid-cols-3 gap-4 p-5">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-muted-foreground">Pendentes</span>
            </div>
            <p className="text-2xl font-bold text-card-foreground">{data?.pendingOrders || 0}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Truck className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-muted-foreground">Em Transporte</span>
            </div>
            <p className="text-2xl font-bold text-card-foreground">{data?.shippingOrders || 0}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <ShoppingCart className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold text-card-foreground">{data?.totalOrders || 0}</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border text-left">
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Pedido</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Cliente</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Total</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {(!data?.orders || data.orders.length === 0) ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                    Nenhum pedido registrado ainda.
                  </td>
                </tr>
              ) : data.orders.map((order) => (
                <tr key={order.id} className="border-t border-border">
                  <td className="px-5 py-3 text-sm font-medium text-card-foreground">
                    #{order.id.slice(0, 8)}
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{order.customer_id?.slice(0, 8) || "-"}</td>
                  <td className="px-5 py-3 text-sm font-medium text-card-foreground">
                    R$ {Number(order.total).toFixed(2)}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === "pending" ? "bg-amber-100 text-amber-700" :
                      order.status === "shipping" ? "bg-blue-100 text-blue-700" :
                      order.status === "delivered" ? "bg-green-100 text-green-700" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {order.status === "pending" ? "Pendente" :
                       order.status === "shipping" ? "Em Transporte" :
                       order.status === "delivered" ? "Entregue" : order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

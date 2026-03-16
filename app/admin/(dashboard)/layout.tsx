"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard, Package, FolderTree, Layers, ShoppingCart,
  Star, Image as ImageIcon, LogOut, Menu, X, ChevronRight,
  MessageCircle, BarChart3, ExternalLink, Settings, Quote
} from "lucide-react"

const menuItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Pedidos", href: "/admin/pedidos", icon: ShoppingCart },
  { label: "WhatsApp", href: "/admin/whatsapp", icon: MessageCircle },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Categorias", href: "/admin/categorias", icon: FolderTree },
  { label: "Subcategorias", href: "/admin/subcategorias", icon: Layers },
  { label: "Produtos", href: "/admin/produtos", icon: Package },
  { label: "Avaliacoes", href: "/admin/avaliacoes", icon: Star },
  { label: "Banners", href: "/admin/banners", icon: ImageIcon },
  { label: "Depoimentos", href: "/admin/depoimentos", icon: Quote },
  { label: "Configuracoes", href: "/admin/configuracoes", icon: Settings },
]

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/admin/verify")
        if (res.ok) {
          setIsAdmin(true)
        } else {
          router.push("/admin/login")
        }
      } catch {
        router.push("/admin/login")
      }
    }
    checkSession()
  }, [router])

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" })
    document.cookie = "admin_session=; Max-Age=0; path=/"
    window.location.href = "/admin/login"
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-muted">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform lg:translate-x-0 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between p-5 border-b border-sidebar-border">
          <div>
            <h2 className="text-lg font-bold text-sidebar-foreground">Painel Admin</h2>
            <p className="text-xs text-sidebar-foreground/60">Atacado Cimento & Cal</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 flex flex-col gap-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {item.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all w-full"
          >
            <ExternalLink className="w-5 h-5" />
            Ver Loja
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-red-500/20 hover:text-red-400 transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-card border-b border-border px-4 py-3 flex items-center gap-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            {(() => {
              const item = menuItems.find((m) => pathname === m.href || (m.href !== "/admin" && pathname.startsWith(m.href)))
              const Icon = item?.icon || LayoutDashboard
              return <Icon className="w-5 h-5 text-primary" />
            })()}
            <h1 className="text-lg font-bold text-foreground">
              {menuItems.find((m) => pathname === m.href || (m.href !== "/admin" && pathname.startsWith(m.href)))?.label || "Dashboard"}
            </h1>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

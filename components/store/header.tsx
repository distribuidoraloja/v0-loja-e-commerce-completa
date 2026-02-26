"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, ShoppingCart, User, Menu, X, Phone } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export default function StoreHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([])
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null)
  const [cartCount, setCartCount] = useState(0)
  const [search, setSearch] = useState("")

  useEffect(() => {
    supabase.from("categories").select("id, name, slug").eq("active", true).order("sort_order").then(({ data }) => {
      if (data) setCategories(data)
    })
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({ email: data.user.email || "", name: data.user.user_metadata?.name })
    })
    // Cart from localStorage
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]")
      setCartCount(cart.reduce((acc: number, item: { qty: number }) => acc + item.qty, 0))
    } catch { /* empty */ }

    function handleCartUpdate() {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]")
        setCartCount(cart.reduce((acc: number, item: { qty: number }) => acc + item.qty, 0))
      } catch { /* empty */ }
    }
    window.addEventListener("cart-updated", handleCartUpdate)
    return () => window.removeEventListener("cart-updated", handleCartUpdate)
  }, [])

  return (
    <header className="sticky top-0 z-40">
      {/* Top bar */}
      <div className="bg-secondary text-secondary-foreground">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Phone className="w-3 h-3" />
            <a href="tel:+5516996447972" className="hover:text-primary transition">(16) 9 9644-7972</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/rastrear" className="hover:text-primary transition">Rastrear Pedido</Link>
            <Link href="/contato" className="hover:text-primary transition">Contato</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden text-foreground">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link href="/" className="shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">A</span>
              </div>
              <div className="hidden sm:block">
                <p className="font-bold text-foreground text-sm leading-tight">Atacado</p>
                <p className="text-primary text-xs font-semibold leading-tight">Cimento & Cal</p>
              </div>
            </div>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <form action={`/busca?q=${search}`} className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar produtos..."
                className="w-full pl-4 pr-12 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
              />
              <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-primary rounded-md text-primary-foreground hover:bg-primary/90 transition">
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <Link href={user ? "/minha-conta" : "/login"} className="flex items-center gap-2 text-foreground hover:text-primary transition">
              <User className="w-5 h-5" />
              <span className="hidden lg:block text-sm">{user ? (user.name || "Minha Conta") : "Entrar"}</span>
            </Link>
            <Link href="/carrinho" className="relative flex items-center gap-2 text-foreground hover:text-primary transition">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">{cartCount}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Categories nav */}
        <nav className="hidden lg:block border-t border-border">
          <div className="max-w-7xl mx-auto px-4">
            <ul className="flex items-center gap-1">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/categoria/${cat.slug}`} className="block px-4 py-2.5 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 transition rounded-lg">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-card border-b border-border shadow-lg">
          <div className="p-4">
            <form action={`/busca?q=${search}`} className="relative mb-4">
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar produtos..." className="w-full pl-4 pr-12 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm outline-none" />
              <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-primary rounded-md text-primary-foreground"><Search className="w-4 h-4" /></button>
            </form>
            <ul className="space-y-1">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/categoria/${cat.slug}`} onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 transition rounded-lg">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  )
}

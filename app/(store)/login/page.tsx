"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Erro ao fazer login")
        return
      }
      toast.success("Login realizado com sucesso!")
      router.push("/")
    } catch {
      toast.error("Erro de conexao")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground">Entrar na sua conta</h1>
        <p className="text-muted-foreground mt-1">Acesse sua conta para acompanhar seus pedidos</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-8">
        <div className="mb-5">
          <label className="block text-sm font-medium text-card-foreground mb-2">E-mail</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none transition" placeholder="seu@email.com" required />
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-card-foreground mb-2">Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-11 pr-12 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none transition" placeholder="Sua senha" required />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50">
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Nao tem conta? <Link href="/cadastro" className="text-primary font-medium hover:underline">Cadastre-se</Link>
        </p>
      </form>
    </div>
  )
}

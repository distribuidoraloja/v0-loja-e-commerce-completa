"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Mail, Lock, Eye, EyeOff, Phone, CreditCard } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

function maskCPF(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1")
}

function maskPhone(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{1})(\d{4})(\d)/, "$1 $2-$3")
    .replace(/(-\d{4})\d+?$/, "$1")
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", cpf: "", phone: "", password: "", confirmPassword: "" })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function handleChange(field: string, value: string) {
    if (field === "cpf") value = maskCPF(value)
    if (field === "phone") value = maskPhone(value)
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { toast.error("As senhas nao coincidem"); return }
    if (form.password.length < 6) { toast.error("A senha deve ter pelo menos 6 caracteres"); return }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          cpf: form.cpf,
          phone: form.phone,
          password: form.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Erro ao cadastrar"); return }

      // Login automatico apos cadastro
      const supabase = createClient()
      await supabase.auth.signInWithPassword({ email: form.email, password: form.password })

      toast.success("Cadastro realizado com sucesso!")
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
        <h1 className="text-2xl font-bold text-foreground">Criar Conta</h1>
        <p className="text-muted-foreground mt-1">Preencha seus dados para se cadastrar</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Nome Completo*</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="text" value={form.name} onChange={(e) => handleChange("name", e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none transition" placeholder="Seu nome completo" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">E-mail*</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none transition" placeholder="seu@email.com" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">CPF</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="text" value={form.cpf} onChange={(e) => handleChange("cpf", e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none transition" placeholder="000.000.000-00" maxLength={14} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Telefone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="text" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none transition" placeholder="(00) 0 0000-0000" maxLength={16} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Senha*</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type={showPass ? "text" : "password"} value={form.password} onChange={(e) => handleChange("password", e.target.value)} className="w-full pl-11 pr-12 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none transition" placeholder="Minimo 6 caracteres" required />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Confirmar Senha*</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="password" value={form.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none transition" placeholder="Repita a senha" required />
            </div>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 mt-6 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50">
          {loading ? "Cadastrando..." : "Criar Conta"}
        </button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Ja tem conta? <Link href="/login" className="text-primary font-medium hover:underline">Entrar</Link>
        </p>
      </form>
    </div>
  )
}

"use client"

import { useState } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { Plus, Pencil, Trash2, X, Upload } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

const supabase = createClient()
const fetcher = async () => {
  const { data } = await supabase.from("categories").select("*, products(id)").order("sort_order")
  return data || []
}

export default function CategoriasPage() {
  const { data: categories, mutate, isLoading } = useSWR("admin-categories", fetcher)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", slug: "", image_url: "", active: true, sort_order: 0 })
  const [uploading, setUploading] = useState(false)

  function openNew() {
    setEditing(null)
    setForm({ name: "", slug: "", image_url: "", active: true, sort_order: 0 })
    setShowForm(true)
  }

  function openEdit(cat: { id: string; name: string; slug: string; image_url: string | null; active: boolean; sort_order: number }) {
    setEditing(cat.id)
    setForm({ name: cat.name, slug: cat.slug, image_url: cat.image_url || "", active: cat.active, sort_order: cat.sort_order })
    setShowForm(true)
  }

  function generateSlug(name: string) {
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (data.url) setForm((f) => ({ ...f, image_url: data.url }))
      else toast.error("Erro ao fazer upload")
    } catch { toast.error("Erro ao fazer upload") }
    setUploading(false)
  }

  async function handleSave() {
    if (!form.name) { toast.error("Nome obrigatorio"); return }
    const slug = form.slug || generateSlug(form.name)
    if (editing) {
      const { error } = await supabase.from("categories").update({ ...form, slug }).eq("id", editing)
      if (error) { toast.error(error.message); return }
      toast.success("Categoria atualizada!")
    } else {
      const { error } = await supabase.from("categories").insert({ ...form, slug })
      if (error) { toast.error(error.message); return }
      toast.success("Categoria criada!")
    }
    setShowForm(false)
    mutate()
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja excluir esta categoria?")) return
    const { error } = await supabase.from("categories").delete().eq("id", id)
    if (error) { toast.error(error.message); return }
    toast.success("Categoria excluida!")
    mutate()
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{categories?.length || 0} categorias cadastradas</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition">
          <Plus className="w-4 h-4" /> Nova Categoria
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl p-6 w-full max-w-md border border-border">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-card-foreground">{editing ? "Editar Categoria" : "Nova Categoria"}</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Nome</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })} className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Imagem</label>
                {form.image_url && <Image src={form.image_url} alt="Categoria" width={120} height={80} className="rounded-lg mb-2 object-cover" />}
                <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-muted transition">
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{uploading ? "Enviando..." : "Selecionar imagem"}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-primary" />
                <label className="text-sm text-card-foreground">Ativa</label>
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition">
                  {editing ? "Atualizar" : "Criar"}
                </button>
                <button onClick={() => setShowForm(false)} className="flex-1 py-2 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80 transition">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Imagem</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Categoria</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Slug</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Produtos</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((cat) => (
              <tr key={cat.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3">
                  {cat.image_url ? (
                    <Image src={cat.image_url} alt={cat.name} width={48} height={48} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs">Sem img</div>
                  )}
                </td>
                <td className="px-5 py-3 font-medium text-card-foreground">{cat.name}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{cat.slug}</td>
                <td className="px-5 py-3 text-sm text-card-foreground">{cat.products?.length || 0}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${cat.active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                    {cat.active ? "Ativa" : "Inativa"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(cat)} className="p-2 rounded-lg hover:bg-muted transition text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

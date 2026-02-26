"use client"

import { useState } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { Plus, Pencil, Trash2, X, Upload } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

const supabase = createClient()
const fetcher = async () => {
  const { data } = await supabase.from("banners").select("*").order("sort_order")
  return data || []
}

export default function BannersPage() {
  const { data: banners, mutate, isLoading } = useSWR("admin-banners", fetcher)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState({ title: "", subtitle: "", image_url: "", link: "", active: true, sort_order: 0 })
  const [uploading, setUploading] = useState(false)

  function openNew() { setEditing(null); setForm({ title: "", subtitle: "", image_url: "", link: "", active: true, sort_order: 0 }); setShowForm(true) }

  function openEdit(b: { id: string; title: string | null; subtitle: string | null; image_url: string; link: string | null; active: boolean; sort_order: number }) {
    setEditing(b.id); setForm({ title: b.title || "", subtitle: b.subtitle || "", image_url: b.image_url, link: b.link || "", active: b.active, sort_order: b.sort_order }); setShowForm(true)
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
    } catch { toast.error("Erro ao fazer upload") }
    setUploading(false)
  }

  async function handleSave() {
    if (!form.image_url) { toast.error("Imagem obrigatoria"); return }
    if (editing) {
      const { error } = await supabase.from("banners").update(form).eq("id", editing)
      if (error) { toast.error(error.message); return }
      toast.success("Banner atualizado!")
    } else {
      const { error } = await supabase.from("banners").insert(form)
      if (error) { toast.error(error.message); return }
      toast.success("Banner criado!")
    }
    setShowForm(false); mutate()
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este banner?")) return
    await supabase.from("banners").delete().eq("id", id)
    toast.success("Banner excluido!"); mutate()
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{banners?.length || 0} banners cadastrados</p>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition">
          <Plus className="w-4 h-4" /> Novo Banner
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl p-6 w-full max-w-md border border-border">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-card-foreground">{editing ? "Editar" : "Novo"} Banner</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Titulo</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Subtitulo</label>
                <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Link (opcional)</label>
                <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Imagem*</label>
                {form.image_url && <Image src={form.image_url} alt="Banner" width={400} height={150} className="rounded-lg mb-2 object-cover w-full h-32" />}
                <label className="flex items-center gap-2 px-4 py-3 border border-dashed border-border rounded-lg cursor-pointer hover:bg-muted transition">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{uploading ? "Enviando..." : "Selecionar imagem"}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-primary" />
                <label className="text-sm text-card-foreground">Ativo</label>
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition">{editing ? "Atualizar" : "Criar"}</button>
                <button onClick={() => setShowForm(false)} className="flex-1 py-2 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80 transition">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners?.map((b) => (
          <div key={b.id} className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="relative h-40">
              <Image src={b.image_url} alt={b.title || "Banner"} fill className="object-cover" />
              {!b.active && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-sm font-medium text-primary-foreground bg-muted-foreground/80 px-3 py-1 rounded">Inativo</span></div>}
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-card-foreground">{b.title || "Sem titulo"}</p>
                {b.subtitle && <p className="text-sm text-muted-foreground">{b.subtitle}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(b)} className="p-2 rounded-lg hover:bg-muted transition text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(b.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

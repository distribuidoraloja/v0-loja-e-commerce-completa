"use client"

import { useState } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { Plus, Pencil, Trash2, X, Upload, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

const supabase = createClient()

const fetchProducts = async () => {
  const { data } = await supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false })
  return data || []
}
const fetchCats = async () => {
  const { data } = await supabase.from("categories").select("id, name").order("name")
  return data || []
}
const fetchSubcats = async () => {
  const { data } = await supabase.from("subcategories").select("id, name, category_id").order("name")
  return data || []
}

type ProductForm = {
  name: string; slug: string; description: string; price: string; original_price: string;
  category_id: string; subcategory_id: string; image_url: string; images: string[];
  unit: string; stock: string; active: boolean; featured: boolean
}

const emptyForm: ProductForm = {
  name: "", slug: "", description: "", price: "", original_price: "",
  category_id: "", subcategory_id: "", image_url: "", images: [],
  unit: "un", stock: "0", active: true, featured: false
}

export default function ProdutosPage() {
  const { data: products, mutate, isLoading } = useSWR("admin-products", fetchProducts)
  const { data: categories } = useSWR("admin-cats-select2", fetchCats)
  const { data: subcategories } = useSWR("admin-subcats-select", fetchSubcats)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [uploading, setUploading] = useState(false)

  function generateSlug(name: string) {
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  }

  function openNew() { setEditing(null); setForm(emptyForm); setShowForm(true) }

  function openEdit(p: Record<string, unknown>) {
    setEditing(p.id as string)
    setForm({
      name: p.name as string, slug: p.slug as string, description: (p.description as string) || "",
      price: String(p.price), original_price: p.original_price ? String(p.original_price) : "",
      category_id: (p.category_id as string) || "", subcategory_id: (p.subcategory_id as string) || "",
      image_url: (p.image_url as string) || "", images: (p.images as string[]) || [],
      unit: (p.unit as string) || "un", stock: String(p.stock || 0),
      active: p.active as boolean, featured: p.featured as boolean
    })
    setShowForm(true)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    setUploading(true)
    const newImages: string[] = []
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append("file", file)
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd })
        const data = await res.json()
        if (data.url) newImages.push(data.url)
      } catch { toast.error("Erro ao fazer upload") }
    }
    setForm((f) => {
      const allImages = [...f.images, ...newImages]
      return { ...f, images: allImages, image_url: f.image_url || allImages[0] || "" }
    })
    setUploading(false)
  }

  function setMainImage(url: string) {
    setForm((f) => ({ ...f, image_url: url }))
  }

  function removeImage(url: string) {
    setForm((f) => ({
      ...f,
      images: f.images.filter((i) => i !== url),
      image_url: f.image_url === url ? (f.images.filter((i) => i !== url)[0] || "") : f.image_url,
    }))
  }

  async function handleSave() {
    if (!form.name || !form.price) { toast.error("Nome e preco sao obrigatorios"); return }
    const slug = form.slug || generateSlug(form.name)
    const payload = {
      name: form.name, slug, description: form.description,
      price: parseFloat(form.price) || 0,
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      category_id: form.category_id || null, subcategory_id: form.subcategory_id || null,
      image_url: form.image_url || null, images: form.images,
      unit: form.unit, stock: parseInt(form.stock) || 0,
      active: form.active, featured: form.featured,
    }

    if (editing) {
      const { error } = await supabase.from("products").update(payload).eq("id", editing)
      if (error) { toast.error(error.message); return }
      toast.success("Produto atualizado!")
    } else {
      const { error } = await supabase.from("products").insert(payload)
      if (error) { toast.error(error.message); return }
      toast.success("Produto criado!")
    }
    setShowForm(false); mutate()
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja excluir este produto?")) return
    await supabase.from("products").delete().eq("id", id)
    toast.success("Produto excluido!"); mutate()
  }

  const filteredSubcats = subcategories?.filter((s) => s.category_id === form.category_id) || []

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{products?.length || 0} produtos cadastrados</p>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition">
          <Plus className="w-4 h-4" /> Novo Produto
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-card rounded-xl p-6 w-full max-w-2xl border border-border my-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-card-foreground">{editing ? "Editar Produto" : "Novo Produto"}</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Nome do Produto*</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })} className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Categoria*</label>
                  <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value, subcategory_id: "" })} className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none">
                    <option value="">Selecione...</option>
                    {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Subcategoria</label>
                  <select value={form.subcategory_id} onChange={(e) => setForm({ ...form, subcategory_id: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none">
                    <option value="">Selecione...</option>
                    {filteredSubcats.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Unidade</label>
                  <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none">
                    <option value="un">Unidade</option>
                    <option value="saco">Saco</option>
                    <option value="lata">Lata</option>
                    <option value="balde">Balde</option>
                    <option value="pct">Pacote</option>
                    <option value="barra">Barra</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Descricao</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Preco Original (R$)</label>
                  <input type="number" step="0.01" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Preco Promocional (R$)*</label>
                  <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Estoque*</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Imagens do Produto</label>
                {form.images.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative group">
                        <Image src={img} alt={`Produto ${i + 1}`} width={80} height={80} className="w-20 h-20 rounded-lg object-cover border border-border" />
                        {form.image_url === img && (
                          <span className="absolute top-0.5 left-0.5 px-1 py-0.5 bg-primary text-primary-foreground text-[10px] rounded font-bold">PRINCIPAL</span>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center gap-1">
                          <button onClick={() => setMainImage(img)} className="p-1 bg-primary rounded text-primary-foreground" title="Definir como principal"><ImageIcon className="w-3 h-3" /></button>
                          <button onClick={() => removeImage(img)} className="p-1 bg-destructive rounded text-primary-foreground" title="Remover"><X className="w-3 h-3" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-3 border border-dashed border-border rounded-lg cursor-pointer hover:bg-muted transition">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{uploading ? "Enviando..." : `Selecionar Imagens (${form.images.length}/10)`}</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading || form.images.length >= 10} />
                </label>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-primary" />
                  <span className="text-sm text-card-foreground">Ativo</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-primary" />
                  <span className="text-sm text-card-foreground">Destaque</span>
                </label>
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition">{editing ? "Atualizar" : "Criar Produto"}</button>
                <button onClick={() => setShowForm(false)} className="flex-1 py-2 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80 transition">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Imagem</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Produto</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Categoria</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Preco</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Estoque</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3">
                  {p.image_url ? (
                    <Image src={p.image_url} alt={p.name} width={48} height={48} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center"><Package className="w-5 h-5 text-muted-foreground" /></div>
                  )}
                </td>
                <td className="px-5 py-3">
                  <p className="font-medium text-card-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.unit}</p>
                </td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{p.categories?.name || "-"}</td>
                <td className="px-5 py-3">
                  <p className="font-medium text-primary">R$ {Number(p.price).toFixed(2)}</p>
                  {p.original_price && <p className="text-xs text-muted-foreground line-through">R$ {Number(p.original_price).toFixed(2)}</p>}
                </td>
                <td className="px-5 py-3 text-sm text-card-foreground">{p.stock}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${p.active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>{p.active ? "Ativo" : "Inativo"}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-muted transition text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
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

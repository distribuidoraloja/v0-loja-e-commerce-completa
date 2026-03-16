"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, X, Star, Quote } from "lucide-react"

interface Testimonial {
  id: string
  name: string
  city: string | null
  state: string | null
  comment: string
  rating: number
  active: boolean
  sort_order: number
}

export default function DepoimentosPage() {
  const supabase = createClient()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [form, setForm] = useState({ name: "", city: "", state: "", comment: "", rating: 5, active: true })

  useEffect(() => {
    loadTestimonials()
  }, [])

  async function loadTestimonials() {
    const { data } = await supabase.from("testimonials").select("*").order("sort_order")
    if (data) setTestimonials(data)
    setLoading(false)
  }

  function openModal(testimonial?: Testimonial) {
    if (testimonial) {
      setEditing(testimonial)
      setForm({
        name: testimonial.name,
        city: testimonial.city || "",
        state: testimonial.state || "",
        comment: testimonial.comment,
        rating: testimonial.rating,
        active: testimonial.active
      })
    } else {
      setEditing(null)
      setForm({ name: "", city: "", state: "", comment: "", rating: 5, active: true })
    }
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name || !form.comment) {
      toast.error("Preencha nome e comentário")
      return
    }

    if (editing) {
      const { error } = await supabase
        .from("testimonials")
        .update({ ...form })
        .eq("id", editing.id)
      if (error) {
        toast.error("Erro ao atualizar")
        return
      }
      toast.success("Depoimento atualizado!")
    } else {
      const { error } = await supabase
        .from("testimonials")
        .insert([{ ...form, sort_order: testimonials.length }])
      if (error) {
        toast.error("Erro ao criar")
        return
      }
      toast.success("Depoimento criado!")
    }

    setModalOpen(false)
    loadTestimonials()
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este depoimento?")) return
    await supabase.from("testimonials").delete().eq("id", id)
    toast.success("Excluído!")
    loadTestimonials()
  }

  async function toggleActive(testimonial: Testimonial) {
    await supabase.from("testimonials").update({ active: !testimonial.active }).eq("id", testimonial.id)
    loadTestimonials()
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Depoimentos</h1>
          <p className="text-muted-foreground">{testimonials.length} depoimentos cadastrados</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Novo Depoimento
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map(t => (
          <div key={t.id} className={`bg-card border border-border rounded-xl p-4 ${!t.active ? "opacity-50" : ""}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < t.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                ))}
              </div>
              <div className="flex gap-1">
                <button onClick={() => openModal(t)} className="p-1 text-muted-foreground hover:text-foreground">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(t.id)} className="p-1 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <Quote className="h-6 w-6 text-primary/20 mb-2" />
            <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{t.comment}</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{t.name}</p>
                {t.city && <p className="text-xs text-muted-foreground">{t.city}{t.state ? `, ${t.state}` : ""}</p>}
              </div>
              <button
                onClick={() => toggleActive(t)}
                className={`text-xs px-2 py-1 rounded-full ${t.active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}
              >
                {t.active ? "Ativo" : "Inativo"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold">{editing ? "Editar Depoimento" : "Novo Depoimento"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-muted rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Cidade</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={e => setForm(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="SP"
                    maxLength={2}
                    className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Avaliação</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, rating: n }))}
                      className="p-1"
                    >
                      <Star className={`h-6 w-6 ${n <= form.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Comentário *</label>
                <textarea
                  value={form.comment}
                  onChange={e => setForm(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background resize-none"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={e => setForm(prev => ({ ...prev, active: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Ativo</span>
              </label>
            </div>
            <div className="flex gap-2 p-4 border-t border-border">
              <button onClick={() => setModalOpen(false)} className="flex-1 border border-border py-2 rounded-lg hover:bg-muted">
                Cancelar
              </button>
              <button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

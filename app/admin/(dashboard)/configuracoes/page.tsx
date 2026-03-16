"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Save, Upload, Image as ImageIcon, X } from "lucide-react"

interface Setting {
  id: string
  key: string
  value: string | null
}

export default function ConfiguracoesPage() {
  const supabase = createClient()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    const { data } = await supabase.from("site_settings").select("*")
    if (data) {
      const obj: Record<string, string> = {}
      data.forEach((s: Setting) => {
        obj[s.key] = s.value || ""
      })
      setSettings(obj)
    }
    setLoading(false)
  }

  async function handleImageUpload(key: string, file: File) {
    const fd = new FormData()
    fd.append("file", file)
    fd.append("folder", "settings")
    
    const res = await fetch("/api/upload", { method: "POST", body: fd })
    const data = await res.json()
    
    if (data.url) {
      setSettings(prev => ({ ...prev, [key]: data.url }))
      toast.success("Imagem enviada!")
    } else {
      toast.error("Erro ao enviar imagem")
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      for (const [key, value] of Object.entries(settings)) {
        await supabase
          .from("site_settings")
          .update({ value, updated_at: new Date().toISOString() })
          .eq("key", key)
      }
      toast.success("Configurações salvas!")
    } catch {
      toast.error("Erro ao salvar")
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações do Site</h1>
          <p className="text-muted-foreground">Personalize sua loja</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Logo */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Logo do Site</h3>
          <div className="space-y-4">
            {settings.logo_url ? (
              <div className="relative w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                <img src={settings.logo_url} alt="Logo" className="max-h-28 max-w-full object-contain" />
                <button
                  onClick={() => setSettings(prev => ({ ...prev, logo_url: "" }))}
                  className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => logoInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Clique para enviar</span>
              </div>
            )}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleImageUpload("logo_url", e.target.files[0])}
            />
          </div>
        </div>

        {/* Favicon */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Favicon</h3>
          <div className="space-y-4">
            {settings.favicon_url ? (
              <div className="relative w-24 h-24 bg-muted rounded-lg flex items-center justify-center mx-auto">
                <img src={settings.favicon_url} alt="Favicon" className="max-h-20 max-w-20 object-contain" />
                <button
                  onClick={() => setSettings(prev => ({ ...prev, favicon_url: "" }))}
                  className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => faviconInputRef.current?.click()}
                className="w-24 h-24 mx-auto border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">32x32px</span>
              </div>
            )}
            <input
              ref={faviconInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleImageUpload("favicon_url", e.target.files[0])}
            />
          </div>
        </div>
      </div>

      {/* Text Settings */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="font-semibold">Informações do Site</h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do Site</label>
            <input
              type="text"
              value={settings.site_name || ""}
              onChange={e => setSettings(prev => ({ ...prev, site_name: e.target.value }))}
              className="w-full border border-border rounded-lg px-3 py-2 bg-background"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">WhatsApp</label>
            <input
              type="text"
              value={settings.whatsapp_number || ""}
              onChange={e => setSettings(prev => ({ ...prev, whatsapp_number: e.target.value }))}
              placeholder="5516999999999"
              className="w-full border border-border rounded-lg px-3 py-2 bg-background"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea
            value={settings.site_description || ""}
            onChange={e => setSettings(prev => ({ ...prev, site_description: e.target.value }))}
            rows={2}
            className="w-full border border-border rounded-lg px-3 py-2 bg-background resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Endereço</label>
          <input
            type="text"
            value={settings.address || ""}
            onChange={e => setSettings(prev => ({ ...prev, address: e.target.value }))}
            className="w-full border border-border rounded-lg px-3 py-2 bg-background"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">E-mail</label>
          <input
            type="email"
            value={settings.email || ""}
            onChange={e => setSettings(prev => ({ ...prev, email: e.target.value }))}
            className="w-full border border-border rounded-lg px-3 py-2 bg-background"
          />
        </div>
      </div>
    </div>
  )
}

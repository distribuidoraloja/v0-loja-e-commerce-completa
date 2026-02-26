"use client"

import { useState } from "react"
import { X, Send, MessageCircle } from "lucide-react"

const PHONE = "5516996447972"

export default function WhatsAppChat() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")

  function sendMessage() {
    const text = message.trim() || "Ola! Gostaria de mais informacoes."
    const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`
    window.open(url, "_blank")
    setMessage("")
    setOpen(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Panel */}
      {open && (
        <div className="absolute bottom-16 right-0 w-80 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
          {/* Header */}
          <div className="bg-[#075e54] text-white p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Atacado Cimento & Cal</p>
              <p className="text-xs text-white/70">Online agora</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages area */}
          <div className="p-4 bg-[#ece5dd] min-h-[180px]">
            <div className="bg-white rounded-lg p-3 shadow-sm max-w-[85%] mb-3">
              <p className="text-sm text-gray-800">Ola! Bem-vindo ao Atacado Cimento & Cal.</p>
              <p className="text-sm text-gray-800 mt-1">Como posso ajudar voce hoje?</p>
              <p className="text-[10px] text-gray-400 mt-1 text-right">Agora</p>
            </div>
            <div className="space-y-2">
              {["Quero fazer um orcamento", "Duvida sobre produtos", "Informacoes de entrega"].map((q) => (
                <button
                  key={q}
                  onClick={() => setMessage(q)}
                  className="block w-full text-left px-3 py-2 bg-white/80 rounded-lg text-xs text-gray-700 hover:bg-white transition border border-gray-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 bg-[#f0f0f0] flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Digite sua mensagem..."
              className="flex-1 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-800 outline-none focus:ring-1 focus:ring-[#075e54]"
            />
            <button
              onClick={sendMessage}
              className="w-10 h-10 bg-[#25d366] rounded-full flex items-center justify-center text-white hover:bg-[#20c15c] transition shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-[#25d366] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#20c15c] transition hover:scale-110"
        aria-label="Abrir WhatsApp"
      >
        {open ? <X className="w-6 h-6" /> : (
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        )}
      </button>
    </div>
  )
}

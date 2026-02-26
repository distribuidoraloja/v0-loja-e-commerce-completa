import Link from "next/link"
import { MapPin, Phone, Mail, Globe } from "lucide-react"

export default function StoreFooter() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">A</span>
              </div>
              <div>
                <p className="font-bold text-secondary-foreground text-sm">Atacado</p>
                <p className="text-primary text-xs font-semibold">Cimento & Cal</p>
              </div>
            </div>
            <p className="text-sm text-secondary-foreground/70 leading-relaxed">
              Atacado de materiais de construcao com os melhores precos e atendimento.
            </p>
          </div>

          {/* Atendimento */}
          <div>
            <h3 className="font-bold text-secondary-foreground mb-4">Atendimento</h3>
            <ul className="space-y-2 text-sm text-secondary-foreground/70">
              <li><Link href="/sobre" className="hover:text-primary transition">Sobre Nos</Link></li>
              <li><Link href="/contato" className="hover:text-primary transition">Fale Conosco</Link></li>
              <li><Link href="/rastrear" className="hover:text-primary transition">Rastrear Pedido</Link></li>
              <li><Link href="/trocas" className="hover:text-primary transition">Trocas e Devolucoes</Link></li>
            </ul>
          </div>

          {/* Informacoes */}
          <div>
            <h3 className="font-bold text-secondary-foreground mb-4">Informacoes</h3>
            <ul className="space-y-2 text-sm text-secondary-foreground/70">
              <li><Link href="/privacidade" className="hover:text-primary transition">Politica de Privacidade</Link></li>
              <li><Link href="/termos" className="hover:text-primary transition">Termos de Uso</Link></li>
              <li><Link href="/frete" className="hover:text-primary transition">Politica de Frete</Link></li>
              <li><Link href="/pagamento" className="hover:text-primary transition">Formas de Pagamento</Link></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-bold text-secondary-foreground mb-4">Contato</h3>
            <ul className="space-y-3 text-sm text-secondary-foreground/70">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                <span>Rua Igarapava, 73<br />Vila Albertina<br />Ribeirao Preto - SP<br />CEP: 14.075-453</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-primary" />
                <a href="tel:+5516996447972" className="hover:text-primary transition">(16) 9 9644-7972</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-primary" />
                <a href="mailto:contato@atacadodeconstrucao.com" className="hover:text-primary transition">contato@atacadodeconstrucao.com</a>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4 shrink-0 text-primary" />
                <a href="https://www.atacadodeconstrucao.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition">www.atacadodeconstrucao.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/10 mt-8 pt-8 text-center text-sm text-secondary-foreground/50">
          <p>Atacado Cimento & Cal - Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

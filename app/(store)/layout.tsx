import StoreHeader from "@/components/store/header"
import StoreFooter from "@/components/store/footer"
import WhatsAppChat from "@/components/store/whatsapp-chat"

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <StoreHeader />
      <main className="flex-1">{children}</main>
      <StoreFooter />
      <WhatsAppChat />
    </div>
  )
}

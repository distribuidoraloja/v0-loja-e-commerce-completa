"use client"

import { useState, useEffect, useCallback } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const supabase = createClient()
const fetcher = async () => {
  const { data } = await supabase.from("banners").select("*").eq("active", true).order("sort_order")
  return data || []
}

export default function HeroBanner() {
  const { data: banners } = useSWR("store-banners", fetcher)
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    if (!banners?.length) return
    setCurrent((c) => (c + 1) % banners.length)
  }, [banners])

  const prev = useCallback(() => {
    if (!banners?.length) return
    setCurrent((c) => (c - 1 + banners.length) % banners.length)
  }, [banners])

  useEffect(() => {
    if (!banners?.length || banners.length <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [banners, next])

  if (!banners?.length) {
    return (
      <div className="relative w-full h-64 md:h-96 bg-secondary flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-secondary-foreground">Atacado Cimento & Cal</h2>
          <p className="text-secondary-foreground/70 mt-2">Os melhores precos em materiais de construcao</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-64 md:h-96 lg:h-[480px] overflow-hidden bg-secondary">
      {banners.map((banner, i) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          {banner.link ? (
            <Link href={banner.link} className="block w-full h-full relative">
              <Image src={banner.image_url} alt={banner.title || "Banner"} fill className="object-cover" priority={i === 0} />
              {(banner.title || banner.subtitle) && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                  <div className="max-w-7xl mx-auto px-8 w-full">
                    {banner.title && <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 text-balance">{banner.title}</h2>}
                    {banner.subtitle && <p className="text-lg md:text-xl text-white/80">{banner.subtitle}</p>}
                  </div>
                </div>
              )}
            </Link>
          ) : (
            <div className="w-full h-full relative">
              <Image src={banner.image_url} alt={banner.title || "Banner"} fill className="object-cover" priority={i === 0} />
              {(banner.title || banner.subtitle) && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                  <div className="max-w-7xl mx-auto px-8 w-full">
                    {banner.title && <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 text-balance">{banner.title}</h2>}
                    {banner.subtitle && <p className="text-lg md:text-xl text-white/80">{banner.subtitle}</p>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {banners.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={`w-2.5 h-2.5 rounded-full transition ${i === current ? "bg-primary w-8" : "bg-white/50"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

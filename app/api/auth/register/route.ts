import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { name, email, cpf, phone, password } = await request.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, email e senha sao obrigatorios" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${request.nextUrl.origin}/`,
        data: { name, cpf, phone },
      },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (authData.user) {
      await supabase.from("customers").insert({
        auth_user_id: authData.user.id,
        name,
        email,
        cpf: cpf || null,
        phone: phone || null,
      })
    }

    return NextResponse.json({ success: true, user: authData.user })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

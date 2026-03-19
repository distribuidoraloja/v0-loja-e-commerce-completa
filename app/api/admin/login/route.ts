import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha obrigatorios" }, { status: 400 })
    }

    // Use SQL to verify password with pgcrypto crypt() function
    const { data, error } = await supabaseAdmin.rpc("verify_admin_password", {
      p_email: email,
      p_password: password,
    })

    if (error || !data || data.length === 0) {
      return NextResponse.json({ error: "Credenciais invalidas" }, { status: 401 })
    }

    const admin = data[0]
    const response = NextResponse.json({ 
      success: true, 
      admin: { id: admin.id, email: admin.email, name: admin.name } 
    })
    
    response.cookies.set("admin_session", admin.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })
    
    return response
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}

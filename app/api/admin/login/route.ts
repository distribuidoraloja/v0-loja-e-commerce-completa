import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha obrigatorios" }, { status: 400 })
    }

    const supabase = await createClient()

    // Buscar admin pelo email
    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .single()

    if (error || !admin) {
      return NextResponse.json({ error: "Credenciais invalidas" }, { status: 401 })
    }

    // Verificar senha com bcryptjs
    const isValid = await bcrypt.compare(password, admin.password_hash)
    if (!isValid) {
      return NextResponse.json({ error: "Credenciais invalidas" }, { status: 401 })
    }

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
    console.error("Admin login error:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}

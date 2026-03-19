import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha obrigatorios" }, { status: 400 })
    }

    const supabase = await createClient()

    // Use SQL function to verify password with pgcrypto crypt()
    const { data: admin, error } = await supabase.rpc("verify_admin_password", {
      p_email: email,
      p_password: password,
    })

    if (error || !admin || admin.length === 0) {
      return NextResponse.json({ error: "Credenciais invalidas" }, { status: 401 })
    }

    const adminUser = admin[0]
    const response = NextResponse.json({ 
      success: true, 
      admin: { id: adminUser.id, email: adminUser.email, name: adminUser.name } 
    })
    
    response.cookies.set("admin_session", adminUser.id, {
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

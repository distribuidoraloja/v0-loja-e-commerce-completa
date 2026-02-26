import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha obrigatorios" }, { status: 400 })
    }
    const supabase = await createClient()
    
    // Use pgcrypto crypt() to verify the password directly in Supabase
    const { data, error } = await supabase.rpc("verify_admin_password", {
      p_email: email,
      p_password: password,
    })

    if (error || !data || data.length === 0) {
      // Fallback: try direct query with pgcrypto comparison
      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("email", email)
        .single()

      if (adminError || !admin) {
        return NextResponse.json({ error: "Credenciais invalidas" }, { status: 401 })
      }

      // Verify using raw SQL via supabase
      const { data: verifyResult } = await supabase.rpc("check_admin_login", {
        input_email: email,
        input_password: password,
      })

      if (!verifyResult) {
        return NextResponse.json({ error: "Credenciais invalidas" }, { status: 401 })
      }

      const response = NextResponse.json({ success: true, admin: { id: admin.id, email: admin.email, name: admin.name } })
      response.cookies.set("admin_session", admin.id, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      })
      return response
    }

    const admin = data[0]
    const response = NextResponse.json({ success: true, admin: { id: admin.id, email: admin.email, name: admin.name } })
    response.cookies.set("admin_session", admin.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })
    return response
  } catch (err) {
    console.error("[v0] Admin login error:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}

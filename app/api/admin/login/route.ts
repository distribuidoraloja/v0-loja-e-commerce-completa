import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

// Default admin credentials - first login will create the admin if not exists
const DEFAULT_ADMIN_EMAIL = "consultorgabriel2026@gmail.com"
const DEFAULT_ADMIN_PASSWORD = "Progresso@2026"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha obrigatorios" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if admin exists
    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .single()

    // If no admin exists and trying to login with default credentials, create admin
    if (error && email === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD) {
      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10)
      const { data: newAdmin, error: insertError } = await supabase
        .from("admin_users")
        .insert({
          email: DEFAULT_ADMIN_EMAIL,
          password_hash: hashedPassword,
          name: "Administrador",
        })
        .select()
        .single()

      if (insertError || !newAdmin) {
        return NextResponse.json({ error: "Erro ao criar admin" }, { status: 500 })
      }

      const response = NextResponse.json({ success: true, admin: { id: newAdmin.id, email: newAdmin.email, name: newAdmin.name } })
      response.cookies.set("admin_session", newAdmin.id, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      })
      return response
    }

    if (error || !admin) {
      return NextResponse.json({ error: "Credenciais invalidas" }, { status: 401 })
    }

    // Verify password with bcrypt
    const isValid = await bcrypt.compare(password, admin.password_hash)
    if (!isValid) {
      // If password doesn't match and it's the default admin, update the hash
      if (email === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD) {
        const newHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10)
        await supabase.from("admin_users").update({ password_hash: newHash }).eq("id", admin.id)
        
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
  } catch (err) {
    console.error("Admin login error:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}

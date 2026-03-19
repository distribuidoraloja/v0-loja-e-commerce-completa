import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// Admin client to create users with autoconfirm
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: NextRequest) {
  try {
    const { name, email, cpf, phone, password } = await request.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, email e senha sao obrigatorios" }, { status: 400 })
    }

    // Create user with admin client - auto confirmed
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: { name, cpf, phone },
    })

    if (authError) {
      if (authError.message.includes("already") || authError.message.includes("exists")) {
        return NextResponse.json({ error: "Este email ja esta cadastrado" }, { status: 400 })
      }
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (authData.user) {
      // Create customer record
      await supabaseAdmin.from("customers").upsert({
        auth_user_id: authData.user.id,
        name,
        email,
        cpf: cpf || null,
        phone: phone || null,
      }, { onConflict: "email" })

      // Now sign in with server client to set session cookies
      const supabase = await createServerClient()
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        return NextResponse.json({ error: "Erro ao fazer login automatico" }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        user: signInData.user,
        session: signInData.session
      })
    }

    return NextResponse.json({ error: "Erro ao criar usuario" }, { status: 500 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro interno"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

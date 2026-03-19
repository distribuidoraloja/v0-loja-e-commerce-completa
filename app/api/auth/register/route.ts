import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { name, email, cpf, phone, password } = await request.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, email e senha sao obrigatorios" }, { status: 400 })
    }

    const supabase = await createClient()

    // Sign up without email confirmation
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, cpf, phone },
      },
    })

    if (authError) {
      if (authError.message.includes("already registered")) {
        return NextResponse.json({ error: "Este email ja esta cadastrado" }, { status: 400 })
      }
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (authData.user) {
      // Create customer record
      await supabase.from("customers").upsert({
        auth_user_id: authData.user.id,
        name,
        email,
        cpf: cpf || null,
        phone: phone || null,
      }, { onConflict: "email" })

      // Auto sign in after registration
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        // If sign in fails due to email confirmation, return success anyway
        // The user will need to confirm email
        return NextResponse.json({ 
          success: true, 
          user: authData.user,
          session: null,
          message: "Cadastro realizado. Verifique seu email se necessario."
        })
      }

      return NextResponse.json({ 
        success: true, 
        user: signInData.user,
        session: signInData.session
      })
    }

    return NextResponse.json({ success: true, user: authData.user })
  } catch (err) {
    console.error("Register error:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { signToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Faltan credenciales' }, { status: 400 })
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
    })

    if (!admin) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    if (!admin.isActive) {
      return NextResponse.json({ error: 'Cuenta desactivada. Contacte al administrador.' }, { status: 403 })
    }

    const passwordMatch = await bcrypt.compare(password, admin.password)

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    // Login successful
    const token = signToken({ id: admin.id, email: admin.email, role: admin.role })
    setAuthCookie(token)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

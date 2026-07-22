export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import bcrypt from 'bcrypt'

export async function GET(request: Request) {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const payload = verifyToken(token) as any
    if (!payload || payload.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const accountants = await prisma.admin.findMany({
      where: { role: 'ACCOUNTANT' },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        _count: { select: { clients: true } }
      }
    })

    return NextResponse.json(accountants)
  } catch (error) {
    console.error('Accountants API error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const payload = verifyToken(token) as any
    if (!payload || payload.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newAccountant = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ACCOUNTANT'
      }
    })

    return NextResponse.json({ id: newAccountant.id, email: newAccountant.email, name: newAccountant.name })
  } catch (error: any) {
    console.error('Create accountant error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

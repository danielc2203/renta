import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const payload = verifyToken(token) as any
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const clients = await prisma.client.findMany({
      orderBy: { dueDate: 'asc' },
      include: {
        _count: {
          select: { documents: true }
        }
      }
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Clients API error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const payload = verifyToken(token) as any
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const data = await request.json()
    const { name, documentNumber, dianPassword, phone, dueDate, status } = data

    if (!name || !documentNumber || !dueDate) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
    }

    const newClient = await prisma.client.create({
      data: {
        name,
        documentNumber,
        dianPassword: dianPassword || null,
        phone: phone || null,
        dueDate: new Date(dueDate),
        status: status || 'Pendiente'
      }
    })

    return NextResponse.json(newClient)
  } catch (error: any) {
    console.error('Create client error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'El documento ya está registrado' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

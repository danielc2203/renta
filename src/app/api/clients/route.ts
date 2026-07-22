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
    if (!payload || !['admin', 'ACCOUNTANT', 'SUPERADMIN'].includes(payload.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let whereClause = {}
    if (payload.role !== 'SUPERADMIN') {
      whereClause = { adminId: payload.id }
    }

    const clients = await prisma.client.findMany({
      where: whereClause,
      orderBy: { dueDate: 'asc' },
      include: {
        admin: {
          select: { name: true }
        },
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
    if (!payload || !['admin', 'ACCOUNTANT', 'SUPERADMIN'].includes(payload.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const data = await request.json()
    const { name, documentNumber, dianPassword, phone, dueDate, status, fee, paymentStatus } = data

    if (!name || !documentNumber || !dueDate) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
    }

    // Check maxClients limit
    if (payload.role !== 'SUPERADMIN') {
      const accountant = await prisma.admin.findUnique({
        where: { id: payload.id },
        select: { maxClients: true, _count: { select: { clients: true } } }
      })
      if (accountant && accountant._count.clients >= accountant.maxClients) {
        return NextResponse.json({ error: 'Has alcanzado el límite de clientes de tu plan. Contacta al Súper Administrador.' }, { status: 403 })
      }
    }

    const newClient = await prisma.client.create({
      data: {
        adminId: payload.id, // Set the client to the logged in user
        name,
        documentNumber,
        dianPassword: dianPassword || null,
        phone: phone || null,
        dueDate: new Date(dueDate),
        status: status || 'Pendiente',
        fee: fee ? parseInt(fee, 10) : null,
        paymentStatus: paymentStatus || 'Debe'
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

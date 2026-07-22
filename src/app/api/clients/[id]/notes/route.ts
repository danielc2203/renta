import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const payload = verifyToken(token) as any
    if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const client = await prisma.client.findUnique({ where: { id: params.id } })
    if (!client || (payload.role !== 'SUPERADMIN' && client.adminId !== payload.id)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const notes = await prisma.clientNote.findMany({
      where: { clientId: params.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(notes)
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const payload = verifyToken(token) as any
    if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const client = await prisma.client.findUnique({ where: { id: params.id } })
    if (!client || (payload.role !== 'SUPERADMIN' && client.adminId !== payload.id)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { content } = await request.json()
    if (!content) return NextResponse.json({ error: 'Contenido vacío' }, { status: 400 })

    const newNote = await prisma.clientNote.create({
      data: {
        clientId: params.id,
        content
      }
    })

    return NextResponse.json(newNote)
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

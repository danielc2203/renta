import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const payload = verifyToken(token) as any
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const data = await request.json()
    const { name, documentNumber, dianPassword, phone, dueDate, status } = data

    const updatedClient = await prisma.client.update({
      where: { id: params.id },
      data: {
        name,
        documentNumber,
        dianPassword: dianPassword || null,
        phone: phone || null,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status
      }
    })

    return NextResponse.json(updatedClient)
  } catch (error: any) {
    console.error('Update client error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const payload = verifyToken(token) as any
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Optionally delete related documents first if cascade isn't set
    await prisma.document.deleteMany({ where: { clientId: params.id } })

    await prisma.client.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete client error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

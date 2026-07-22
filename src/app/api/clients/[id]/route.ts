export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const payload = verifyToken(token) as any
    if (!payload || !['admin', 'ACCOUNTANT', 'SUPERADMIN'].includes(payload.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const existingClient = await prisma.client.findUnique({ where: { id: params.id } })
    if (!existingClient) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }
    if (payload.role !== 'SUPERADMIN' && existingClient.adminId !== payload.id) {
      return NextResponse.json({ error: 'No autorizado para este cliente' }, { status: 403 })
    }

    const data = await request.json()
    const { name, documentNumber, dianPassword, phone, dueDate, status, fee, paymentStatus } = data

    const updateData: any = {
      ...(name && { name }),
      ...(documentNumber && { documentNumber }),
      ...(dianPassword !== undefined && { dianPassword: dianPassword || null }),
      ...(phone !== undefined && { phone: phone || null }),
      ...(dueDate && { dueDate: dueDate ? new Date(dueDate) : undefined }),
      ...(status && { status }),
      ...(fee !== undefined && { fee: fee ? parseInt(fee, 10) : null }),
      ...(paymentStatus !== undefined && { paymentStatus: paymentStatus || 'Debe' })
    }

    const updatedClient = await prisma.client.update({
      where: { id: params.id },
      data: updateData
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
    if (!payload || !['admin', 'ACCOUNTANT', 'SUPERADMIN'].includes(payload.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const existingClient = await prisma.client.findUnique({ where: { id: params.id } })
    if (!existingClient) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }
    if (payload.role !== 'SUPERADMIN' && existingClient.adminId !== payload.id) {
      return NextResponse.json({ error: 'No autorizado para este cliente' }, { status: 403 })
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

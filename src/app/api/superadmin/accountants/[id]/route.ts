export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import bcrypt from 'bcrypt'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const payload = verifyToken(token) as any
    if (!payload || payload.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { email, password, name, isActive, subscriptionStatus, maxClients } = await request.json()

    const updateData: any = {
      ...(email && { email }),
      ...(name && { name }),
      ...(isActive !== undefined && { isActive }),
      ...(subscriptionStatus && { subscriptionStatus }),
      ...(maxClients !== undefined && { maxClients })
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const updatedAccountant = await prisma.admin.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({ id: updatedAccountant.id, email: updatedAccountant.email, name: updatedAccountant.name, isActive: updatedAccountant.isActive })
  } catch (error: any) {
    console.error('Update accountant error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const payload = verifyToken(token) as any
    if (!payload || payload.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Un Súper Admin podría desactivar en lugar de borrar. 
    // Para simplificar, lo borramos. Pero si tiene clientes, fallará si no hacemos cascade.
    // Es mejor desactivar.
    await prisma.admin.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json({ success: true, message: 'Contador desactivado' })
  } catch (error: any) {
    console.error('Delete accountant error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

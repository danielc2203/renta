export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const payload = verifyToken(token) as any
    if (!payload || payload.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const existingClient = await prisma.client.findUnique({ where: { id: params.id } })
    if (!existingClient) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    await prisma.client.update({
      where: { id: params.id },
      data: { isDeleted: false }
    })

    if (payload.id) {
      await prisma.auditLog.create({
        data: {
          adminId: payload.id,
          action: 'RESTORE_CLIENT',
          details: `Cliente restaurado: ${existingClient.name} (Doc: ${existingClient.documentNumber})`
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Restore client error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

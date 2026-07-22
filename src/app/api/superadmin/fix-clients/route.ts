export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const payload = verifyToken(token) as any
    if (!payload || payload.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const firstAccountant = await prisma.admin.findFirst({
      where: { role: 'ACCOUNTANT' }
    })

    if (!firstAccountant) {
      return NextResponse.json({ message: 'No hay contadores' })
    }

    const updateRes = await prisma.client.updateMany({
      where: { adminId: null },
      data: { adminId: firstAccountant.id }
    })

    return NextResponse.json({ message: 'Exito', count: updateRes.count, assignedTo: firstAccountant.name })
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

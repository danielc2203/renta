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

    const deletedClients = await prisma.client.findMany({
      where: { isDeleted: true },
      orderBy: { updatedAt: 'desc' },
      include: {
        admin: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json(deletedClients)
  } catch (error) {
    console.error('Deleted clients API error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

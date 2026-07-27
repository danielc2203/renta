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

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error('Audit API error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

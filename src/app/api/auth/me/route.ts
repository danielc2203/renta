export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

export async function GET() {
  const token = cookies().get('auth_token')?.value
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const payload = verifyToken(token) as any
  if (!payload || !payload.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const user = await prisma.admin.findUnique({ where: { id: payload.id } })
  if (!user || !user.isActive) {
    return NextResponse.json({ error: 'Usuario bloqueado o no existe' }, { status: 401 })
  }

  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } })
}

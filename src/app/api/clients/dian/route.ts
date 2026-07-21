import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const payload = verifyToken(token) as any
    if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { dianPassword, clientId: providedClientId } = await request.json()
    
    if (!dianPassword) {
      return NextResponse.json({ error: 'La clave no puede estar vacía' }, { status: 400 })
    }

    let clientId = payload.id
    if (payload.role === 'admin') {
      if (!providedClientId) return NextResponse.json({ error: 'clientId requerido' }, { status: 400 })
      clientId = providedClientId
    }

    await prisma.client.update({
      where: { id: clientId },
      data: { dianPassword }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('DIAN password error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

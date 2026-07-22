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
    if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    let clientId = payload.id
    if ((payload.role === 'ACCOUNTANT' || payload.role === 'SUPERADMIN')) {
      const { searchParams } = new URL(request.url)
      const requestedClientId = searchParams.get('clientId')
      if (!requestedClientId) return NextResponse.json({ error: 'clientId requerido' }, { status: 400 })
      clientId = requestedClientId
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        documents: true,
        admin: true
      }
    })

    if (!client) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })

    const uploadedDocs = client.documents.map(d => ({ type: d.type, id: d.id }))

    return NextResponse.json({
      success: true,
      clientName: client.name,
      accountantName: client.admin?.name || 'Desconocido',
      uploadedDocs,
      hasDianPassword: !!client.dianPassword
    })

  } catch (error) {
    console.error('Portal status error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

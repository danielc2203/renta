import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { cedula } = await request.json()

    if (!cedula) {
      return NextResponse.json({ error: 'Cédula requerida' }, { status: 400 })
    }

    const client = await prisma.client.findUnique({
      where: { documentNumber: cedula },
      select: { name: true, dueDate: true }
    })

    if (!client) {
      return NextResponse.json({ error: 'No se encontraron registros para esta cédula.' }, { status: 404 })
    }

    return NextResponse.json({
      name: client.name,
      dueDate: client.dueDate
    })
  } catch (error) {
    console.error('API Error (Vencimiento):', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { documentNumber } = await request.json()

    if (!documentNumber) {
      return NextResponse.json({ error: 'Falta número de documento' }, { status: 400 })
    }

    const client = await prisma.client.findUnique({
      where: { documentNumber },
    })

    if (!client) {
      // Por seguridad no confirmar si existe o no directamente
      return NextResponse.json({ success: true, message: 'Si el documento existe, se ha enviado un enlace.' })
    }

    // Generate Magic Link Token
    const magicToken = crypto.randomBytes(32).toString('hex')
    const exp = new Date(Date.now() + 15 * 60 * 1000) // 15 minutos

    await prisma.client.update({
      where: { id: client.id },
      data: {
        magicLinkToken: magicToken,
        magicLinkExp: exp,
      },
    })

    // En un sistema real aquí se enviaría por WhatsApp/SMS/Email
    // Para pruebas, lo devolvemos en la respuesta
    const magicLink = `/api/auth/verify?token=${magicToken}`
    
    // Log para el desarrollador/admin
    console.log(`[TEST ONLY] Magic link for ${client.name}: http://localhost:2244${magicLink}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Si el documento existe, se ha enviado un enlace.',
      // SOLO PARA PRUEBAS:
      _testLink: magicLink
    })

  } catch (error) {
    console.error('Client login error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

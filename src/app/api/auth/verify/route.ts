import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { signToken, setAuthCookie } from '@/lib/auth'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 400 })
  }

  try {
    const client = await prisma.client.findUnique({
      where: { magicLinkToken: token },
    })

    if (!client || !client.magicLinkExp || client.magicLinkExp < new Date()) {
      return NextResponse.json({ error: 'El enlace ha expirado o es inválido' }, { status: 401 })
    }

    // El token no se invalida para que pueda ser reusado hasta que expire (3 días)

    // Generar JWT para el cliente
    const jwtToken = signToken({ id: client.id, role: 'client' }, '2h') // Sesión más corta para clientes
    setAuthCookie(jwtToken)

    // Redirigir al portal de cliente
    return NextResponse.redirect(new URL('/portal', request.url))

  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

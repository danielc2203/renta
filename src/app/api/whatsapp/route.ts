import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const payload = verifyToken(token) as any
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { clientId } = await request.json()

    if (!clientId) {
      return NextResponse.json({ error: 'ID de cliente requerido' }, { status: 400 })
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId }
    })

    if (!client || !client.phone) {
      return NextResponse.json({ error: 'Cliente no encontrado o sin teléfono' }, { status: 404 })
    }

    // Get Admin template
    const admin = await prisma.admin.findUnique({
      where: { id: payload.id },
      select: { whatsappTemplate: true }
    })

    // Generate Magic Link (expires in 3 days)
    const magicToken = uuidv4()
    const magicExp = new Date()
    magicExp.setDate(magicExp.getDate() + 3)

    await prisma.client.update({
      where: { id: client.id },
      data: {
        magicLinkToken: magicToken,
        magicLinkExp: magicExp
      }
    })

    // Construct the link (assuming the app is hosted, we use relative or absolute based on request host)
    // For now, we assume it's running on localhost or the deployed domain, but it's better to pass the origin.
    // We'll extract origin from the request.
    const origin = request.headers.get('origin') || 'http://localhost:2244'
    const magicLinkUrl = `${origin}/api/auth/verify?token=${magicToken}`

    const dueDateStr = client.dueDate.toLocaleDateString('es-CO')
    
    let message = admin?.whatsappTemplate || `Hola {{nombre}}, te recordamos que tu fecha límite para la declaración de renta es el {{vencimiento}}. Por favor, sube tus documentos a nuestro portal seguro usando este enlace único que vence en 3 días: {{enlace}}`
    
    message = message
      .replace(/\{\{nombre\}\}/g, client.name)
      .replace(/\{\{vencimiento\}\}/g, dueDateStr)
      .replace(/\{\{enlace\}\}/g, magicLinkUrl)
    
    // Format phone: remove spaces/plus, assume Colombia (+57) if no code
    let phoneStr = client.phone.replace(/[^0-9]/g, '')
    if (phoneStr.length === 10) {
      phoneStr = '57' + phoneStr
    }

    const waLink = `https://wa.me/${phoneStr}?text=${encodeURIComponent(message)}`

    // Log para el sistema
    console.log(`[WHATSAPP RECORDATORIO] Generado para ${client.name}: ${waLink}`)

    return NextResponse.json({ success: true, waLink })

  } catch (error) {
    console.error('WhatsApp API error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
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
    if (!payload || !['admin', 'ACCOUNTANT', 'SUPERADMIN'].includes(payload.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { clientId, templateType = 'recordatorio' } = await request.json()

    if (!clientId) {
      return NextResponse.json({ error: 'ID de cliente requerido' }, { status: 400 })
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId }
    })

    if (!client || !client.phone) {
      return NextResponse.json({ error: 'Cliente no encontrado o sin teléfono' }, { status: 404 })
    }

    // Get Admin template and settings
    const admin = await prisma.admin.findUnique({
      where: { id: payload.id },
      select: { 
        whatsappTemplate: true, 
        whatsappTemplateWelcome: true, 
        whatsappTemplateReady: true,
        whatsappTemplateFiled: true,
        magicLinkExpDays: true 
      }
    })

    const expDays = admin?.magicLinkExpDays || 10

    let magicToken = client.magicLinkToken
    let magicExp = client.magicLinkExp
    
    const now = new Date()
    const oneDayFromNow = new Date()
    oneDayFromNow.setDate(now.getDate() + 1)

    // Solo generar un nuevo token si no existe o si expira en menos de 1 día
    if (!magicToken || !magicExp || magicExp < oneDayFromNow) {
      magicToken = uuidv4()
      magicExp = new Date()
      magicExp.setDate(magicExp.getDate() + expDays)

      await prisma.client.update({
        where: { id: client.id },
        data: {
          magicLinkToken: magicToken,
          magicLinkExp: magicExp
        }
      })
    }

    const baseUrl = process.env.COOLIFY_URL || process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || 'https://renta.tecco.com.co'
    const magicLinkUrl = `${baseUrl}/api/auth/verify?token=${magicToken}`
    const dueDateStr = new Date(client.dueDate).toLocaleDateString('es-CO', { timeZone: 'UTC' })
    
    let rawTemplate = ''
    let defaultTemplate = ''

    if (templateType === 'bienvenida') {
      rawTemplate = admin?.whatsappTemplateWelcome || ''
      defaultTemplate = `Hola {{nombre}}, soy tu contador. Por favor, sube tus documentos aquí: {{enlace}}`
    } else if (templateType === 'cobro') {
      rawTemplate = admin?.whatsappTemplateReady || ''
      defaultTemplate = `Hola {{nombre}}, tu declaración de renta está lista. El valor a pagar por honorarios es {{fee}}.`
    } else if (templateType === 'presentada') {
      rawTemplate = admin?.whatsappTemplateFiled || ''
      defaultTemplate = `Hola {{nombre}}, te confirmo que tu declaración de renta ha sido presentada exitosamente en la DIAN. Puedes descargar el formulario en PDF desde nuestro portal: {{enlace}}`
    } else {
      // Default: recordatorio
      rawTemplate = admin?.whatsappTemplate || ''
      rawTemplate = rawTemplate.replace(/3 d[ií]as/gi, '{{dias}} días') // legacy
      defaultTemplate = `Hola *{{nombre}}*, buen dia te recuerdo que la fecha límite para presentar tu *declaración de Renta* vence el *{{vencimiento}}*.\n\nPara evitar sanciones, por favor carga tus documentos en el siguiente enlace: {{enlace}}`
    }

    let message = rawTemplate || defaultTemplate
    
    message = message
      .replace(/\{\{nombre\}\}/g, client.name)
      .replace(/\{\{vencimiento\}\}/g, dueDateStr)
      .replace(/\{\{enlace\}\}/g, magicLinkUrl)
      .replace(/\{\{dias\}\}/g, expDays.toString())
      .replace(/\{\{fee\}\}/g, client.fee ? `$${client.fee.toLocaleString('es-CO')}` : 'pendiente')
    
    let phoneStr = client.phone.replace(/[^0-9]/g, '')
    if (phoneStr.length === 10) {
      phoneStr = '57' + phoneStr
    }

    const waLink = `https://wa.me/${phoneStr}?text=${encodeURIComponent(message)}`

    console.log(`[WHATSAPP ${templateType.toUpperCase()}] Generado para ${client.name}: ${waLink}`)

    return NextResponse.json({ success: true, waLink })

  } catch (error) {
    console.error('WhatsApp API error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

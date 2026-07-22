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

    // Get Admin template and settings
    const admin = await prisma.admin.findUnique({
      where: { id: payload.id },
      select: { whatsappTemplate: true, magicLinkExpDays: true }
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

    // Construct the link (assuming the app is hosted, we use relative or absolute based on request host)
    // For now, we assume it's running on localhost or the deployed domain, but it's better to pass the origin.
    // We'll extract origin from the request.
    const baseUrl = process.env.COOLIFY_URL || process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || 'https://renta.tecco.com.co'
    const magicLinkUrl = `${baseUrl}/api/auth/verify?token=${magicToken}`

    const dueDateStr = new Date(client.dueDate).toLocaleDateString('es-CO', { timeZone: 'UTC' })
    
    // Si la plantilla antigua está guardada en la base de datos, reemplazar "3 días" por la variable dinámica
    let savedTemplate = admin?.whatsappTemplate || ''
    savedTemplate = savedTemplate.replace(/3 d[ií]as/gi, '{{dias}} días')

    let message = savedTemplate || `Hola *{{nombre}}*, buen dia te recuerdo que la fecha límite para presentar tu *declaración de Renta* vence el *{{vencimiento}}*.
 
Para evitar sanciones e intereses, te sugiero tener todo listo *8 días antes del vencimiento*.
 
Para avanzar, por favor carga los siguientes documentos:
 
*1. Patrimonio (Bienes y Deudas).*
• *Valor de muebles y enseres; Inmuebles (Casas, Apartamentos, Fincas):* Declaración de impuesto predial del año gravable.
• *Vehículos:* Declaración de los impuestos de vehículos del año gravable.
• *Sociedades:* Certificado tributario de inversión o participación en sociedades.
• *Bancos:* Certificado tributario de saldos en cuentas de ahorro o corrientes, CDT y créditos con corte a 31 de diciembre de 2025.
 
*2. Ingresos y deducciones:*
• *Laborales o independientes:*
Certificado de ingresos y retenciones
• *Arrendamientos:* Relación de ingresos por arriendos.
• *Salud:* Certificado de medicina prepagada o plan complementario.
• *Aportes:* Certificación de seguridad social (salud y pensión) y aportes voluntarios a fondos de pensión o cuentas *AFC*.
 
*3. Información Formal y Dependientes:*
• Copia del *RUT* actualizado.
• Copia de la declaración de renta del año anterior.
• Relación de dependientes económicos (Hijos menores, padres, hermanos, etc.).
• Credenciales de acceso a la página de la *DIAN* (usuario y contraseña).
 
Esto lo puedes hacer en el siguiente enlace: {{enlace}}`
    
    message = message
      .replace(/\{\{nombre\}\}/g, client.name)
      .replace(/\{\{vencimiento\}\}/g, dueDateStr)
      .replace(/\{\{enlace\}\}/g, magicLinkUrl)
      .replace(/\{\{dias\}\}/g, expDays.toString())
    
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

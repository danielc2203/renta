export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    
    const payload = verifyToken(token) as any
    if (!payload || !['admin', 'ACCOUNTANT', 'SUPERADMIN'].includes(payload.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = await prisma.admin.findUnique({
      where: { id: payload.id },
      select: { whatsappTemplate: true, whatsappTemplateWelcome: true, whatsappTemplateReady: true, dianCalendarRules: true, alertDaysRed: true, alertDaysYellow: true, magicLinkExpDays: true }
    })

    return NextResponse.json({ 
      whatsappTemplate: (admin?.whatsappTemplate || '').replace(/3 d[ií]as/gi, '{{dias}} días'),
      whatsappTemplateWelcome: admin?.whatsappTemplateWelcome || '',
      whatsappTemplateReady: admin?.whatsappTemplateReady || '',
      dianCalendarRules: admin?.dianCalendarRules || '',
      alertDaysRed: admin?.alertDaysRed || 7,
      alertDaysYellow: admin?.alertDaysYellow || 15,
      magicLinkExpDays: admin?.magicLinkExpDays || 10
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    
    const payload = verifyToken(token) as any
    if (!payload || !['admin', 'ACCOUNTANT', 'SUPERADMIN'].includes(payload.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { whatsappTemplate, whatsappTemplateWelcome, whatsappTemplateReady, dianCalendarRules, alertDaysRed, alertDaysYellow, magicLinkExpDays } = await request.json()

    await prisma.admin.update({
      where: { id: payload.id },
      data: { 
        whatsappTemplate,
        whatsappTemplateWelcome,
        whatsappTemplateReady,
        dianCalendarRules,
        ...(alertDaysRed !== undefined && { alertDaysRed: parseInt(alertDaysRed, 10) }),
        ...(alertDaysYellow !== undefined && { alertDaysYellow: parseInt(alertDaysYellow, 10) }),
        ...(magicLinkExpDays !== undefined && { magicLinkExpDays: parseInt(magicLinkExpDays, 10) })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    
    const payload = verifyToken(token) as any
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = await prisma.admin.findUnique({
      where: { id: payload.id },
      select: { whatsappTemplate: true, dianCalendarRules: true, alertDaysRed: true, alertDaysYellow: true }
    })

    return NextResponse.json({ 
      whatsappTemplate: admin?.whatsappTemplate || '',
      dianCalendarRules: admin?.dianCalendarRules || '',
      alertDaysRed: admin?.alertDaysRed || 7,
      alertDaysYellow: admin?.alertDaysYellow || 15
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
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { whatsappTemplate, dianCalendarRules, alertDaysRed, alertDaysYellow } = await request.json()

    await prisma.admin.update({
      where: { id: payload.id },
      data: { 
        whatsappTemplate, 
        dianCalendarRules,
        ...(alertDaysRed !== undefined && { alertDaysRed: parseInt(alertDaysRed, 10) }),
        ...(alertDaysYellow !== undefined && { alertDaysYellow: parseInt(alertDaysYellow, 10) })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

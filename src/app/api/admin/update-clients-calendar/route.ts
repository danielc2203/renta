export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    
    const payload = verifyToken(token) as any
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { rules } = await request.json()
    if (!rules || typeof rules !== 'object') {
      return NextResponse.json({ error: 'Invalid rules' }, { status: 400 })
    }

    const clients = await prisma.client.findMany()

    for (const client of clients) {
      const cleanDoc = client.documentNumber.replace(/\D/g, '')
      const lastTwoStr = cleanDoc.slice(-2)
      const lastTwo = parseInt(lastTwoStr, 10)
      
      let foundDateStr = null

      for (const monthKey of ['august', 'september', 'october']) {
        const monthData = rules[monthKey]
        if (!monthData) continue
        for (const dayObj of monthData.days) {
          if (dayObj.d1 === lastTwoStr || dayObj.d2 === lastTwoStr) {
             foundDateStr = `${monthData.year}-${monthData.month}-${dayObj.day.toString().padStart(2, '0')}T12:00:00Z`
             break
          }
        }
        if (foundDateStr) break
      }

      if (foundDateStr) {
        const newDate = new Date(foundDateStr)
        
        if (!isNaN(newDate.getTime())) {
          await prisma.client.update({
            where: { id: client.id },
            data: { dueDate: newDate }
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

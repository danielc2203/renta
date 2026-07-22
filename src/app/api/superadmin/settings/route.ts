import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    let settings = await prisma.systemSettings.findFirst()
    if (!settings) {
      settings = await prisma.systemSettings.create({ data: {} })
    }
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const payload = verifyToken(token) as any
    if (!payload || payload.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const data = await request.json()
    const { appName, companyName, primaryColor, broadcastMessage } = data

    let settings = await prisma.systemSettings.findFirst()
    if (!settings) {
      settings = await prisma.systemSettings.create({ data: {} })
    }

    const updated = await prisma.systemSettings.update({
      where: { id: settings.id },
      data: {
        ...(appName !== undefined && { appName }),
        ...(companyName !== undefined && { companyName }),
        ...(primaryColor !== undefined && { primaryColor }),
        ...(broadcastMessage !== undefined && { broadcastMessage: broadcastMessage || null })
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function GET(request: Request) {
  try {
    const email = 'daniel@rentacolombia.com'
    const existing = await prisma.admin.findUnique({ where: { email } })
    
    if (existing) {
      return NextResponse.json({ message: 'El Súper Admin ya existe', email: existing.email })
    }

    const password = await bcrypt.hash('Admin2026*', 10)

    const superAdmin = await prisma.admin.create({
      data: {
        email,
        password,
        name: 'Daniel Castro',
        role: 'SUPERADMIN',
        isActive: true
      }
    })

    return NextResponse.json({ message: 'Súper Admin creado exitosamente', email: superAdmin.email })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ error: 'Error del servidor al crear súper admin' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET() {
  const token = cookies().get('auth_token')?.value
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const payload = verifyToken(token) as any
  if (!payload) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  return NextResponse.json({ user: payload })
}

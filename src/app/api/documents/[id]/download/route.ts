import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import path from 'path'
import fs from 'fs'

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads')

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) {
      return new NextResponse('No autorizado', { status: 401 })
    }

    const payload = verifyToken(token) as any
    if (!payload || payload.role !== 'admin') {
      return new NextResponse('No autorizado', { status: 401 })
    }

    const document = await prisma.document.findUnique({
      where: { id: params.id },
    })

    if (!document) {
      return new NextResponse('No encontrado', { status: 404 })
    }

    const filePath = path.join(UPLOAD_DIR, document.filePath)
    
    if (!filePath.startsWith(UPLOAD_DIR + path.sep)) {
      return new NextResponse('Ruta inválida', { status: 400 })
    }

    if (!fs.existsSync(filePath)) {
      return new NextResponse('Archivo físico no encontrado', { status: 404 })
    }

    const fileBuffer = fs.readFileSync(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Disposition': `attachment; filename="${document.fileName}"`,
        'X-Content-Type-Options': 'nosniff',
        'Content-Type': 'application/octet-stream',
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return new NextResponse('Error del servidor', { status: 500 })
  }
}

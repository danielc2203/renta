export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import path from 'path'
import fs from 'fs'
// @ts-ignore
import archiver from 'archiver'
import { Readable } from 'stream'

const UPLOAD_DIR = process.env.NODE_ENV === 'production' 
  ? '/app/data/uploads' 
  : path.resolve(process.cwd(), 'uploads')

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) return new NextResponse('No autorizado', { status: 401 })

    const payload = verifyToken(token) as any
    if (!payload || !['admin', 'ACCOUNTANT', 'SUPERADMIN'].includes(payload.role)) {
      return new NextResponse('No autorizado', { status: 401 })
    }

    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: { documents: true }
    })

    if (!client) {
      return new NextResponse('Cliente no encontrado', { status: 404 })
    }

    if (payload.role !== 'SUPERADMIN' && client.adminId !== payload.id) {
      return new NextResponse('No autorizado para este cliente', { status: 403 })
    }

    if (!client.documents || client.documents.length === 0) {
      return new NextResponse('No hay documentos para descargar', { status: 404 })
    }

    // Prepare a zip archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    })

    // Catch warnings
    archive.on('warning', function(err: any) {
      if (err.code === 'ENOENT') {
        console.warn('Archiver warning:', err)
      } else {
        throw err
      }
    })

    archive.on('error', function(err: any) {
      throw err
    })

    // Add files
    for (const doc of client.documents) {
      const filePath = path.join(UPLOAD_DIR, doc.filePath)
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: doc.fileName })
      }
    }

    // Convert archive (which is a Node.js Stream) into a Web ReadableStream
    // We can use a TransformStream or standard Web Stream
    const stream = new ReadableStream({
      start(controller) {
        archive.on('data', (chunk: any) => {
          controller.enqueue(chunk)
        })
        archive.on('end', () => {
          controller.close()
        })
        archive.on('error', (err: any) => {
          controller.error(err)
        })
        archive.finalize()
      }
    })

    // Return the stream as response
    return new NextResponse(stream as any, {
      headers: {
        'Content-Disposition': `attachment; filename="documentos_${client.documentNumber}.zip"`,
        'Content-Type': 'application/zip',
      }
    })
  } catch (error) {
    console.error('Download ZIP error:', error)
    return new NextResponse('Error del servidor', { status: 500 })
  }
}

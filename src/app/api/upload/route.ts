import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'

const UPLOAD_DIR = process.env.NODE_ENV === 'production' 
  ? '/app/data/uploads' 
  : path.resolve(process.cwd(), 'uploads')
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_EXTENSIONS = ['.pdf']
const ALLOWED_MIME_TYPES = ['application/pdf']

export async function POST(request: Request) {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const payload = verifyToken(token) as any
    if (!payload) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const documentType = formData.get('type') as string | null
    const providedClientId = formData.get('clientId') as string | null

    let clientId = payload.id
    if (payload.role === 'admin') {
      if (!providedClientId) {
        return NextResponse.json({ error: 'Falta clientId' }, { status: 400 })
      }
      clientId = providedClientId
    } else if (payload.role !== 'client') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!file || !documentType) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    // Validation: Size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'El archivo excede los 2MB permitidos' }, { status: 400 })
    }

    // Validation: Extension and Mime Type
    const originalFilename = path.basename(file.name)
    const ext = path.extname(originalFilename).toLowerCase()
    
    if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Solo se permiten archivos PDF' }, { status: 400 })
    }

    // Generate unique name
    const uniqueFilename = `${uuidv4()}${ext}`
    
    // Secure path resolution
    const filePath = path.join(UPLOAD_DIR, uniqueFilename)
    
    if (!filePath.startsWith(UPLOAD_DIR + path.sep)) {
      return NextResponse.json({ error: 'Ruta de archivo inválida' }, { status: 400 })
    }

    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true })
    }

    // Write file
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    fs.writeFileSync(filePath, buffer)

    // Delete any existing documents of the same type for this client to prevent duplicates
    await prisma.document.deleteMany({
      where: {
        clientId,
        type: documentType
      }
    })

    // Save to database
    const document = await prisma.document.create({
      data: {
        clientId,
        type: documentType,
        filePath: uniqueFilename, // Solo guardamos el nombre único, no la ruta completa
        fileName: originalFilename,
      }
    })

    return NextResponse.json({ success: true, document })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Error del servidor al subir el archivo' }, { status: 500 })
  }
}

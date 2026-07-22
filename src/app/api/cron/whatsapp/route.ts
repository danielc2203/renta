import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  // En producción, aquí verificaríamos un token de seguridad (CRON_SECRET)
  // para que solo el servidor de Coolify pueda ejecutar esta ruta.
  // const authHeader = request.headers.get('authorization')
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const clients = await prisma.client.findMany({
      where: {
        status: { in: ['Pendiente', 'En Proceso'] }
      },
      include: { admin: true }
    })

    const now = new Date()
    const messagesSent = []

    for (const client of clients) {
      if (!client.admin) continue
      
      const admin = client.admin
      const diffTime = Math.abs(client.dueDate.getTime() - now.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      let templateToUse = null

      if (diffDays <= admin.alertDaysRed && client.status === 'Pendiente') {
        templateToUse = admin.whatsappTemplate // Recordatorio urgente
      } else if (diffDays <= admin.alertDaysYellow && client.status === 'Pendiente') {
        templateToUse = admin.whatsappTemplateWelcome // Primer aviso o Bienvenida
      } else if (client.status === 'Completado' && client.paymentStatus === 'Debe') {
        templateToUse = admin.whatsappTemplateReady // Cobro
      }

      if (templateToUse && client.phone) {
        let message = templateToUse
          .replace(/{{nombre}}/g, client.name)
          .replace(/{{vencimiento}}/g, client.dueDate.toLocaleDateString())
          .replace(/{{dias}}/g, diffDays.toString())
          .replace(/{{fee}}/g, client.fee ? `$${client.fee.toLocaleString()}` : '')

        // SIMULACIÓN: Aquí se conectaría la API de Twilio, EvolutionAPI, o Meta
        // await fetch('https://api.twilio.com/...', { method: 'POST', body: message })
        
        messagesSent.push({ client: client.name, phone: client.phone, message })

        // Guardamos un log en la bitácora
        await prisma.clientNote.create({
          data: {
            clientId: client.id,
            content: `[SISTEMA AUTOMÁTICO]: Mensaje de WhatsApp enviado al cliente.\n"${message}"`
          }
        })
      }
    }

    return NextResponse.json({ success: true, processed: clients.length, messagesSent: messagesSent.length, details: messagesSent })
  } catch (error) {
    console.error('CRON WhatsApp error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

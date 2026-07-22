import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import prisma from '@/lib/prisma'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.systemSettings.findFirst()
  return {
    title: settings?.companyName ? `${settings.companyName} - Dashboard` : 'Renta Colombia - Dashboard',
    description: 'Gestor de declaraciones de renta',
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await prisma.systemSettings.findFirst()
  const primaryColor = settings?.primaryColor || '#8B5CF6'
  const broadcastMessage = settings?.broadcastMessage

  return (
    <html lang="es">
      <body className={inter.className} style={{ '--primary-color': primaryColor } as any}>
        {broadcastMessage && (
          <div style={{ background: '#F59E0B', color: 'black', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
            🔔 {broadcastMessage}
          </div>
        )}
        {children}
      </body>
    </html>
  )
}

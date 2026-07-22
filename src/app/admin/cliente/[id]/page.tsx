'use client'


import { useParams, useRouter } from 'next/navigation'
import ClientPortal from '@/components/ClientPortal'

export default function AdminClientPortalPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <button 
        className="btn"
        onClick={() => router.push('/admin')}
        style={{ marginBottom: '20px', background: 'var(--surface-color)', border: '1px solid var(--border-color)' }}
      >
        ← Volver al Dashboard
      </button>
      <ClientPortal clientId={clientId} isAdmin={true} />
    </div>
  )
}

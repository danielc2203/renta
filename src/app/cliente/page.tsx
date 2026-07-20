'use client'

import { useState } from 'react'

export default function ClientLoginPage() {
  const [documentNumber, setDocumentNumber] = useState('')
  const [message, setMessage] = useState('')
  const [testLink, setTestLink] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setTestLink('')
    
    const res = await fetch('/api/auth/client-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentNumber }),
    })
    
    const data = await res.json()
    if (res.ok) {
      setMessage(data.message)
      if (data._testLink) setTestLink(data._testLink)
    } else {
      setError(data.error || 'Error al solicitar el enlace')
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ marginBottom: '24px', textAlign: 'center' }}>Portal de Clientes</h1>
        <p style={{ marginBottom: '16px', color: 'var(--text-secondary)', textAlign: 'center' }}>
          Ingresa tu número de documento para recibir un enlace mágico de acceso.
        </p>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: '16px' }}>{error}</div>}
        {message && <div style={{ color: 'var(--success)', marginBottom: '16px' }}>{message}</div>}
        
        <form onSubmit={handleLogin}>
          <input 
            type="text" 
            placeholder="Número de Documento" 
            className="input-field"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            required
          />
          <button type="submit" className="btn" style={{ width: '100%' }}>Solicitar Acceso</button>
        </form>

        {testLink && (
          <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(37,99,235,0.2)', borderRadius: '8px' }}>
            <p style={{ marginBottom: '8px', fontSize: '14px' }}>[MODO PRUEBA] Enlace generado:</p>
            <a href={testLink} style={{ color: '#60a5fa', textDecoration: 'underline', wordBreak: 'break-all' }}>
              Clic aquí para entrar al portal
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

export default function ConsultaVencimientoPage() {
  const [cedula, setCedula] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ name: string; dueDate: string } | null>(null)
  const [error, setError] = useState('')

  const handleConsultar = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/public/vencimiento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cedula }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al consultar')
      } else {
        setResult(data)
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #1f1c2c, #928DAB)',
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        maxWidth: '450px',
        width: '100%',
        padding: '40px',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
      }}>
        <h1 style={{ color: 'white', marginBottom: '8px', fontSize: '28px', fontWeight: 'bold' }}>
          Consulta de Vencimiento
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '32px', fontSize: '14px' }}>
          Ingresa tu número de cédula o NIT para conocer la fecha máxima de tu declaración de renta del año gravable 2025.
        </p>

        <form onSubmit={handleConsultar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="text"
            placeholder="Número de Cédula o NIT"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            required
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(0,0,0,0.2)',
              color: 'white',
              fontSize: '16px',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              background: '#8B5CF6',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.3s ease',
              opacity: loading ? 0.7 : 1
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#7c3aed'}
            onMouseOut={(e) => e.currentTarget.style.background = '#8B5CF6'}
          >
            {loading ? 'Consultando...' : 'Consultar Fecha'}
          </button>
        </form>

        {error && (
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: 'rgba(239, 68, 68, 0.2)',
            borderLeft: '4px solid #EF4444',
            borderRadius: '8px',
            color: '#FCA5A5'
          }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{
            marginTop: '24px',
            padding: '24px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            color: 'white'
          }}>
            <h3 style={{ marginBottom: '8px', fontSize: '18px', color: '#6EE7B7' }}>Hola, {result.name.split(' ')[0]}</h3>
            <p style={{ fontSize: '14px', marginBottom: '16px', color: 'rgba(255,255,255,0.9)' }}>
              La fecha límite para presentar tu declaración de renta es el:
            </p>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#34D399',
              padding: '12px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '8px'
            }}>
              {new Date(result.dueDate).toLocaleDateString('es-CO', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

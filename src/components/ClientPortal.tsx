'use client'

import { useState, useEffect } from 'react'

const DOCUMENT_TYPES = [
  'Relación de patrimonio',
  'Certificados de ingresos y retenciones',
  'Certificación bancaria',
  'Relación de dependientes económicos',
  'Copia del RUT',
  'Declaración de renta año anterior',
  'Certificado de crédito hipotecario',
  'Certificación medicina prepagada/salud',
  'Relación de ingresos por arrendamientos',
  'Certificados aportes a seguridad social',
  'Certificados aportes voluntarios pensión/AFC'
]

export default function ClientPortal({ clientId, isAdmin = false }: { clientId?: string, isAdmin?: boolean }) {
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([])
  const [hasDianPassword, setHasDianPassword] = useState(false)
  const [dianPassword, setDianPassword] = useState('')
  const [clientName, setClientName] = useState('')
  const [loading, setLoading] = useState(true)
  
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const fetchStatus = async () => {
    try {
      const url = isAdmin && clientId ? `/api/portal/status?clientId=${clientId}` : '/api/portal/status'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setUploadedDocs(data.uploadedTypes || [])
        setHasDianPassword(data.hasDianPassword || false)
        setClientName(data.clientName || '')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [clientId, isAdmin])

  const handleUpload = async (file: File, type: string) => {
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setError(`El archivo para ${type} excede 2MB.`)
      setTimeout(() => setError(''), 5000)
      return
    }
    if (file.type !== 'application/pdf') {
      setError(`El archivo para ${type} debe ser PDF.`)
      setTimeout(() => setError(''), 5000)
      return
    }

    setUploading(type)
    setError('')
    setMessage('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    if (isAdmin && clientId) {
      formData.append('clientId', clientId)
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        setMessage(`"${type}" subido correctamente.`)
        setTimeout(() => setMessage(''), 5000)
        fetchStatus()
      } else {
        setError(data.error || 'Error al subir documento')
      }
    } catch (err) {
      setError('Error de red al subir documento')
    } finally {
      setUploading(null)
    }
  }

  const handleSaveDian = async () => {
    if (!dianPassword) return
    setUploading('dian')
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/clients/dian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dianPassword, clientId: isAdmin ? clientId : undefined })
      })
      if (res.ok) {
        setMessage('Clave DIAN guardada correctamente.')
        setTimeout(() => setMessage(''), 5000)
        setDianPassword('')
        fetchStatus()
      } else {
        setError('Error al guardar la clave DIAN')
      }
    } catch (err) {
      setError('Error de red')
    } finally {
      setUploading(null)
    }
  }

  if (loading) {
    return <div style={{ padding: '40px', color: 'white', textAlign: 'center' }}>Cargando portal...</div>
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '8px' }}>Mi Declaración de Renta 2026</h1>
      {clientName && <h2 style={{ marginBottom: '32px', color: 'var(--text-secondary)' }}>Cliente: {clientName} {isAdmin && '(Modo Admin)'}</h2>}

      {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}
      {message && <div style={{ color: 'var(--success)', marginBottom: '16px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>{message}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Document Cards */}
        {DOCUMENT_TYPES.map(docType => {
          const isUploaded = uploadedDocs.includes(docType)
          const isUploading = uploading === docType

          return (
            <div key={docType} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: isUploaded ? '4px solid #10B981' : '4px solid rgba(255,255,255,0.1)' }}>
              <div>
                <h3 style={{ fontSize: '15px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isUploaded ? '✅' : '📄'} {docType}
                </h3>
                {isUploaded && <p style={{ fontSize: '13px', color: '#10B981', marginBottom: '16px' }}>Documento recibido</p>}
                {!isUploaded && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Pendiente por subir (Solo PDF, Máx 2MB)</p>}
              </div>
              
              <div>
                <label className="btn" style={{ display: 'block', textAlign: 'center', cursor: isUploading ? 'not-allowed' : 'pointer', background: isUploaded ? 'var(--surface-color)' : 'var(--primary-color)', opacity: isUploading ? 0.7 : 1 }}>
                  {isUploading ? 'Subiendo...' : (isUploaded ? 'Reemplazar Archivo' : 'Subir Archivo')}
                  <input 
                    type="file" 
                    accept=".pdf,application/pdf"
                    style={{ display: 'none' }} 
                    disabled={isUploading}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleUpload(e.target.files[0], docType)
                      }
                      e.target.value = ''
                    }}
                  />
                </label>
              </div>
            </div>
          )
        })}

        {/* DIAN Card */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: hasDianPassword ? '4px solid #10B981' : '4px solid rgba(255,255,255,0.1)' }}>
          <div>
            <h3 style={{ fontSize: '15px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {hasDianPassword ? '✅' : '🔑'} Credenciales DIAN
            </h3>
            {hasDianPassword && <p style={{ fontSize: '13px', color: '#10B981', marginBottom: '16px' }}>Clave registrada</p>}
            {!hasDianPassword && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Ingresa tu clave de acceso a la DIAN</p>}
          </div>
          
          <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
            <input 
              type="text" 
              placeholder="Escribe la clave aquí..." 
              value={dianPassword}
              onChange={e => setDianPassword(e.target.value)}
              className="input-field"
              style={{ marginBottom: '8px', padding: '10px' }}
            />
            <button 
              className="btn" 
              onClick={handleSaveDian}
              disabled={uploading === 'dian' || !dianPassword}
              style={{ width: '100%', background: hasDianPassword ? 'var(--surface-color)' : 'var(--primary-color)' }}
            >
              {uploading === 'dian' ? 'Guardando...' : (hasDianPassword ? 'Actualizar Clave' : 'Guardar Clave')}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

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

export default function PortalPage() {
  const [file, setFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState(DOCUMENT_TYPES[0])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    
    setUploading(true)
    setError('')
    setMessage('')

    if (file.size > 2 * 1024 * 1024) {
      setError('El archivo excede el tamaño máximo de 2 MB.')
      setUploading(false)
      return
    }

    if (file.type !== 'application/pdf') {
      setError('Solo se permiten archivos en formato PDF.')
      setUploading(false)
      return
    }
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', documentType)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    setUploading(false)
    
    if (res.ok) {
      setMessage(`"${documentType}" subido correctamente.`)
      setFile(null)
      // reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } else {
      setError(data.error || 'Error al subir documento')
    }
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px' }}>Mi Declaración de Renta 2026</h1>
      
      <div className="glass-card" style={{ marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '16px' }}>Documentos Requeridos (Corte a 31 dic 2025)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px' }}>
          <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginLeft: '20px' }}>
            <li>Relación de patrimonio (Muebles, casa, vehículos con impuestos).</li>
            <li>Certificados de ingresos y retenciones (asalariado/independiente).</li>
            <li>Certificación bancaria de saldos (ahorros, corrientes, CDT).</li>
            <li>Relación de dependientes económicos.</li>
            <li>Copia del RUT.</li>
            <li>Copia de la declaración de renta del año anterior.</li>
          </ul>
          <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginLeft: '20px' }}>
            <li>Certificado de crédito hipotecario.</li>
            <li>Certificación de medicina prepagada o plan complementario.</li>
            <li>Relación de ingresos por arrendamientos.</li>
            <li>Certificados de aportes a seguridad social (independientes).</li>
            <li>Certificados aportes voluntarios a fondos pensión / AFC.</li>
            <li><b>Credenciales DIAN:</b> Enviar usuario y clave al contador por WhatsApp.</li>
          </ul>
        </div>
      </div>

      <div className="glass-card">
        <h2 style={{ marginBottom: '16px' }}>Subir Documento (Solo PDF, Máx 2MB)</h2>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}
        {message && <div style={{ color: 'var(--success)', marginBottom: '16px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>{message}</div>}
        
        <form onSubmit={handleUpload}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Seleccione qué documento va a subir:</label>
          <select 
            className="input-field"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            style={{ marginBottom: '16px' }}
          >
            {DOCUMENT_TYPES.map(doc => (
              <option key={doc} value={doc}>{doc}</option>
            ))}
          </select>
          
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Archivo PDF (Max 2MB):</label>
          <input 
            id="file-upload"
            type="file" 
            className="input-field"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null)
              setError('')
              setMessage('')
            }}
            accept=".pdf,application/pdf"
            required
            style={{ marginBottom: '24px' }}
          />
          
          <button type="submit" className="btn" disabled={uploading || !file}>
            {uploading ? 'Subiendo...' : 'Subir Documento Seguro'}
          </button>
        </form>
      </div>
    </div>
  )
}

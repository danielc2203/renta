'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PlantillasPage() {
  const [whatsappTemplateWelcome, setWhatsappTemplateWelcome] = useState('')
  const [whatsappTemplate, setWhatsappTemplate] = useState('')
  const [whatsappTemplateReady, setWhatsappTemplateReady] = useState('')
  const [whatsappTemplateFiled, setWhatsappTemplateFiled] = useState('')
  
  const [alertDaysRed, setAlertDaysRed] = useState(7)
  const [alertDaysYellow, setAlertDaysYellow] = useState(15)
  const [magicLinkExpDays, setMagicLinkExpDays] = useState(10)
  const [loading, setLoading] = useState(true)

  const router = useRouter()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    const res = await fetch('/api/admin/settings')
    if (res.ok) {
      const data = await res.json()
      setWhatsappTemplate(data.whatsappTemplate || '')
      setWhatsappTemplateWelcome(data.whatsappTemplateWelcome || '')
      setWhatsappTemplateReady(data.whatsappTemplateReady || '')
      setWhatsappTemplateFiled(data.whatsappTemplateFiled || '')
      setAlertDaysRed(data.alertDaysRed ?? 7)
      setAlertDaysYellow(data.alertDaysYellow ?? 15)
      setMagicLinkExpDays(data.magicLinkExpDays ?? 10)
      setLoading(false)
    } else {
      router.push('/login')
    }
  }

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        whatsappTemplate, 
        whatsappTemplateWelcome,
        whatsappTemplateReady,
        whatsappTemplateFiled,
        alertDaysRed, 
        alertDaysYellow, 
        magicLinkExpDays 
      })
    })
    setLoading(false)
    if (res.ok) {
      alert('Plantillas y ajustes guardados exitosamente')
    } else {
      alert('Error al guardar la configuración')
    }
  }

  if (loading) return <div style={{ padding: '40px', color: 'white' }}>Cargando...</div>

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1>Gestión de Plantillas y Alertas</h1>
        <button 
          onClick={() => router.push('/admin')}
          style={{ padding: '8px 16px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Volver al Dashboard
        </button>
      </div>

      <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '24px', borderRadius: '12px' }}>
        <p style={{ marginBottom: '24px', color: '#9CA3AF' }}>
          Personaliza los mensajes que se enviarán por WhatsApp. Puedes usar las siguientes variables para que el sistema las reemplace automáticamente:<br/>
          <strong>{`{{nombre}}`}</strong>, <strong>{`{{vencimiento}}`}</strong>, <strong>{`{{enlace}}`}</strong>, <strong>{`{{dias}}`}</strong>, <strong>{`{{fee}}`}</strong>
        </p>

        <form onSubmit={saveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>1. Plantilla de Bienvenida</label>
            <textarea
              value={whatsappTemplateWelcome}
              onChange={(e) => setWhatsappTemplateWelcome(e.target.value)}
              style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
              placeholder="Hola {{nombre}}, soy tu contador. Sube tus documentos aquí: {{enlace}}"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>2. Plantilla de Recordatorio</label>
            <textarea
              value={whatsappTemplate}
              onChange={(e) => setWhatsappTemplate(e.target.value)}
              style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
              placeholder="Hola {{nombre}}, tu declaración vence el {{vencimiento}}. Sube tus documentos: {{enlace}}"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>3. Plantilla de Cobro / Completado</label>
            <textarea
              value={whatsappTemplateReady}
              onChange={(e) => setWhatsappTemplateReady(e.target.value)}
              style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
              placeholder="Hola {{nombre}}, tu declaración está lista. El valor a pagar por honorarios es {{fee}}."
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>4. Plantilla de Declaración Presentada (PDF)</label>
            <textarea
              value={whatsappTemplateFiled}
              onChange={(e) => setWhatsappTemplateFiled(e.target.value)}
              style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
              placeholder="Hola {{nombre}}, tu declaración de renta ha sido presentada. Puedes descargar el PDF aquí: {{enlace}}"
            />
          </div>

          <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '16px 0' }} />

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Días para Alerta Roja</label>
              <input
                type="number"
                value={alertDaysRed}
                onChange={(e) => setAlertDaysRed(parseInt(e.target.value) || 7)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
              />
            </div>
            
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Días para Alerta Amarilla</label>
              <input
                type="number"
                value={alertDaysYellow}
                onChange={(e) => setAlertDaysYellow(parseInt(e.target.value) || 15)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
              />
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Días de validez para el Enlace</label>
              <input
                type="number"
                value={magicLinkExpDays}
                onChange={(e) => setMagicLinkExpDays(parseInt(e.target.value) || 10)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            style={{ 
              padding: '14px', 
              background: '#8B5CF6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '16px', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              marginTop: '16px'
            }}
          >
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  )
}

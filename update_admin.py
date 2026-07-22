import re

with open('src/app/admin/page.tsx', 'r') as f:
    content = f.read()

# 1. Add whatsapp modal state
content = content.replace(
    "const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)",
    "const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false)\n  const [whatsappTargetClient, setWhatsappTargetClient] = useState<any>(null)"
)

# 2. Update sendWhatsApp
old_send_wa = """  const sendWhatsApp = async (clientId: string) => {
    const res = await fetch('/api/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId }),
    })"""
new_send_wa = """  const sendWhatsApp = async (clientId: string, templateType: string) => {
    setIsWhatsappModalOpen(false)
    const res = await fetch('/api/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, templateType }),
    })"""
content = content.replace(old_send_wa, new_send_wa)

# 3. Update table row button
old_btn = """<button title="Enviar WhatsApp" className="btn" onClick={() => sendWhatsApp(row.id)} style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '4px' }}>
            <MessageCircle size={18} />
          </button>"""
new_btn = """<button title="Enviar WhatsApp" className="btn" onClick={() => { setWhatsappTargetClient(row); setIsWhatsappModalOpen(true); }} style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '4px' }}>
            <MessageCircle size={18} />
          </button>"""
content = content.replace(old_btn, new_btn)

# 4. Update top navbar button
old_nav_btn = """<button 
            className="btn" 
            onClick={() => setIsSettingsModalOpen(true)}
            style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)' }}
          >
            Configurar WApp
          </button>"""
new_nav_btn = """<button 
            className="btn" 
            onClick={() => router.push('/admin/plantillas')}
            style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)' }}
          >
            Configurar Plantillas
          </button>"""
content = content.replace(old_nav_btn, new_nav_btn)

# 5. Remove Settings modal and add WhatsApp modal
old_modal_start = "{isSettingsModalOpen && ("
old_modal_end = "      {isCalendarModalOpen && ("

wa_modal = """      {/* WhatsApp Template Selection Modal */}
      {isWhatsappModalOpen && whatsappTargetClient && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
            <h2 style={{ marginBottom: '24px', fontSize: '20px' }}>Enviar Mensaje a {whatsappTargetClient.name.split(' ')[0]}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={() => sendWhatsApp(whatsappTargetClient.id, 'bienvenida')} className="btn" style={{ background: '#3B82F6', justifyContent: 'center' }}>1. Bienvenida</button>
              <button onClick={() => sendWhatsApp(whatsappTargetClient.id, 'recordatorio')} className="btn" style={{ background: '#F59E0B', justifyContent: 'center' }}>2. Recordatorio</button>
              <button onClick={() => sendWhatsApp(whatsappTargetClient.id, 'cobro')} className="btn" style={{ background: '#EF4444', justifyContent: 'center' }}>3. Cobro / Completado</button>
              <button onClick={() => sendWhatsApp(whatsappTargetClient.id, 'presentada')} className="btn" style={{ background: '#10B981', justifyContent: 'center' }}>4. Declaración Presentada</button>
            </div>
            <button onClick={() => setIsWhatsappModalOpen(false)} className="btn" style={{ width: '100%', background: 'transparent', border: '1px solid var(--border-color)', marginTop: '24px', justifyContent: 'center' }}>Cancelar</button>
          </div>
        </div>
      )}
      
      {isCalendarModalOpen && ("""

# Replace everything from {isSettingsModalOpen to {isCalendarModalOpen
idx_start = content.find(old_modal_start)
idx_end = content.find(old_modal_end)

if idx_start != -1 and idx_end != -1:
    content = content[:idx_start] + wa_modal + content[idx_end + len(old_modal_end):]

with open('src/app/admin/page.tsx', 'w') as f:
    f.write(content)

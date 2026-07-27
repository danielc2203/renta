import re

with open('src/app/superadmin/page.tsx', 'r') as f:
    content = f.read()

# Add isProfileModalOpen state
content = content.replace("const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)",
                          "const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)\n  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)\n  const [profileData, setProfileData] = useState({ name: '', email: '', password: '' })")

# Add fetchCurrentUser handling to set ProfileData
fetch_current_str = """  const fetchCurrentUser = async () => {
    const res = await fetch('/api/auth/me')
    if (res.ok) {
      const data = await res.json()
      setCurrentUser(data.user)
    }
  }"""

fetch_current_replacement = """  const fetchCurrentUser = async () => {
    const res = await fetch('/api/auth/me')
    if (res.ok) {
      const data = await res.json()
      setCurrentUser(data.user)
      setProfileData({ name: data.user.name || '', email: data.user.email || '', password: '' })
    }
  }"""
content = content.replace(fetch_current_str, fetch_current_replacement)

# Add "Mi Perfil" button to header
header_buttons_str = """          <button 
            onClick={() => setIsSettingsModalOpen(true)}
            style={{ padding: '8px 16px', background: '#8B5CF6', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Ajustes Globales
          </button>"""
header_buttons_replacement = """          <button 
            onClick={() => setIsProfileModalOpen(true)}
            style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Mi Perfil
          </button>
          <button 
            onClick={() => setIsSettingsModalOpen(true)}
            style={{ padding: '8px 16px', background: '#8B5CF6', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Ajustes Globales
          </button>"""
content = content.replace(header_buttons_str, header_buttons_replacement)

# Remove "Volver a Clientes" button if it exists since it's obsolete now that "Ver Clientes" handles it individually
volver_btn_regex = r"<button\s+onClick=\{\(\) => router\.push\('/admin'\)\}.*?>.*?Volver a Clientes.*?</button>"
content = re.sub(volver_btn_regex, "", content, flags=re.DOTALL)

# Add "Ver Clientes" button to action row
action_buttons_str = """          <button onClick={() => { setEditData({ id: row.id, subscriptionStatus: row.subscriptionStatus, maxClients: row.maxClients, email: row.email, name: row.name }); setIsEditModalOpen(true) }} style={{ padding: '6px 12px', background: '#F59E0B', color: 'white', border: 'none', borderRadius: '4px' }}>
            Editar Plan
          </button>"""
action_buttons_replacement = """          <button onClick={() => router.push(`/admin?contadorId=${row.id}`)} style={{ padding: '6px 12px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '4px' }}>
            Ver Clientes
          </button>
          <button onClick={() => { setEditData({ id: row.id, subscriptionStatus: row.subscriptionStatus, maxClients: row.maxClients, email: row.email, name: row.name }); setIsEditModalOpen(true) }} style={{ padding: '6px 12px', background: '#F59E0B', color: 'white', border: 'none', borderRadius: '4px' }}>
            Editar Plan
          </button>"""
content = content.replace(action_buttons_str, action_buttons_replacement)

# Append Profile Modal at the end of the file before the final </div>
handle_profile_save_str = """  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return
    const res = await fetch(`/api/superadmin/accountants/${currentUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: profileData.name,
        email: profileData.email,
        ...(profileData.password && { password: profileData.password })
      })
    })
    if (res.ok) {
      setIsProfileModalOpen(false)
      fetchCurrentUser()
      alert('Perfil actualizado correctamente')
    } else {
      alert('Error al actualizar perfil')
    }
  }
"""

profile_modal_str = """      {isProfileModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e1e1e', padding: '32px', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
            <h2>Mi Perfil</h2>
            <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <label>Mi Nombre</label>
              <input type="text" required value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} style={{ padding: '12px', borderRadius: '4px', background: '#333', color: 'white', border: 'none' }} />
              
              <label>Correo Electrónico</label>
              <input type="email" required value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} style={{ padding: '12px', borderRadius: '4px', background: '#333', color: 'white', border: 'none' }} />
              
              <label>Nueva Contraseña (Opcional)</label>
              <input type="password" placeholder="Dejar en blanco para mantener" value={profileData.password} onChange={e => setProfileData({...profileData, password: e.target.value})} style={{ padding: '12px', borderRadius: '4px', background: '#333', color: 'white', border: 'none' }} />
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsProfileModalOpen(false)} style={{ padding: '8px 16px', background: '#4B5563', color: 'white', border: 'none', borderRadius: '4px' }}>Cancelar</button>
                <button type="submit" style={{ padding: '8px 16px', background: '#10B981', color: 'white', border: 'none', borderRadius: '4px' }}>Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
"""

# Insert handleProfileSave before return (
insert_idx = content.find("  return (")
content = content[:insert_idx] + handle_profile_save_str + content[insert_idx:]

# Insert profile_modal_str before the last closing </div>
last_div_idx = content.rfind("    </div>\n  )")
if last_div_idx != -1:
    content = content[:last_div_idx] + profile_modal_str + content[last_div_idx:]

with open('src/app/superadmin/page.tsx', 'w') as f:
    f.write(content)


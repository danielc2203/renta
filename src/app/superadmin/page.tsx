'use client'


import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DataTable from 'react-data-table-component'

export default function SuperAdminDashboard() {
  const [accountants, setAccountants] = useState<any[]>([])
  const [settings, setSettings] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [editData, setEditData] = useState({ id: '', subscriptionStatus: 'ACTIVE', maxClients: 50, email: '', name: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()

  const fetchAccountants = async () => {
    const res = await fetch('/api/superadmin/accountants')
    if (res.ok) {
      setAccountants(await res.json())
    } else {
      router.push('/login')
    }
    setLoading(false)
  }

  const fetchSettings = async () => {
    const res = await fetch('/api/superadmin/settings')
    if (res.ok) {
      setSettings(await res.json())
    }
  }

  const fetchCurrentUser = async () => {
    const res = await fetch('/api/auth/me')
    if (res.ok) {
      const data = await res.json()
      setCurrentUser(data.user)
    }
  }

  useEffect(() => {
    fetchAccountants()
    fetchSettings()
    fetchCurrentUser()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/superadmin/accountants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    if (res.ok) {
      setIsModalOpen(false)
      fetchAccountants()
      setFormData({ name: '', email: '', password: '' })
    } else {
      alert('Error al crear contador')
    }
  }

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch(`/api/superadmin/accountants/${editData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        subscriptionStatus: editData.subscriptionStatus, 
        maxClients: parseInt(editData.maxClients.toString()),
        email: editData.email,
        name: editData.name
      })
    })
    if (res.ok) {
      setIsEditModalOpen(false)
      fetchAccountants()
    } else {
      alert('Error al actualizar contador')
    }
  }

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/superadmin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    })
    if (res.ok) {
      setIsSettingsModalOpen(false)
      alert('Ajustes guardados. Recarga la página para ver los cambios.')
    } else {
      alert('Error al guardar ajustes')
    }
  }

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    if (!confirm(`¿Estás seguro de ${currentStatus ? 'desactivar' : 'activar'} este contador?`)) return
    const res = await fetch(`/api/superadmin/accountants/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !currentStatus })
    })
    if (res.ok) fetchAccountants()
  }

  const columns = [
    { name: 'Nombre', selector: (row: any) => row.name, sortable: true },
    { name: 'Email', selector: (row: any) => row.email, sortable: true },
    { name: 'Clientes', selector: (row: any) => `${row._count.clients} / ${row.maxClients}`, sortable: true },
    { name: 'Estado Login', selector: (row: any) => row.isActive ? 'Activo' : 'Bloqueado', sortable: true },
    { name: 'Suscripción', selector: (row: any) => row.subscriptionStatus, sortable: true },
    {
      name: 'Acciones',
      cell: (row: any) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => toggleStatus(row.id, row.isActive)} style={{ padding: '6px 12px', background: row.isActive ? '#EF4444' : '#10B981', color: 'white', border: 'none', borderRadius: '4px' }}>
            {row.isActive ? 'Desactivar' : 'Activar'}
          </button>
          <button onClick={() => { setEditData({ id: row.id, subscriptionStatus: row.subscriptionStatus, maxClients: row.maxClients, email: row.email, name: row.name }); setIsEditModalOpen(true) }} style={{ padding: '6px 12px', background: '#F59E0B', color: 'white', border: 'none', borderRadius: '4px' }}>
            Editar Plan
          </button>
        </div>
      )
    }
  ]

  if (loading) return <div style={{ padding: '40px', color: 'white' }}>Cargando...</div>

  const totalClients = accountants.reduce((acc, curr) => acc + curr._count.clients, 0)
  const totalAccountants = accountants.length

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1>Panel Súper Administrador</h1>
          {currentUser && (
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
              Hola, {(currentUser.name || 'Admin').split(' ')[0]} 👋
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            onClick={() => router.push('/admin')}
            style={{ padding: '8px 16px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Volver a Clientes
          </button>
          <button 
            onClick={() => setIsSettingsModalOpen(true)}
            style={{ padding: '8px 16px', background: '#8B5CF6', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Ajustes Globales
          </button>
          <button 
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' })
              router.push('/login')
            }}
            style={{ padding: '8px 16px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Total Contadores</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0' }}>{totalAccountants}</p>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Total Clientes</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0' }}>{totalClients}</p>
        </div>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.5)', padding: '24px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
          <h2>Contadores Registrados</h2>
          <div style={{ display: 'flex', gap: '16px' }}>
            <input 
              type="text" 
              placeholder="Buscar por nombre o email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
            />
            <button onClick={() => setIsModalOpen(true)} style={{ padding: '8px 16px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '4px' }}>
              + Nuevo Contador
            </button>
          </div>
        </div>
        
        <DataTable 
          columns={columns} 
          data={accountants.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.email.toLowerCase().includes(searchTerm.toLowerCase()))} 
          theme="dark" 
          pagination 
        />
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e1e1e', padding: '32px', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
            <h2>Nuevo Contador</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <input required placeholder="Nombre" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '12px', borderRadius: '4px', background: '#333', color: 'white', border: 'none' }} />
              <input required type="email" placeholder="Correo electrónico" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: '12px', borderRadius: '4px', background: '#333', color: 'white', border: 'none' }} />
              <input required type="password" placeholder="Contraseña" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ padding: '12px', borderRadius: '4px', background: '#333', color: 'white', border: 'none' }} />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: '#4B5563', color: 'white', border: 'none', borderRadius: '4px' }}>Cancelar</button>
                <button type="submit" style={{ padding: '8px 16px', background: '#10B981', color: 'white', border: 'none', borderRadius: '4px' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e1e1e', padding: '32px', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
            <h2>Editar Plan de Contador</h2>
            <form onSubmit={handleEditSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <label>Nombre del Contador</label>
              <input type="text" required value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} style={{ padding: '12px', borderRadius: '4px', background: '#333', color: 'white', border: 'none' }} />
              
              <label>Correo Electrónico</label>
              <input type="email" required value={editData.email || ''} onChange={e => setEditData({...editData, email: e.target.value})} style={{ padding: '12px', borderRadius: '4px', background: '#333', color: 'white', border: 'none' }} />
              
              <label>Estado de Suscripción</label>
              <select value={editData.subscriptionStatus} onChange={e => setEditData({...editData, subscriptionStatus: e.target.value})} style={{ padding: '12px', borderRadius: '4px', background: '#333', color: 'white', border: 'none' }}>
                <option value="ACTIVE">Activo</option>
                <option value="PAST_DUE">En Mora</option>
                <option value="INACTIVE">Inactivo</option>
              </select>
              <label>Límite de Clientes</label>
              <input type="number" required value={editData.maxClients} onChange={e => setEditData({...editData, maxClients: parseInt(e.target.value)})} style={{ padding: '12px', borderRadius: '4px', background: '#333', color: 'white', border: 'none' }} />
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ padding: '8px 16px', background: '#4B5563', color: 'white', border: 'none', borderRadius: '4px' }}>Cancelar</button>
                <button type="submit" style={{ padding: '8px 16px', background: '#10B981', color: 'white', border: 'none', borderRadius: '4px' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSettingsModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e1e1e', padding: '32px', borderRadius: '8px', width: '100%', maxWidth: '500px' }}>
            <h2>Ajustes Globales (Marca Blanca)</h2>
            <form onSubmit={handleSettingsSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <label>Nombre de la Empresa (Marca)</label>
              <input required value={settings.companyName || ''} onChange={e => setSettings({...settings, companyName: e.target.value})} style={{ padding: '12px', borderRadius: '4px', background: '#333', color: 'white', border: 'none' }} />
              
              <label>Color Primario (Hexadecimal)</label>
              <input type="color" value={settings.primaryColor || '#8B5CF6'} onChange={e => setSettings({...settings, primaryColor: e.target.value})} style={{ width: '100%', height: '40px', padding: '0', borderRadius: '4px', border: 'none' }} />
              
              <label>Mensaje de Difusión (Banner Global)</label>
              <textarea placeholder="Ej: Mantenimiento programado hoy a las 10 PM" value={settings.broadcastMessage || ''} onChange={e => setSettings({...settings, broadcastMessage: e.target.value})} style={{ padding: '12px', borderRadius: '4px', background: '#333', color: 'white', border: 'none', minHeight: '80px' }} />
              <small style={{ color: '#9CA3AF' }}>Deja en blanco para no mostrar banner.</small>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsSettingsModalOpen(false)} style={{ padding: '8px 16px', background: '#4B5563', color: 'white', border: 'none', borderRadius: '4px' }}>Cerrar</button>
                <button type="submit" style={{ padding: '8px 16px', background: '#10B981', color: 'white', border: 'none', borderRadius: '4px' }}>Guardar Ajustes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

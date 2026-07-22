'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DataTable from 'react-data-table-component'

export default function SuperAdminDashboard() {
  const [accountants, setAccountants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
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

  useEffect(() => {
    fetchAccountants()
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
    { name: 'Clientes', selector: (row: any) => row._count.clients, sortable: true },
    { name: 'Estado', selector: (row: any) => row.isActive ? 'Activo' : 'Inactivo', sortable: true },
    {
      name: 'Acciones',
      cell: (row: any) => (
        <button onClick={() => toggleStatus(row.id, row.isActive)} style={{ padding: '6px 12px', background: row.isActive ? '#EF4444' : '#10B981', color: 'white', border: 'none', borderRadius: '4px' }}>
          {row.isActive ? 'Desactivar' : 'Activar'}
        </button>
      )
    }
  ]

  if (loading) return <div style={{ padding: '40px', color: 'white' }}>Cargando...</div>

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1>Panel Súper Administrador</h1>
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

      <div style={{ background: 'rgba(0,0,0,0.5)', padding: '24px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2>Contadores Registrados</h2>
          <button onClick={() => setIsModalOpen(true)} style={{ padding: '8px 16px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '4px' }}>
            + Nuevo Contador
          </button>
        </div>
        
        <DataTable columns={columns} data={accountants} theme="dark" pagination />
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e1e1e', padding: '32px', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
            <h2>Nuevo Contador</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <input required placeholder="Nombre" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '12px', borderRadius: '4px' }} />
              <input required type="email" placeholder="Correo electrónico" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: '12px', borderRadius: '4px' }} />
              <input required type="password" placeholder="Contraseña" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ padding: '12px', borderRadius: '4px' }} />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: '#4B5563', color: 'white', border: 'none', borderRadius: '4px' }}>Cancelar</button>
                <button type="submit" style={{ padding: '8px 16px', background: '#10B981', color: 'white', border: 'none', borderRadius: '4px' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

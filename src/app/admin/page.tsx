'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import DataTable, { createTheme } from 'react-data-table-component'

createTheme('dark', {
  text: {
    primary: '#ffffff',
    secondary: '#a0a0a0',
  },
  background: {
    default: 'transparent',
  },
  context: {
    background: 'rgba(0,0,0,0.5)',
    text: '#FFFFFF',
  },
  divider: {
    default: 'rgba(255, 255, 255, 0.1)',
  },
  button: {
    default: '#ffffff',
    hover: 'rgba(255,255,255,0.2)',
    focus: 'rgba(255,255,255,0.3)',
    focusLight: 'rgba(255,255,255,0.1)',
  },
})

const customStyles = {
  headRow: {
    style: {
      backgroundColor: 'rgba(0,0,0,0.2)',
      borderBottomColor: 'rgba(255,255,255,0.1)',
    },
  },
  rows: {
    style: {
      backgroundColor: 'transparent',
      borderBottomColor: 'rgba(255,255,255,0.05)',
      '&:not(:last-of-type)': {
        borderBottomColor: 'rgba(255,255,255,0.05)',
      },
      '&:hover': {
        backgroundColor: 'rgba(255,255,255,0.02)',
      },
    },
  },
  pagination: {
    style: {
      backgroundColor: 'transparent',
      color: '#fff',
      borderTopColor: 'rgba(255,255,255,0.1)',
    },
    pageButtonsStyle: {
      color: '#fff',
      fill: '#fff',
    }
  }
}

export default function AdminDashboard() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<any>(null)
  const [filterText, setFilterText] = useState('')
  const [trafficFilter, setTrafficFilter] = useState<string | null>(null)
  
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [whatsappTemplate, setWhatsappTemplate] = useState('')
  const [alertDaysRed, setAlertDaysRed] = useState(7)
  const [alertDaysYellow, setAlertDaysYellow] = useState(15)
  const [dianCalendarRules, setDianCalendarRules] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)
  
  const buildDefaultConfig = () => {
    const config: any = {
      august: { year: '2026', month: '08', days: [] },
      september: { year: '2026', month: '09', days: [] },
      october: { year: '2026', month: '10', days: [] }
    };
    
    let digit = 1;
    [12, 13, 14, 18, 19, 20, 21, 24, 25, 26, 27, 28, 31].forEach(d => {
      config.august.days.push({ day: d, d1: digit.toString().padStart(2, '0'), d2: (digit+1).toString().padStart(2, '0') });
      digit += 2;
    });
    
    [1, 2, 3, 4, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 21, 22, 23, 24, 25, 28].forEach(d => {
      config.september.days.push({ day: d, d1: digit.toString().padStart(2, '0'), d2: (digit+1).toString().padStart(2, '0') });
      digit += 2;
    });
    
    [1, 2, 5, 6, 7, 8, 9, 13, 14, 15, 16, 19, 20, 21, 22, 23, 26].forEach(d => {
      config.october.days.push({ day: d, d1: digit.toString().padStart(2, '0'), d2: (digit+1 === 100 ? '00' : (digit+1).toString().padStart(2, '0')) });
      digit += 2;
    });
    return config;
  }
  
  const [calendarData, setCalendarData] = useState<any>(buildDefaultConfig())
  
  const [formData, setFormData] = useState({
    name: '',
    documentNumber: '',
    dianPassword: '',
    phone: '',
    dueDate: '',
    status: 'Pendiente'
  })

  const router = useRouter()

  const calculateDueDate = (docNumber: string) => {
    const cleanDoc = docNumber.replace(/\D/g, '')
    if (cleanDoc.length < 2) return ''
    const lastTwoStr = cleanDoc.slice(-2)
    
    let rules = buildDefaultConfig()
    if (dianCalendarRules) {
      try {
        rules = JSON.parse(dianCalendarRules)
      } catch (e) {
        console.error('Error parsing calendar rules')
      }
    }

    for (const monthKey of ['august', 'september', 'october']) {
      const monthData = rules[monthKey]
      if (!monthData) continue
      for (const dayObj of monthData.days) {
        if (dayObj.d1 === lastTwoStr || dayObj.d2 === lastTwoStr) {
           return `${monthData.year}-${monthData.month}-${dayObj.day.toString().padStart(2, '0')}`
        }
      }
    }

    return ''
  }

  const getTrafficLight = (client: any) => {
    if (client.status === 'Completado') return { color: '#10B981', code: 'VERDE', text: 'Completado' }
    if (!client.dueDate) return { color: '#6B7280', code: 'GRIS', text: 'Sin fecha' }
    
    const due = new Date(client.dueDate)
    const now = new Date()
    // Normalize to midnight for accurate day diff
    due.setHours(0,0,0,0)
    now.setHours(0,0,0,0)
    
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays <= alertDaysRed) return { color: '#EF4444', code: 'ROJO', text: 'Vence en ' + diffDays + ' días' }
    if (diffDays <= alertDaysYellow) return { color: '#F59E0B', code: 'AMARILLO', text: 'Vence en ' + diffDays + ' días' }
    return { color: '#10B981', code: 'VERDE', text: 'A tiempo' }
  }

  const fetchClients = async () => {
    const res = await fetch('/api/clients')
    if (res.ok) {
      setClients(await res.json())
    } else if (res.status === 401) {
      router.push('/login')
    }
    setLoading(false)
  }

  const fetchSettings = async () => {
    const res = await fetch('/api/admin/settings')
    if (res.ok) {
      const data = await res.json()
      setWhatsappTemplate(data.whatsappTemplate || '')
      setDianCalendarRules(data.dianCalendarRules || '')
      setAlertDaysRed(data.alertDaysRed ?? 7)
      setAlertDaysYellow(data.alertDaysYellow ?? 15)
    }
  }

  useEffect(() => {
    fetchClients()
    fetchSettings()
  }, [])

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ whatsappTemplate, dianCalendarRules, alertDaysRed, alertDaysYellow })
    })
    if (res.ok) {
      setIsSettingsModalOpen(false)
      alert('Plantilla guardada exitosamente')
    } else {
      alert('Error al guardar la configuración')
    }
  }

  const saveCalendar = async () => {
    const rulesString = JSON.stringify(calendarData)
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ whatsappTemplate, dianCalendarRules: rulesString, alertDaysRed, alertDaysYellow })
    })
    if (res.ok) {
      setDianCalendarRules(rulesString)
      setIsCalendarModalOpen(false)
      
      // Update all existing clients in the DB
      await fetch('/api/admin/update-clients-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: calendarData })
      })
      
      fetchClients() // Refresh the local state to show new dates
      alert('Calendario actualizado exitosamente y las fechas de los clientes han sido recalculadas.')
    } else {
      alert('Error al guardar el calendario')
    }
  }

  const openCalendarModal = () => {
    let initialData = buildDefaultConfig()
    try {
      if (dianCalendarRules) {
        const parsed = JSON.parse(dianCalendarRules)
        if (parsed.august && parsed.august.days && Array.isArray(parsed.august.days)) {
          if (typeof parsed.august.days[0] === 'string' || typeof parsed.august.days[0] === 'number') {
            // The DB contains an array of primitives, which is an invalid old format.
            // Just use the buildDefaultConfig() (which is already in initialData) to restore the default numbers.
            initialData.august.year = parsed.august.year || '2026'
            initialData.september.year = parsed.september.year || '2026'
            initialData.october.year = parsed.october.year || '2026'
          } else if (parsed.august.days.length > 20) {
            // It's the old 31-day object format, extract only the days we care about
            const extractDays = (month: string) => {
              return initialData[month].days.map((d: any) => {
                 const oldDayObj = parsed[month].days[d.day - 1]
                 if (!oldDayObj) return d
                 return { ...d, d1: oldDayObj.d1 || d.d1, d2: oldDayObj.d2 || d.d2 }
              })
            }
            initialData.august.days = extractDays('august')
            initialData.september.days = extractDays('september')
            initialData.october.days = extractDays('october')
            initialData.august.year = parsed.august.year || '2026'
            initialData.september.year = parsed.september.year || '2026'
            initialData.october.year = parsed.october.year || '2026'
          } else {
            // It's already the correct object format
            initialData = parsed
          }
        }
      }
    } catch(e) {}
    
    setCalendarData(initialData)
    setIsCalendarModalOpen(true)
  }

  const renderCalendarTable = (monthKey: 'august' | 'september' | 'october', title: string) => {
    const data = calendarData[monthKey]
    
    return (
      <div style={{ marginBottom: '32px', overflowX: 'auto', background: 'white', borderRadius: '8px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, color: 'black' }}>Fecha vencimientos {title}</h3>
          <input 
            type="number" 
            value={data.year}
            onChange={e => setCalendarData({...calendarData, [monthKey]: {...data, year: e.target.value}})}
            style={{ width: '80px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', color: 'black' }}
          />
        </div>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '800px', fontSize: '12px', background: 'white', color: 'black' }}>
          <tbody>
            <tr>
              <td style={{ background: '#87CEEB', padding: '8px', fontWeight: 'bold', border: '1px solid black', width: '100px' }}>Día</td>
              {data.days.map((dayObj: any, idx: number) => (
                <td key={idx} style={{ background: '#87CEEB', padding: '4px', border: '1px solid black', textAlign: 'center', width: '30px', color: 'black' }}>
                  {dayObj.day || (idx + 1)}
                </td>
              ))}
            </tr>
            <tr>
              <td rowSpan={2} style={{ padding: '8px', fontWeight: 'bold', border: '1px solid black', verticalAlign: 'middle' }}>Últimos dígitos del NIT</td>
              {data.days.map((dayObj: any, idx: number) => (
                <td key={`d1-${idx}`} style={{ padding: '2px', border: '1px solid black', textAlign: 'center' }}>
                  <input 
                    type="text" 
                    value={dayObj.d1}
                    onChange={e => {
                      const newDays = [...data.days]
                      newDays[idx] = { ...newDays[idx], d1: e.target.value }
                      setCalendarData({...calendarData, [monthKey]: {...data, days: newDays}})
                    }}
                    style={{ width: '100%', textAlign: 'center', border: 'none', background: 'transparent', padding: 0, color: 'black' }}
                  />
                </td>
              ))}
            </tr>
            <tr>
              {data.days.map((dayObj: any, idx: number) => (
                <td key={`d2-${idx}`} style={{ padding: '2px', border: '1px solid black', textAlign: 'center' }}>
                  <input 
                    type="text" 
                    value={dayObj.d2}
                    onChange={e => {
                      const newDays = [...data.days]
                      newDays[idx] = { ...newDays[idx], d2: e.target.value }
                      setCalendarData({...calendarData, [monthKey]: {...data, days: newDays}})
                    }}
                    style={{ width: '100%', textAlign: 'center', border: 'none', background: 'transparent', padding: 0, color: 'black' }}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  const sendWhatsApp = async (clientId: string) => {
    const res = await fetch('/api/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId }),
    })
    const data = await res.json()
    if (data.waLink) {
      window.open(data.waLink, '_blank')
    } else {
      alert(data.error || 'Error generando link')
    }
  }

  const openModal = (client: any = null) => {
    if (client) {
      setEditingClient(client)
      setFormData({
        name: client.name,
        documentNumber: client.documentNumber,
        dianPassword: client.dianPassword || '',
        phone: client.phone || '',
        dueDate: new Date(client.dueDate).toISOString().split('T')[0],
        status: client.status
      })
    } else {
      setEditingClient(null)
      setFormData({
        name: '',
        documentNumber: '',
        dianPassword: '',
        phone: '',
        dueDate: '',
        status: 'Pendiente'
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingClient(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editingClient ? 'PUT' : 'POST'
    const url = editingClient ? `/api/clients/${editingClient.id}` : '/api/clients'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    if (res.ok) {
      closeModal()
      fetchClients()
    } else {
      const data = await res.json()
      alert(data.error || 'Error al guardar cliente')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return
    const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    if (res.ok) {
      fetchClients()
    } else {
      alert('Error al eliminar cliente')
    }
  }

  const columns = [
    {
      name: 'Alerta',
      width: '90px',
      selector: (row: any) => getTrafficLight(row).code,
      sortable: true,
      cell: (row: any) => {
        const traffic = getTrafficLight(row)
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: traffic.color, boxShadow: `0 0 8px ${traffic.color}88` }} />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{traffic.text}</span>
          </div>
        )
      }
    },
    {
      name: 'Nombre',
      selector: (row: any) => row.name,
      sortable: true,
      wrap: true
    },
    {
      name: 'Documento',
      selector: (row: any) => row.documentNumber,
      sortable: true,
    },
    {
      name: 'Clave DIAN',
      selector: (row: any) => row.dianPassword || '-',
      sortable: false,
    },
    {
      name: 'Vencimiento',
      selector: (row: any) => row.dueDate,
      sortable: true,
      format: (row: any) => new Date(row.dueDate).toLocaleDateString('es-CO')
    },
    {
      name: 'Estado',
      selector: (row: any) => row.status,
      sortable: true,
      cell: (row: any) => (
        <span style={{ 
          padding: '4px 8px', 
          borderRadius: '4px', 
          fontSize: '12px',
          background: row.status === 'Completado' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
          color: row.status === 'Completado' ? 'var(--success)' : 'var(--danger)'
        }}>
          {row.status}
        </span>
      )
    },
    {
      name: 'Acciones',
      button: true,
      width: '320px',
      cell: (row: any) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn" onClick={() => sendWhatsApp(row.id)} style={{ padding: '6px 10px', fontSize: '12px', background: '#25D366', color: '#fff', border: 'none', fontWeight: 'bold' }}>
            WApp
          </button>
          <button className="btn" onClick={() => router.push(`/admin/cliente/${row.id}`)} style={{ padding: '6px 10px', fontSize: '12px', background: 'var(--primary-color)', color: '#fff', border: 'none' }}>
            Ver Portal
          </button>
          <button className="btn" onClick={() => openModal(row)} style={{ padding: '6px 10px', fontSize: '12px', background: 'var(--surface-color)', border: '1px solid var(--border-color)' }}>
            Editar
          </button>
          <button className="btn" onClick={() => handleDelete(row.id)} style={{ padding: '6px 10px', fontSize: '12px', background: 'rgba(239,68,68,0.2)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.4)' }}>
            Eliminar
          </button>
        </div>
      )
    },
  ]

  const filteredItems = clients.filter(item => {
    const matchesText = item.name.toLowerCase().includes(filterText.toLowerCase()) || 
                        item.documentNumber.toLowerCase().includes(filterText.toLowerCase());
    const traffic = getTrafficLight(item)
    const matchesTraffic = trafficFilter ? traffic.code === trafficFilter : true;
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    
    return matchesText && matchesTraffic && matchesStatus;
  })

  const urgentCount = clients.filter(c => getTrafficLight(c).code === 'ROJO').length
  const warningCount = clients.filter(c => getTrafficLight(c).code === 'AMARILLO').length
  const completedCount = clients.filter(c => getTrafficLight(c).code === 'VERDE' && c.status === 'Completado').length

  const subHeaderComponentMemo = useMemo(() => {
    return (
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar nombre o cédula/NIT..."
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white',
          }}
        />
        <select 
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white',
          }}
        >
          <option value="">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En Proceso">En Proceso</option>
          <option value="Completado">Completado</option>
        </select>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(trafficFilter || statusFilter || filterText) && (
            <button className="btn" onClick={() => { setTrafficFilter(null); setStatusFilter(''); setFilterText(''); }} style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--surface-color)' }}>
              Limpiar Filtros
            </button>
          )}
        </div>
      </div>
    )
  }, [filterText, trafficFilter, statusFilter])

  if (loading) return <div style={{ padding: '40px', color: 'white' }}>Cargando dashboard...</div>

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1>Dashboard del Contador</h1>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            className="btn" 
            onClick={openCalendarModal}
            style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)' }}
          >
            Calendario DIAN
          </button>
          <button 
            className="btn" 
            onClick={() => setIsSettingsModalOpen(true)}
            style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)' }}
          >
            Configurar WApp
          </button>
          <button 
            className="btn" 
            onClick={() => {
              document.cookie = 'auth_token=; Max-Age=0; path=/;'
              router.push('/login')
            }}
            style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)' }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div 
          className="glass-card" 
          style={{ padding: '24px', borderLeft: '4px solid #EF4444', cursor: 'pointer', transition: 'all 0.2s', opacity: trafficFilter && trafficFilter !== 'ROJO' ? 0.5 : 1 }}
          onClick={() => setTrafficFilter('ROJO')}
        >
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Urgentes / Vencidos</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#EF4444' }}>{urgentCount}</div>
        </div>
        <div 
          className="glass-card" 
          style={{ padding: '24px', borderLeft: '4px solid #F59E0B', cursor: 'pointer', transition: 'all 0.2s', opacity: trafficFilter && trafficFilter !== 'AMARILLO' ? 0.5 : 1 }}
          onClick={() => setTrafficFilter('AMARILLO')}
        >
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Próximos a Vencer</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#F59E0B' }}>{warningCount}</div>
        </div>
        <div 
          className="glass-card" 
          style={{ padding: '24px', borderLeft: '4px solid #10B981', cursor: 'pointer', transition: 'all 0.2s', opacity: trafficFilter && trafficFilter !== 'VERDE' ? 0.5 : 1 }}
          onClick={() => setTrafficFilter('VERDE')}
        >
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Completados</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10B981' }}>{completedCount}</div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
          <h2>Tus Clientes</h2>
          <button className="btn" onClick={() => openModal()} style={{ background: 'var(--primary-color)' }}>
            + Agregar Cliente
          </button>
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          {subHeaderComponentMemo}
        </div>
        
        <DataTable
          columns={columns}
          data={filteredItems}
          theme="dark"
          customStyles={customStyles}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 20, 50]}
          noDataComponent={<p style={{ padding: '24px', color: 'var(--text-secondary)' }}>No se encontraron clientes.</p>}
        />
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '24px' }}>{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Nombre</label>
                <input 
                  required
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'white' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Cédula / NIT</label>
                <input 
                  required
                  type="text" 
                  value={formData.documentNumber} 
                  onChange={e => {
                    const value = e.target.value
                    const newDueDate = calculateDueDate(value)
                    setFormData(prev => ({
                      ...prev, 
                      documentNumber: value,
                      dueDate: newDueDate || prev.dueDate
                    }))
                  }}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'white' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Clave DIAN</label>
                <input 
                  type="text" 
                  value={formData.dianPassword} 
                  onChange={e => setFormData({...formData, dianPassword: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'white' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Teléfono</label>
                <input 
                  type="text" 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'white' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Fecha de Vencimiento</label>
                <input 
                  required
                  type="date" 
                  value={formData.dueDate} 
                  onChange={e => setFormData({...formData, dueDate: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'white', colorScheme: 'dark' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Estado</label>
                <select 
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'white' }}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Completado">Completado</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                <button type="button" onClick={closeModal} className="btn" style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn" style={{ flex: 1 }}>
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isSettingsModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '16px' }}>Configuración de Mensajes</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px', lineHeight: '1.5' }}>
              Personaliza el mensaje que se enviará por WhatsApp.
            </p>
            <form onSubmit={saveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  Plantilla de Mensaje de WhatsApp
                </label>
                <textarea 
                  rows={4}
                  value={whatsappTemplate} 
                  onChange={e => setWhatsappTemplate(e.target.value)}
                  placeholder="Hola {{nombre}}, tu declaración vence el {{vencimiento}}..."
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'white', resize: 'vertical', marginBottom: '16px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Días para Alerta Roja
                  </label>
                  <input 
                    type="number"
                    value={alertDaysRed}
                    onChange={e => setAlertDaysRed(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'white' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Días para Alerta Amarilla
                  </label>
                  <input 
                    type="number"
                    value={alertDaysYellow}
                    onChange={e => setAlertDaysYellow(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'white' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsSettingsModalOpen(false)} className="btn" style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn" style={{ flex: 1, background: 'var(--primary-color)' }}>
                  Guardar Plantilla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isCalendarModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '1100px', padding: '32px', maxHeight: '95vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '8px' }}>Tableros DIAN</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
              Escribe los dígitos (ej: "01" o "99") en los días que correspondan. Deja en blanco los fines de semana o días sin vencimientos.
            </p>
            
            {renderCalendarTable('august', 'Agosto')}
            {renderCalendarTable('september', 'Septiembre')}
            {renderCalendarTable('october', 'Octubre')}

            <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
              <button type="button" onClick={() => setIsCalendarModalOpen(false)} className="btn" style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)' }}>
                Cancelar
              </button>
              <button type="button" onClick={saveCalendar} className="btn" style={{ flex: 1, background: 'var(--primary-color)' }}>
                Guardar Calendario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

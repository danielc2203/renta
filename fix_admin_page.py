import re

with open('src/app/admin/page.tsx', 'r') as f:
    content = f.read()

# Add visiblePasswords state
state_str = "  const [clients, setClients] = useState<any[]>([])\n  const [loading, setLoading] = useState(true)"
state_replacement = "  const [clients, setClients] = useState<any[]>([])\n  const [loading, setLoading] = useState(true)\n  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({})"

content = content.replace(state_str, state_replacement)

# Toggle password function
toggle_func_str = """  const togglePassword = (id: string) => {
    setVisiblePasswords(prev => ({...prev, [id]: !prev[id]}))
  }
"""

insert_idx = content.find("  const calculateDueDate = (docNumber: string) => {")
content = content[:insert_idx] + toggle_func_str + content[insert_idx:]

# Replace Clave DIAN column
col_str = """    {
      name: 'Clave DIAN',
      selector: (row: any) => row.dianPassword || '-',
      sortable: false,
    },"""

col_replacement = """    {
      name: 'Clave DIAN',
      selector: (row: any) => row.dianPassword || '-',
      sortable: false,
      cell: (row: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{row.dianPassword ? (visiblePasswords[row.id] ? row.dianPassword : '••••••••') : '-'}</span>
          {row.dianPassword && (
            <button 
              onClick={() => togglePassword(row.id)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
              title={visiblePasswords[row.id] ? "Ocultar" : "Mostrar"}
            >
              <Eye size={14} />
            </button>
          )}
        </div>
      )
    },"""

content = content.replace(col_str, col_replacement)

with open('src/app/admin/page.tsx', 'w') as f:
    f.write(content)


with open('src/app/admin/page.tsx', 'r') as f:
    content = f.read()

effect_str = "  useEffect(() => {\n    fetchClients()\n    fetchCurrentUser()\n  }, [])"
effect_replacement = "  useEffect(() => {\n    fetchClients()\n    fetchCurrentUser()\n  }, [contadorId])"
content = content.replace(effect_str, effect_replacement)

# Also conditionally hide the "Ir a Súper Admin" button if we are in contador mode, because the "Volver a Súper Admin" will replace it
super_btn_str = """          {currentUser && currentUser.role === 'SUPERADMIN' && (
            <button 
              className="btn" 
              onClick={() => router.push('/superadmin')}
              style={{ background: '#8B5CF6', color: 'white', border: 'none' }}
            >
              Ir a Súper Admin
            </button>
          )}"""

super_btn_replacement = """          {currentUser && currentUser.role === 'SUPERADMIN' && !contadorId && (
            <button 
              className="btn" 
              onClick={() => router.push('/superadmin')}
              style={{ background: '#8B5CF6', color: 'white', border: 'none' }}
            >
              Ir a Súper Admin
            </button>
          )}
          {currentUser && currentUser.role === 'SUPERADMIN' && contadorId && (
            <button 
              className="btn" 
              onClick={() => router.push('/superadmin')}
              style={{ background: '#3B82F6', color: 'white', border: 'none' }}
            >
              Volver a Súper Admin
            </button>
          )}"""
content = content.replace(super_btn_str, super_btn_replacement)

# And if we are in contador mode, maybe add a small text indicating "Viendo clientes de [Accountant]" next to the greeting.
# No, let's keep it simple.

with open('src/app/admin/page.tsx', 'w') as f:
    f.write(content)

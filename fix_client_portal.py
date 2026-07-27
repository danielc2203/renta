with open('src/components/ClientPortal.tsx', 'r') as f:
    content = f.read()

state_str = "  const [clientName, setClientName] = useState('')"
state_replacement = "  const [clientName, setClientName] = useState('')\n  const [accountantName, setAccountantName] = useState('')"
content = content.replace(state_str, state_replacement)

set_state_str = "        setClientName(data.clientName || '')"
set_state_replacement = "        setClientName(data.clientName || '')\n        setAccountantName(data.accountantName || '')"
content = content.replace(set_state_str, set_state_replacement)

header_str = "      {clientName && <h2 style={{ marginBottom: '32px', color: 'var(--text-secondary)' }}>Cliente: {clientName} {isAdmin && '(Modo Admin)'}</h2>}"
header_replacement = "      {clientName && <h2 style={{ marginBottom: '32px', color: 'var(--text-secondary)' }}>Cliente: {clientName} {isAdmin ? `(Modo Admin)` : accountantName ? `(Contador: ${accountantName})` : ''}</h2>}"
content = content.replace(header_str, header_replacement)

with open('src/components/ClientPortal.tsx', 'w') as f:
    f.write(content)

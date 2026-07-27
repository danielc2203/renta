with open('src/app/admin/page.tsx', 'r') as f:
    content = f.read()

# Add useSearchParams
content = content.replace("import { useRouter } from 'next/navigation'",
                          "import { useRouter, useSearchParams } from 'next/navigation'")

# Get contadorId
search_params_insert = "  const searchParams = useSearchParams()\n  const contadorId = searchParams.get('contadorId')"
router_str = "  const router = useRouter()"
content = content.replace(router_str, router_str + "\n" + search_params_insert)

# Update fetchClients to pass contadorId
fetch_str = "    const res = await fetch('/api/clients')"
fetch_replacement = "    const res = await fetch('/api/clients' + (contadorId ? `?contadorId=${contadorId}` : ''))"
content = content.replace(fetch_str, fetch_replacement)

# Update the dependencies of useEffect for fetchClients if they exist. Wait, let's just make it call fetchClients on mount and on contadorId change.
# Let's check where fetchClients is defined and used.
with open('src/app/admin/page.tsx', 'w') as f:
    f.write(content)

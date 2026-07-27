with open('src/app/api/documents/[id]/download/route.ts', 'r') as f:
    content = f.read()

content = content.replace("payload.role !== 'admin'", "payload.role !== 'ACCOUNTANT' && payload.role !== 'SUPERADMIN'")

with open('src/app/api/documents/[id]/download/route.ts', 'w') as f:
    f.write(content)

with open('src/app/api/portal/status/route.ts', 'r') as f:
    content = f.read()

content = content.replace("payload.role === 'admin'", "(payload.role === 'ACCOUNTANT' || payload.role === 'SUPERADMIN')")

# Also fetch accountant name
query_str = """    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        documents: true
      }
    })"""
query_replacement = """    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        documents: true,
        admin: true
      }
    })"""
content = content.replace(query_str, query_replacement)

resp_str = """      clientName: client.name,
      uploadedDocs,"""
resp_replacement = """      clientName: client.name,
      accountantName: client.admin?.name || 'Desconocido',
      uploadedDocs,"""
content = content.replace(resp_str, resp_replacement)

with open('src/app/api/portal/status/route.ts', 'w') as f:
    f.write(content)

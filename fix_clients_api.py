with open('src/app/api/clients/route.ts', 'r') as f:
    content = f.read()

get_str = """    let whereClause: any = {}
    if (payload.role !== 'SUPERADMIN') {
      whereClause = {
        OR: [
          { adminId: payload.id },
          { adminId: null }
        ]
      }
    }"""

get_replacement = """    const { searchParams } = new URL(request.url)
    const contadorId = searchParams.get('contadorId')

    let whereClause: any = {}
    
    if (payload.role === 'SUPERADMIN' && contadorId) {
      whereClause = { adminId: contadorId }
    } else if (payload.role !== 'SUPERADMIN') {
      whereClause = {
        OR: [
          { adminId: payload.id },
          { adminId: null }
        ]
      }
    }"""

content = content.replace(get_str, get_replacement)

with open('src/app/api/clients/route.ts', 'w') as f:
    f.write(content)

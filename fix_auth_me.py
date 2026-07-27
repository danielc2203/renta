with open('src/app/api/auth/me/route.ts', 'r') as f:
    content = f.read()

import_prisma = "import prisma from '@/lib/prisma'"
if "import prisma" not in content:
    content = content.replace("import { cookies } from 'next/headers'", "import { cookies } from 'next/headers'\nimport prisma from '@/lib/prisma'")

find_logic = """  if (!payload) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  return NextResponse.json({ user: payload })"""

replace_logic = """  if (!payload || !payload.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const user = await prisma.admin.findUnique({ where: { id: payload.id } })
  if (!user || !user.isActive) {
    return NextResponse.json({ error: 'Usuario bloqueado o no existe' }, { status: 401 })
  }

  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } })"""

content = content.replace(find_logic, replace_logic)

with open('src/app/api/auth/me/route.ts', 'w') as f:
    f.write(content)

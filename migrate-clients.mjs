import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Buscando admin actual (Guillermo)...')
  const admin = await prisma.admin.findFirst()

  if (!admin) {
    console.log('No hay administradores en la base de datos.')
    return
  }

  console.log(`Encontrado admin: ${admin.email} (ID: ${admin.id})`)

  console.log('Actualizando clientes que no tienen adminId...')
  const result = await prisma.client.updateMany({
    where: {
      adminId: null
    },
    data: {
      adminId: admin.id
    }
  })

  console.log(`Actualizados ${result.count} clientes.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

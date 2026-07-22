import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const email = 'daniel@rentacolombia.com'
  const password = await bcrypt.hash('Admin2026*', 10)

  const existing = await prisma.admin.findUnique({ where: { email } })
  if (existing) {
    console.log('El Súper Admin ya existe:', existing.email)
    return
  }

  const superAdmin = await prisma.admin.create({
    data: {
      email,
      password,
      name: 'Daniel Castro',
      role: 'SUPERADMIN'
    }
  })

  console.log(`Súper Admin creado exitosamente: ${superAdmin.email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

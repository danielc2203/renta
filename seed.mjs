import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('Guillermo2026!', 10)
  
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@rentacolombia.com' },
    update: {},
    create: {
      email: 'admin@rentacolombia.com',
      password: hashedPassword,
      name: 'Guillermo',
    },
  })
  console.log('Seeded admin:', admin.email)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

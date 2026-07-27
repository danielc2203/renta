const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  await prisma.admin.updateMany({
    data: {
      whatsappTemplate: null
    }
  })
  console.log('Cleared whatsappTemplate for all admins so they get the new default.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

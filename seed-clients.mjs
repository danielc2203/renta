import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const clients = [
  { dianPassword: 'Maracaibo*1983', documentNumber: '1.126.242.304', dueDate: new Date('2026-08-13'), name: 'GODOY ANAYA ADRIANA SOFIA', phone: '3023109300' },
  { dianPassword: 'Pofloju79', documentNumber: '79.717.403', dueDate: new Date('2026-08-13'), name: 'PORAS FLORIAN JUAN PABLO', phone: '3212429165' },
  { dianPassword: 'Guivari19', documentNumber: '19.409.803', dueDate: new Date('2026-08-13'), name: 'VARGAS RINCON GUILLERMO URIEL', phone: '3133754498' },
  { dianPassword: 'Umtaya52*', documentNumber: '52.553.305', dueDate: new Date('2026-08-14'), name: 'UMAÑA TAMAYO YANIS', phone: '3125888011' },
  { dianPassword: 'Bearne30', documentNumber: '30.652.407', dueDate: new Date('2025-08-18'), name: 'ARTEAGA NEGRETE BECKY', phone: '3228437014' },
  { dianPassword: 'Lumara51*', documentNumber: '51.692.507', dueDate: new Date('2025-08-18'), name: 'RAMOS CAMPOS LUZ MARY', phone: '674402761' },
  { dianPassword: 'Pcmr2023*', documentNumber: '22.414.907', dueDate: new Date('2025-08-18'), name: 'MORALES RANGEL PATRICIA CLAUDIA', phone: '3178943785' },
  { dianPassword: '1231Nana*', documentNumber: '26.560.208', dueDate: new Date('2025-08-18'), name: 'VARGAS TORREJANO ANA BEATRIZ', phone: '3164629052' },
  { dianPassword: 'Orjife79*', documentNumber: '79.489.909', dueDate: new Date('2026-08-19'), name: 'ORDOÑEZ JIMENEZ LUIS FELIPE', phone: '3192615383' },
  { dianPassword: 'Ninateamo23.', documentNumber: '1.032.481.211', dueDate: new Date('2026-08-20'), name: 'MORALES BALLEN JOAN SEBASTIAN', phone: '3204743683' },
  { dianPassword: 'Vaatju75#', documentNumber: '75.062.814', dueDate: new Date('2026-08-21'), name: 'VALENCIA ATEHORTUA JUAN CARLOS', phone: '3125888011' },
  { dianPassword: 'Monica$79', documentNumber: '52.850.214', dueDate: new Date('2026-08-21'), name: 'DORADO VILLAMIL MONICA FERNANDA', phone: '3203451762' },
  { dianPassword: 'Vavana*10', documentNumber: '1.010.124.514', dueDate: new Date('2026-08-21'), name: 'VALBUENA VANEGAS NATALIA', phone: '3202777164' },
  { dianPassword: 'Babeto73*', documentNumber: '73.229.215', dueDate: new Date('2026-08-24'), name: 'BARRIOS BELTRAN TOMAS JOSE', phone: '3008117758' },
  { dianPassword: 'Amnool51*', documentNumber: '51.819.016', dueDate: new Date('2026-08-24'), name: 'AMAYA NOSSA OLGA LUCIA', phone: '3102820066' },
  { dianPassword: 'Flaca*1963', documentNumber: '17.023.916', dueDate: new Date('2026-08-24'), name: 'ANTONIO MARIA RUBIANO', phone: '3219770543' },
  { dianPassword: 'Pimoci20*', documentNumber: '20.423.016', dueDate: new Date('2026-08-24'), name: 'PINTO MORA CILIA MARITZA', phone: '3186074265' },
  { dianPassword: 'Caancla55*', documentNumber: '55.154.417', dueDate: new Date('2026-08-25'), name: 'CLARA INES CANTILLO ANDRADE', phone: '3186083485' },
  { dianPassword: 'Margara1986#', documentNumber: '1.032.361.817', dueDate: new Date('2026-08-25'), name: 'VELASCO GUTIERREZ MARGARITA INES', phone: '3114826753' },
  { dianPassword: 'Moquibri5*', documentNumber: '5.045.118', dueDate: new Date('2026-08-25'), name: 'QUIÑONES BRICEÑO MOISES', phone: '3136254617' },
  { dianPassword: 'Caruva*79', documentNumber: '79.392.719', dueDate: new Date('2026-08-26'), name: 'RUBIANO VARGAS CAMILO', phone: '3163778166' },
  { dianPassword: 'Pabulu15', documentNumber: '15.700.320', dueDate: new Date('2026-08-26'), name: 'PADILLA BULA LUIS MIGUEL', phone: '3142978816' },
  { dianPassword: 'Vazulu52*', documentNumber: '52.127.121', dueDate: new Date('2026-08-27'), name: 'VANEGAS ZULETA LUZ DARY', phone: '3202777164' },
  { dianPassword: 'Mahoan12*', documentNumber: '12.543.822', dueDate: new Date('2026-08-27'), name: 'MARTINEZ HOYER ANTONIO SEGUNDO', phone: '3153375637' },
  { dianPassword: 'Arprivi19*', documentNumber: '19.320.524', dueDate: new Date('2026-08-28'), name: 'AREVALO PRIETO VICTOR MANUEL', phone: '3124125057' },
  { dianPassword: '29deOctubre.', documentNumber: '1.018.419.726', dueDate: new Date('2026-08-31'), name: 'TORRES PARRA IVONNE', phone: '3202145692' },
]

async function main() {
  for (const client of clients) {
    // Remove dots from documentNumber to make it cleaner
    const cleanDocument = client.documentNumber.replace(/\./g, '')
    
    await prisma.client.upsert({
      where: { documentNumber: cleanDocument },
      update: {
        dianPassword: client.dianPassword,
        dueDate: client.dueDate,
        name: client.name,
        phone: client.phone
      },
      create: {
        documentNumber: cleanDocument,
        dianPassword: client.dianPassword,
        dueDate: client.dueDate,
        name: client.name,
        phone: client.phone
      }
    })
  }
  console.log('Seeded', clients.length, 'clients.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

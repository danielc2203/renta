import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const septClients = [
  { clave: 'Camilo8735958', cedula: '1.018.428.427', vencimiento: '2026-09-01T12:00:00Z', nombre: 'LOPEZ LIEVANO CRISTHIAN CAMILO', telefono: '3142305054' },
  { clave: 'alVaro51', cedula: '24.708.029', vencimiento: '2026-09-02T12:00:00Z', nombre: 'PARRA MONTOYA MATILDE DEL CARMEN', telefono: '3197530951' },
  { clave: 'Karito1406*', cedula: '52.899.429', vencimiento: '2026-09-02T12:00:00Z', nombre: 'VELASCO GUTIERREZ EDNA CAROLINA', telefono: '3108542196' },
  { clave: 'Sector333***', cedula: '51.710.330', vencimiento: '2026-09-02T12:00:00Z', nombre: 'RUBIANO VARGAS MARIA CECILIA', telefono: '3118632591' },
  { clave: 'Samuel-11', cedula: '80.735.532', vencimiento: '2026-09-03T12:00:00Z', nombre: 'VERGARA ZARATE HECTOR ANDRES', telefono: '3167005455' },
  { clave: 'Samuel*11', cedula: '1.032.429.932', vencimiento: '2026-09-03T12:00:00Z', nombre: 'OSPINA HERRERA YULIETH', telefono: '3209416009' },
  { clave: 'Gopera79', cedula: '79.102.931', vencimiento: '2026-09-03T12:00:00Z', nombre: 'GONZALEZ PEÑA RAFAEL ALFONSO', telefono: '3202736830' },
  { clave: 'Luissoler9712#', cedula: '1.022.377.333', vencimiento: '2026-09-04T12:00:00Z', nombre: 'SOLER BOLAÑOS LUIS HERNANDO', telefono: '3194089709' },
  { clave: 'Vento.58P', cedula: '79.500.735', vencimiento: '2026-09-07T12:00:00Z', nombre: 'PORRAS FLORIAN JAIME EDUARDO', telefono: '3205749175' },
  { clave: 'Lupetit1989+', cedula: '1.053.796.240', vencimiento: '2026-09-09T12:00:00Z', nombre: 'URIBE VALENCIA JULIANA', telefono: '3202832539' },
  { clave: '$Yesica139', cedula: '50.883.139', vencimiento: '2026-09-09T12:00:00Z', nombre: 'PADILLA YANEZ YESIKA DEL CARMEN', telefono: '3016518566' },
  { clave: 'Vaoremi72', cedula: '72.134.541', vencimiento: '2026-09-10T12:00:00Z', nombre: 'VASQUEZ ORDOÑEZ EMIRO RAFAEL', telefono: '3202091385' },
  { clave: 'Cetodeme38*', cedula: '38.228.543', vencimiento: '2026-09-11T12:00:00Z', nombre: 'TOBON DE MEDELLIN CELIA', telefono: '3144774048' },
  { clave: '6871208evC*', cedula: '1.019.151.344', vencimiento: '2026-09-11T12:00:00Z', nombre: 'VARGAS CLAVIJO ESTEFANIA', telefono: '3153489065' },
  { clave: 'Oslo1215#', cedula: '1.136.886.344', vencimiento: '2026-09-11T12:00:00Z', nombre: 'ORDOÑEZ CARDONA DIANA PAOLA', telefono: '3209639719' },
  { clave: 'Onuryluna2025*', cedula: '1.000.718.245', vencimiento: '2026-09-14T12:00:00Z', nombre: 'PORRAS LAURA', telefono: '3142523188' },
  { clave: 'Verijo19', cedula: '19.469.645', vencimiento: '2026-09-14T12:00:00Z', nombre: 'VERGARA RINCON JORGE EDUARDO', telefono: '3132194569' },
  { clave: 'Caalama41', cedula: '41.759.747', vencimiento: '2026-09-15T12:00:00Z', nombre: 'ALARCON CASTAÑEDA MARIA MAGDALENA', telefono: '3024674686' },
  { clave: 'Quiorsa51', cedula: '51.840.949', vencimiento: '2026-09-16T12:00:00Z', nombre: 'QUIÑONES ORTEGA SANDRA MARCELA', telefono: '3133658978' },
  { clave: 'Vafloxi55*', cedula: '55.188.950', vencimiento: '2026-09-16T12:00:00Z', nombre: 'VARGAS FLOREZ XIOMARA', telefono: '3142041657' },
  { clave: 'Nacional89*', cedula: '80.086.750', vencimiento: '2026-09-16T12:00:00Z', nombre: 'GOMEZ LOZANO PEDRO JOSE', telefono: '3212187989' },
  { clave: 'Rasapa51*', cedula: '51.853.450', vencimiento: '2026-09-16T12:00:00Z', nombre: 'RAMOS SANTACRUZ GLORIA PATRICIA', telefono: '3104880858' },
  { clave: 'Cesar1*', cedula: '79.656.053', vencimiento: '2026-09-18T12:00:00Z', nombre: 'CASTILLO AMAYA CESAR AUGUSTO', telefono: '3157636877' },
  { clave: 'Flaca*1963', cedula: '19.374.653', vencimiento: '2026-09-18T12:00:00Z', nombre: 'RUBIANOVARGAS JOSE GUILLERMO', telefono: '3219770543' },
  { clave: 'Olrago20', cedula: '20.737.954', vencimiento: '2026-09-18T12:00:00Z', nombre: 'RAMIREZ GONZALEZ OLGA MARINA', telefono: '3188275505' },
  { clave: '', cedula: '1.018.481.156', vencimiento: '2026-09-21T12:00:00Z', nombre: 'GUARNIZO ARTEAGA ANGIE VANESSA', telefono: '3228437014' },
  { clave: 'Gucuma41#', cedula: '41.796.156', vencimiento: '2026-09-21T12:00:00Z', nombre: 'GUTIERRES CUBILLOS MARGARITA ROSA', telefono: '3166211283' },
  { clave: 'Dian123*', cedula: '1.015.448.755', vencimiento: '2026-09-21T12:00:00Z', nombre: 'PORRAS GARCIA MARIA ALEJANDRA', telefono: '3204743683' },
  { clave: 'Andres0512', cedula: '1.136.884.856', vencimiento: '2026-09-21T12:00:00Z', nombre: 'BULLA AMAYA ANDRES FELIPE', telefono: '3008452723' },
  { clave: 'Estedani250210#', cedula: '52.781.157', vencimiento: '2026-09-22T12:00:00Z', nombre: 'JEJEN CARRILLO NANCY MARCELA', telefono: '3208029088' },
  { clave: 'Yonatan15*', cedula: '19.378.559', vencimiento: '2026-09-23T12:00:00Z', nombre: 'LADINO TRIANA JESUS ANTONIO', telefono: '3114931807' },
  { clave: 'DianxRenta2025!', cedula: '41.536.059', vencimiento: '2026-09-23T12:00:00Z', nombre: 'MORA DE RINCON CARMEN', telefono: '5127517034' },
  { clave: 'Vimacr23', cedula: '23.389.960', vencimiento: '2026-09-23T12:00:00Z', nombre: 'VILLAMIL MARTINEZ GLORIA CRISTINA', telefono: '3144407215' },
  { clave: 'Marina20#', cedula: '20.244.863', vencimiento: '2026-09-25T12:00:00Z', nombre: 'MAMA', telefono: '3219770543' }, // Could be actual name from previous record "MAMA", strange but let's keep it.
  { clave: 'Rosemary123*', cedula: '6.879.266', vencimiento: '2026-09-28T12:00:00Z', nombre: 'GARAY POLO HENRY JOSE', telefono: '3002772353' },
  { clave: 'VencerOMorir123', cedula: '1.014.213.666', vencimiento: '2026-09-28T12:00:00Z', nombre: 'GARAY RIVERA ANDRES CAMILO', telefono: '3022123573' }
]

async function main() {
  console.log('Seeding September clients...')
  for (const client of septClients) {
    const cedula = client.cedula.replace(/\D/g, '')
    // Usar upsert para evitar duplicados
    await prisma.client.upsert({
      where: { documentNumber: cedula },
      update: {
        name: client.nombre,
        dianPassword: client.clave,
        phone: client.telefono,
        dueDate: new Date(client.vencimiento)
      },
      create: {
        name: client.nombre,
        documentNumber: cedula,
        dianPassword: client.clave,
        phone: client.telefono,
        dueDate: new Date(client.vencimiento),
        status: 'Pendiente'
      }
    })
    console.log(`Upserted: ${client.nombre} (${cedula})`)
  }
  console.log('Finished seeding September clients!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

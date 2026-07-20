import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const octClients = [
  { clave: 'Ruvayo41', cedula: '41.600.268', vencimiento: '2026-10-01T12:00:00Z', nombre: 'RUBIANO VARGAS YOLANDA', telefono: '3208344916' },
  { clave: 'Porras79*', cedula: '156.668', vencimiento: '2026-10-01T12:00:00Z', nombre: 'PORRAS CARO PEDRO VICENTE', telefono: '3212429165' },
  { clave: 'Luis1978', cedula: '73.229.570', vencimiento: '2026-10-02T12:00:00Z', nombre: 'BARRIOS BELTRAN LUIS ROBERTO', telefono: '3002677871' },
  { clave: 'Admin2admin**', cedula: '80.826.970', vencimiento: '2026-10-02T12:00:00Z', nombre: 'CASTRO REYES JOSE DANIEL', telefono: '3016834994' },
  { clave: 'Gero@2022', cedula: '1024558973', vencimiento: '2026-10-06T12:00:00Z', nombre: 'BARRANTES JIMENEZ LADY LORENA', telefono: '3102803832' },
  { clave: 'Beky04051.', cedula: '1010247974', vencimiento: '2026-10-06T12:00:00Z', nombre: 'GUARNIZO ARTEAGA JUANITA', telefono: '3228427014' },
  { clave: 'Mafean42#', cedula: '42.546.775', vencimiento: '2026-10-07T12:00:00Z', nombre: 'MARTINEZ FERNANDEZ ANDREA', telefono: '3182152425' },
  { clave: 'Lepilo10*', cedula: '1.014.244.477', vencimiento: '2026-10-08T12:00:00Z', nombre: 'LEMUS PINTO LINDA LORENA', telefono: '3196989338' },
  { clave: 'Esteban2016$', cedula: '6.567.877', vencimiento: '2026-10-08T12:00:00Z', nombre: 'SILVARA RODRIGUEZ JOSE LEONARDO', telefono: '3208029088' },
  { clave: 'Archvi52*', cedula: '52.818.079', vencimiento: '2026-10-09T12:00:00Z', nombre: 'AREVALO CHAPARRO NAZLY VIVIANA', telefono: '3125925506' },
  { clave: 'Niko1508**', cedula: '39.748.679', vencimiento: '2026-10-09T12:00:00Z', nombre: 'SANCHEZ MOLINA RUBIA ESTELA', telefono: '3143593270' },
  { clave: 'Cesar1*', cedula: '1.136.887.881', vencimiento: '2026-10-13T12:00:00Z', nombre: 'CASTILLO MENDEZ JOSHUA EDUARDO', telefono: '3008602578' },
  { clave: 'Cemeto52*', cedula: '52.522.684', vencimiento: '2026-10-14T12:00:00Z', nombre: 'MEDELLIN TOBON CELIA GILETTE', telefono: '3016518161' },
  { clave: 'Jucapetru24$', cedula: '79.063.083', vencimiento: '2026-10-14T12:00:00Z', nombre: 'PERAFAN TRUJILLO JUAN CARLOS', telefono: '3186074265' },
  { clave: 'Cata123*', cedula: '52.992.885', vencimiento: '2026-10-15T12:00:00Z', nombre: 'MENESES LAMILLA DIANA CATALINA', telefono: '3134998635' },
  { clave: 'Lucasxotros3@01', cedula: '79.501.385', vencimiento: '2026-10-15T12:00:00Z', nombre: 'RINCON MORA ROLANDO HUMBERTO', telefono: '5127975751' },
  { clave: 'Tadeumru24*', cedula: '24.948.888', vencimiento: '2026-10-16T12:00:00Z', nombre: 'TAMAYO DE UMAÑA RUBIELA', telefono: '3204535083' },
  { clave: 'Sozugo41', cedula: '41.533.689', vencimiento: '2026-10-19T12:00:00Z', nombre: 'ZULETA GOMEZ SOFIA', telefono: '3202777164' },
  { clave: 'Glavarl21*#', cedula: '21.056.289', vencimiento: '2026-10-19T12:00:00Z', nombre: 'VARGAS RINCON GLADYS STELLA', telefono: '3123736369' },
  { clave: 'Dian01#', cedula: '79.602.391', vencimiento: '2026-10-20T12:00:00Z', nombre: 'ALVAREZ MOSQUERA JUAN PABLO', telefono: '3168310055' },
  { clave: 'Rigome29*', cedula: '2.971.791', vencimiento: '2026-10-20T12:00:00Z', nombre: 'GONZALEZ MEDINA RICARDO', telefono: '3133768486' },
  { clave: 'Verima79*', cedula: '79.151.593', vencimiento: '2026-10-21T12:00:00Z', nombre: 'VERGARA RINCON HECTOR MAURICIO', telefono: '3012547968' },
  { clave: 'Cristian.2131', cedula: '1.143.136.494', vencimiento: '2026-10-21T12:00:00Z', nombre: 'AGAMEZ HERNANDES CRISTIAN ALBERTO', telefono: '3106394858' },
  { clave: 'Juanpa25#', cedula: '7.931.795', vencimiento: '2026-10-22T12:00:00Z', nombre: 'BARRIOS LOBELO PEDRO PABLO', telefono: '3115184864' },
  { clave: 'Lucrecia1958#', cedula: '35.515.695', vencimiento: '2026-10-22T12:00:00Z', nombre: 'LOPEZ OROZCO MARIA LUCRECIA', telefono: '3002677871' },
  { clave: 'Manolito31.', cedula: '51.938.996', vencimiento: '2026-10-22T12:00:00Z', nombre: 'OLMOS GONZALEZ DIANA PATRICIA', telefono: '3005501858' },
  { clave: '081193.Jsbp', cedula: '1.020.786.998', vencimiento: '2026-10-23T12:00:00Z', nombre: 'BERMONTH PARRA JUAN SEBASTIAN', telefono: '3148285954' },
  { clave: 'Ripidi10', cedula: '1.022.325.700', vencimiento: '2026-10-26T12:00:00Z', nombre: 'RIOS PIÑERES DIANA MILENA', telefono: '3006608384' },
  { clave: '5288Monyfl!', cedula: '52.883.969', vencimiento: '2026-10-02T12:00:00Z', nombre: 'MONICA FIQUE CORREA', telefono: '3123763244' },
  { clave: 'Gumomo12*', cedula: '12.555.295', vencimiento: '2026-10-22T12:00:00Z', nombre: 'MOSQUERA MONROY GUSTAVO ALFONSO', telefono: '3125547118' }
]

async function main() {
  console.log('Seeding October clients...')
  for (const client of octClients) {
    const cedula = client.cedula.replace(/\D/g, '')
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
  console.log('Finished seeding October clients!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

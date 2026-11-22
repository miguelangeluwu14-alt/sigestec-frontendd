
export const MODULOS_INICIO = [
  { nombre: 'Solicitudes', ruta: '/solicitudes', roles: ['GERENTE'] },
  { nombre: 'Cotizaciones', ruta: '/cotizaciones', roles: ['GERENTE'] },
  { nombre: 'Órdenes de compra', ruta: '/compras', roles: ['GERENTE'] },
  { nombre: 'Asignación de personal', ruta: '/asignaciones', roles: ['SUPERVISOR'] },
  { nombre: 'Programar OT', ruta: '/programaciones', roles: ['SUPERVISOR'] },
  { nombre: 'Elaboración del ATS', ruta: '/ats', roles: ['SSOMA'] },
  { nombre: 'Aprobación de ATS', ruta: '/ats/aprobaciones', roles: ['SUPERVISOR'] },
  { nombre: 'Ejecución del servicio', ruta: '/ejecuciones', roles: ['SUPERVISOR'] },
  { nombre: 'Informe técnico', ruta: '/informes', roles: ['SUPERVISOR'] },
  { nombre: 'Conformidad del servicio', ruta: '/conformidades', roles: ['SUPERVISOR'] },
  { nombre: 'Movimientos de materiales', ruta: '/almacen/materiales', roles: ['ALMACENERO'] },
  {
    nombre: 'Movimientos de herramientas',
    ruta: '/almacen/herramientas',
    roles: ['ALMACENERO'],
  },
];

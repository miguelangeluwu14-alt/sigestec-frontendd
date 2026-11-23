/** Reglas de comparación para fechas de formularios (YYYY-MM-DD, sin huso horario). */
export function fechaLocalHoy(): string {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
}

export function fechaISO(valor: unknown): string {
  if (typeof valor !== 'string') return '';
  const fecha = valor.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(fecha) ? fecha : '';
}

export function desplazarDiaISO(fecha: string, dias: number): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return '';
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const utc = new Date(Date.UTC(anio, mes - 1, dia + dias));
  return `${utc.getUTCFullYear()}-${String(utc.getUTCMonth() + 1).padStart(2, '0')}-${String(utc.getUTCDate()).padStart(2, '0')}`;
}

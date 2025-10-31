// src/auditoria/utils/date.util.ts
export function startOfDay(dateString: string): Date {
  // Crear fecha en zona horaria local (no UTC)
  const [year, month, day] = dateString.split('-').map(Number);
  const d = new Date(year, month - 1, day, 0, 0, 0, 0);
  return d;
}

export function endOfDayInclusive(dateString: string): Date {
  // Crear fecha en zona horaria local (no UTC)
  const [year, month, day] = dateString.split('-').map(Number);
  const d = new Date(year, month - 1, day, 23, 59, 59, 999);
  return d;
}
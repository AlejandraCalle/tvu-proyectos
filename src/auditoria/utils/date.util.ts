export function endOfDayInclusive(dateString: string): Date {
  const d = new Date(dateString);
  // Ajusta a 23:59:59.999
  d.setHours(23, 59, 59, 999);
  return d;
}

export function startOfDay(dateString: string): Date {
  const d = new Date(dateString);
  d.setHours(0, 0, 0, 0);
  return d;
}

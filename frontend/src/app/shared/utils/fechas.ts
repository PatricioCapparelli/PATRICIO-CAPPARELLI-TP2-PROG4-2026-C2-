// Fecha local en formato AAAA-MM-DD (lo que usan los <input type="date">)
export function fechaLocal(diasAtras = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// 2026-11-17 -> 17/11
export function diaYMes(fecha: string): string {
  const [, mes, dia] = fecha.split('-');
  return `${dia}/${mes}`;
}

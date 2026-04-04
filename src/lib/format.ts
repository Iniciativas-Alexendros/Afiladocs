export function formatCurrency(amountCents: number, currency: string): string {
  return (amountCents / 100).toLocaleString('es-ES', {
    style: 'currency',
    currency: currency.toUpperCase(),
  })
}

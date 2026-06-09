export function formatCurrency(value: number, showPence: boolean = false): string {
  if (showPence) {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);
  }
  return new Intl.NumberFormat('en-GB', { 
    style: 'currency', 
    currency: 'GBP', 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  }).format(value);
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatPercent(value: number | null): string {
  if (value === null || value === undefined) return '—';
  return `${value.toFixed(1)}%`;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

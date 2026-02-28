import { nanoid } from 'nanoid';

export function generateId(): string {
  return nanoid();
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
}

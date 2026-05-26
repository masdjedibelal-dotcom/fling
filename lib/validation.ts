export function parseBirthDate(day: string, month: string, year: string): Date | null {
  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  if (!d || !m || !y || day.length < 1 || month.length < 1 || year.length !== 4) {
    return null;
  }
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  return date;
}

export function isAtLeast18(birthDate: Date): boolean {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }
  return age >= 18;
}

export function getAgeFromBirthDate(iso: string | null): number | null {
  if (!iso) return null;
  const birthDate = new Date(iso);
  if (Number.isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }
  return age;
}

export function birthDateFromAge(age: number): string {
  const year = new Date().getFullYear() - age;
  return `${year}-06-15`;
}

export function formatBirthDateISO(birthDate: Date): string {
  const y = birthDate.getFullYear();
  const m = String(birthDate.getMonth() + 1).padStart(2, '0');
  const d = String(birthDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function normalizeGermanPhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('49')) {
    return `+${digits}`;
  }
  if (digits.startsWith('0')) {
    return `+49${digits.slice(1)}`;
  }
  return `+49${digits}`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return phone;
  const last2 = digits.slice(-2);
  return `+49 ${digits.slice(2, 4) || '••'} ••• ••${last2}`;
}

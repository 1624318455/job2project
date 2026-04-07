export function isEmail(email: string): boolean {
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w+)+$/.test(email);
}

export function isPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone);
}

export function isUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

export function validateForm(data: Record<string, unknown>, rules: Record<string, (value: unknown) => string | true>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [key, validator] of Object.entries(rules)) {
    const result = validator(data[key]);
    if (result !== true) errors[key] = result;
  }
  return errors;
}
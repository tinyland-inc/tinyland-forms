






















export function slugify(val: string): string {
  return val
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}














export function parseCommaSeparated(val: string): string[] {
  if (!val) return [];
  return val
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}








export function calculateReadingTime(content: string): number {
  if (!content) return 1;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / 200);
}


















export function validatePasswordStrength(password: string): {
  score: number;
  total: number;
  requirements: {
    lowercase: boolean;
    uppercase: boolean;
    digit: boolean;
    special: boolean;
    length: boolean;
  };
} {
  const requirements = {
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    digit: /\d/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
    length: password.length >= 12,
  };

  const score = Object.values(requirements).filter(Boolean).length;

  return {
    score,
    total: 5,
    requirements,
  };
}







export function formatTotpCode(code: string): string {
  return code.replace(/[\s-]/g, '');
}








export function isValidHandle(handle: string): boolean {
  return /^[a-z0-9_-]{3,20}$/.test(handle);
}







export function sanitizeUsername(username: string): string {
  return username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '');
}








export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && slug.length > 0 && slug.length <= 100;
}








export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}









export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): boolean {
  const normalizedPassword = password?.trim() || '';
  const normalizedConfirm = confirmPassword?.trim() || '';
  return normalizedPassword === normalizedConfirm;
}

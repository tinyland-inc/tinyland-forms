/**
 * Form Helper Utilities
 *
 * Pure functions for common form data transformations and validations.
 * These are framework-agnostic and have no external dependencies.
 */

// ============================================================================
// String Utilities
// ============================================================================

/**
 * Generate URL-friendly slug from a string.
 *
 * @param val - The input string to slugify
 * @returns URL-friendly slug
 *
 * @example
 * ```typescript
 * slugify('Hello World!'); // 'hello-world'
 * slugify('  multiple   spaces  '); // 'multiple-spaces'
 * ```
 */
export function slugify(val: string): string {
  return val
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parse comma-separated string into trimmed array.
 * Filters out empty entries.
 *
 * @param val - Comma-separated string
 * @returns Array of trimmed, non-empty strings
 *
 * @example
 * ```typescript
 * parseCommaSeparated('foo, bar, baz'); // ['foo', 'bar', 'baz']
 * parseCommaSeparated(''); // []
 * ```
 */
export function parseCommaSeparated(val: string): string[] {
  if (!val) return [];
  return val
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * Calculate reading time based on word count (200 words per minute).
 * Returns a minimum of 1 minute.
 *
 * @param content - The text content
 * @returns Estimated reading time in minutes
 */
export function calculateReadingTime(content: string): number {
  if (!content) return 1;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / 200);
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate password strength.
 * Returns the score and detailed breakdown of which requirements are met.
 *
 * @param password - The password to evaluate
 * @returns Object with score, total requirements, and breakdown
 *
 * @example
 * ```typescript
 * const result = validatePasswordStrength('MyP@ssw0rd123');
 * // { score: 5, total: 5, requirements: { lowercase: true, ... } }
 * ```
 */
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

/**
 * Format TOTP code by removing spaces and hyphens.
 *
 * @param code - Raw TOTP code input
 * @returns Cleaned 6-digit code string
 */
export function formatTotpCode(code: string): string {
  return code.replace(/[\s-]/g, '');
}

/**
 * Validate handle format (used in client-side validation).
 * Accepts 3-20 characters: lowercase letters, numbers, underscores, and hyphens.
 *
 * @param handle - The handle to validate
 * @returns true if the handle format is valid
 */
export function isValidHandle(handle: string): boolean {
  return /^[a-z0-9_-]{3,20}$/.test(handle);
}

/**
 * Sanitize username for invite (lowercase, trim, remove invalid chars).
 *
 * @param username - Raw username input
 * @returns Sanitized username string
 */
export function sanitizeUsername(username: string): string {
  return username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '');
}

/**
 * Validate slug format.
 * Accepts lowercase letters, numbers, and hyphens only.
 *
 * @param slug - The slug to validate
 * @returns true if the slug format is valid
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && slug.length > 0 && slug.length <= 100;
}

/**
 * Validate email format (basic check).
 * For thorough validation, use the emailSchema Zod validator.
 *
 * @param email - The email to validate
 * @returns true if the email format appears valid
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate that password and confirmation match.
 * Normalizes both values (trim) before comparison.
 *
 * @param password - The password
 * @param confirmPassword - The confirmation password
 * @returns true if both match after normalization
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): boolean {
  const normalizedPassword = password?.trim() || '';
  const normalizedConfirm = confirmPassword?.trim() || '';
  return normalizedPassword === normalizedConfirm;
}

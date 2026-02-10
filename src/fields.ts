/**
 * Common Field Validators
 *
 * Reusable Zod schemas for common form fields. These are the building blocks
 * used to compose larger form schemas. All validators are compatible with
 * sveltekit-superforms + zod4 adapter.
 *
 * IMPORTANT:
 * - Using Zod v4 import path: 'zod/v4'
 * - Avoiding .transform() and .pipe() (not compatible with Superforms)
 * - Using .refine() for custom validation logic
 */

import { z } from 'zod/v4';

// ============================================================================
// String Fields
// ============================================================================

/**
 * Email field validator.
 * Uses Zod v4's built-in email validation.
 */
export const emailSchema = z
  .email('Please enter a valid email address')
  .max(254, 'Email must be at most 254 characters');

/**
 * URL field validator.
 * Uses Zod v4's built-in URL validation.
 */
export const urlSchema = z
  .url('Please enter a valid URL')
  .max(2048, 'URL must be at most 2048 characters');

/**
 * URL-friendly slug validator.
 * Only lowercase letters, numbers, and hyphens.
 */
export const slugSchema = z
  .string()
  .trim()
  .min(1, 'Slug is required')
  .max(100, 'Slug must be at most 100 characters')
  .regex(
    /^[a-z0-9-]+$/,
    'Slug must contain only lowercase letters, numbers, and hyphens'
  );

/**
 * User handle validator.
 * Lowercase letters, numbers, underscores, and hyphens.
 */
export const handleSchema = z
  .string()
  .trim()
  .min(3, 'Handle must be at least 3 characters')
  .max(20, 'Handle must be at most 20 characters')
  .regex(
    /^[a-z0-9_-]+$/,
    'Handle must be lowercase letters, numbers, underscores, and hyphens only'
  );

/**
 * Username validator.
 * Lowercase letters, numbers, and underscores only.
 */
export const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(
    /^[a-z0-9_]+$/,
    'Username must be lowercase letters, numbers, and underscores only'
  );

/**
 * Display name validator.
 */
export const displayNameSchema = z
  .string()
  .trim()
  .min(1, 'Display name is required')
  .max(100, 'Display name must be at most 100 characters');

/**
 * Strong password validator.
 * Minimum 12 characters with uppercase, lowercase, digit, and special character.
 */
export const strongPasswordSchema = z
  .string()
  .trim()
  .min(12, 'Password must be at least 12 characters long')
  .max(100, 'Password must be at most 100 characters')
  .refine(
    (val) => /[a-z]/.test(val),
    'Password must contain at least one lowercase letter'
  )
  .refine(
    (val) => /[A-Z]/.test(val),
    'Password must contain at least one uppercase letter'
  )
  .refine(
    (val) => /\d/.test(val),
    'Password must contain at least one digit'
  )
  .refine(
    (val) => /[^a-zA-Z0-9]/.test(val),
    'Password must contain at least one special character'
  );

/**
 * Basic password validator.
 * Minimum 8 characters with uppercase, lowercase, and digit.
 */
export const basicPasswordSchema = z
  .string()
  .trim()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be at most 100 characters')
  .refine(
    (val) => /[A-Z]/.test(val),
    'Password must contain at least one uppercase letter'
  )
  .refine(
    (val) => /[a-z]/.test(val),
    'Password must contain at least one lowercase letter'
  )
  .refine(
    (val) => /[0-9]/.test(val),
    'Password must contain at least one number'
  );

/**
 * TOTP (6-digit) code validator.
 */
export const totpCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, 'Code must be exactly 6 digits')
  .length(6, 'Code must be exactly 6 digits');

// ============================================================================
// Content Fields
// ============================================================================

/**
 * Content title validator (for posts, events, products, etc.)
 */
export const titleSchema = z
  .string()
  .trim()
  .min(3, 'Title must be at least 3 characters')
  .max(200, 'Title must be at most 200 characters');

/**
 * Content excerpt/summary validator.
 */
export const excerptSchema = z
  .string()
  .trim()
  .max(500, 'Excerpt must be at most 500 characters')
  .optional();

/**
 * Content body validator.
 */
export const contentBodySchema = z
  .string()
  .trim()
  .min(10, 'Content must be at least 10 characters')
  .max(50000, 'Content must be at most 50,000 characters');

/**
 * Comma-separated tags string (for form inputs).
 */
export const tagsStringSchema = z.string().trim().optional();

// ============================================================================
// Date/Time Fields
// ============================================================================

/**
 * ISO 8601 datetime string validator.
 */
export const iso8601DateSchema = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: 'Must be a valid ISO 8601 date string' }
);

/**
 * IANA timezone identifier validator.
 * Examples: "America/New_York", "Europe/London", "UTC"
 */
export const timezoneSchema = z.string().regex(
  /^[A-Za-z]+\/[A-Za-z_]+$/,
  { message: 'Must be a valid IANA timezone identifier' }
);

/**
 * RRULE recurrence rule format validator (RFC 5545).
 * Examples: "FREQ=DAILY", "FREQ=WEEKLY;BYDAY=MO,WE,FR"
 */
export const rruleSchema = z.string().regex(
  /^FREQ=(DAILY|WEEKLY|MONTHLY|YEARLY)/,
  { message: 'Must be a valid RRULE format (RFC 5545)' }
);

// ============================================================================
// SEO Fields
// ============================================================================

/**
 * SEO title validator (max 70 chars for optimal display in search results).
 */
export const seoTitleSchema = z
  .string()
  .max(70, 'SEO title must be at most 70 characters')
  .optional();

/**
 * SEO description validator (max 160 chars for meta description).
 */
export const seoDescriptionSchema = z
  .string()
  .max(160, 'SEO description must be at most 160 characters')
  .optional();

/**
 * @tummycrypt/tinyland-forms
 *
 * Reusable Zod schemas, field validators, and form helper utilities
 * for the Tinyland platform. Compatible with sveltekit-superforms + zod4.
 *
 * Usage:
 * ```typescript
 * import {
 *   emailSchema, slugSchema, handleSchema,
 *   paginationSchema, authorReferenceSchema,
 *   slugify, validatePasswordStrength
 * } from '@tummycrypt/tinyland-forms';
 *
 * // Compose schemas
 * const myFormSchema = z.object({
 *   email: emailSchema,
 *   slug: slugSchema,
 *   title: titleSchema,
 * });
 *
 * // Use helpers
 * const slug = slugify('My Blog Post Title');
 * const strength = validatePasswordStrength('MyP@ssw0rd!23');
 * ```
 *
 * For SuperForms integration, import from the superforms submodule:
 * ```typescript
 * import { superForm, superValidate, zod4 } from '@tummycrypt/tinyland-forms/superforms';
 * ```
 *
 * @module @tummycrypt/tinyland-forms
 */

// ============================================================================
// Field Validators
// ============================================================================

export {
  // String fields
  emailSchema,
  urlSchema,
  slugSchema,
  handleSchema,
  usernameSchema,
  displayNameSchema,
  strongPasswordSchema,
  basicPasswordSchema,
  totpCodeSchema,
  // Content fields
  titleSchema,
  excerptSchema,
  contentBodySchema,
  tagsStringSchema,
  // Date/Time fields
  iso8601DateSchema,
  timezoneSchema,
  rruleSchema,
  // SEO fields
  seoTitleSchema,
  seoDescriptionSchema,
} from './fields.js';

// ============================================================================
// Composite Schemas
// ============================================================================

export {
  // Visibility
  CONTENT_VISIBILITY_VALUES,
  contentVisibilitySchema,
  // Publishing
  PUBLISHING_STATUSES,
  publishingStatusSchema,
  scheduledPublishingSchema,
  contentVersionSchema,
  publishingMetadataSchema,
  // Author
  authorReferenceSchema,
  authorFieldSchema,
  // Pagination
  paginationSchema,
  paginatedResponseSchema,
  // Date Range
  dateRangeSchema,
  // Search
  searchQuerySchema,
  // Social
  socialLinksSchema,
  // Contact
  contactSchema,
  // ID/Actions
  idSchema,
  toggleStatusSchema,
  deleteActionSchema,
} from './schemas.js';

export type {
  ContentVisibility,
  PublishingStatus,
  AuthorReference,
  PaginationParams,
  DateRange,
  SearchQuery,
  SocialLinks,
  ContactForm,
  ToggleStatusForm,
  DeleteActionForm,
} from './schemas.js';

// ============================================================================
// Helper Utilities
// ============================================================================

export {
  slugify,
  parseCommaSeparated,
  calculateReadingTime,
  validatePasswordStrength,
  formatTotpCode,
  isValidHandle,
  sanitizeUsername,
  isValidSlug,
  isValidEmail,
  validatePasswordMatch,
} from './helpers.js';

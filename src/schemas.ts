/**
 * Shared Composite Schemas
 *
 * Higher-level schemas composed from field validators. These represent
 * reusable data shapes used across multiple content types and forms.
 *
 * IMPORTANT:
 * - Using Zod v4 import path: 'zod/v4'
 * - Avoiding .transform() and .pipe() (not compatible with Superforms)
 */

import { z } from 'zod/v4';

// ============================================================================
// Content Visibility
// ============================================================================

/**
 * ActivityPub-compatible content visibility levels.
 * Maps to ActivityPub addressing:
 * - public: Visible to everyone, appears in timelines
 * - unlisted: Visible to everyone, hidden from timelines
 * - followers: Visible only to followers
 * - private: Visible only to author
 * - direct: Direct message to specific users
 */
export const CONTENT_VISIBILITY_VALUES = [
  'public',
  'unlisted',
  'followers',
  'private',
  'direct',
] as const;

export type ContentVisibility = (typeof CONTENT_VISIBILITY_VALUES)[number];

/**
 * Content visibility schema.
 */
export const contentVisibilitySchema = z.enum(CONTENT_VISIBILITY_VALUES);

// ============================================================================
// Publishing Status
// ============================================================================

/**
 * Publishing status for content lifecycle.
 */
export const PUBLISHING_STATUSES = [
  'draft',
  'pending',
  'scheduled',
  'published',
  'archived',
] as const;

export type PublishingStatus = (typeof PUBLISHING_STATUSES)[number];

/**
 * Publishing status schema.
 */
export const publishingStatusSchema = z.enum(PUBLISHING_STATUSES);

/**
 * Scheduled publishing configuration.
 */
export const scheduledPublishingSchema = z.object({
  scheduledAt: z
    .string()
    .datetime({ message: 'Must be a valid ISO 8601 datetime' }),
  timezone: z.string().optional(),
  publishedBy: z.string().optional(),
  autoFederate: z.boolean().default(true),
});

/**
 * Content version entry.
 */
export const contentVersionSchema = z.object({
  version: z.number().int().positive(),
  createdAt: z.string().datetime(),
  createdBy: z.string().min(1),
  changeType: z.enum(['create', 'edit', 'status', 'restore']),
  changeSummary: z.string().max(500).optional(),
});

/**
 * Publishing metadata schema (for frontmatter).
 */
export const publishingMetadataSchema = z.object({
  status: publishingStatusSchema.default('draft'),
  scheduling: scheduledPublishingSchema.optional(),
  versions: z.array(contentVersionSchema).optional(),
  currentVersion: z.number().int().positive().optional(),
  lastEditedAt: z.string().datetime().optional(),
  lastEditedBy: z.string().optional(),
});

// ============================================================================
// Author Reference
// ============================================================================

/**
 * Standardized author reference schema for all content types.
 * Used to identify content creators consistently across blog posts,
 * products, events, notes, and videos.
 */
export const authorReferenceSchema = z.object({
  /** Display name of the author */
  name: z.string().min(1, 'Author name is required').max(100),
  /** Unique handle/username (without @ prefix) */
  handle: z.string().min(1, 'Author handle is required').max(50),
  /** Optional avatar image URL */
  avatar: z.string().max(500).optional(),
});

export type AuthorReference = z.infer<typeof authorReferenceSchema>;

/**
 * Author field that accepts both object format (preferred) and string format (deprecated).
 * String format is for backwards compatibility and will be treated as the handle.
 * @deprecated String format is deprecated. Use AuthorReference object format.
 */
export const authorFieldSchema = z.union([
  authorReferenceSchema,
  z.string().max(100),
]);

// ============================================================================
// Pagination
// ============================================================================

/**
 * Pagination query parameters schema.
 * Suitable for URL search params or API request bodies.
 */
export const paginationSchema = z.object({
  /** Current page number (1-indexed) */
  page: z.number().int().min(1).default(1),
  /** Items per page */
  limit: z.number().int().min(1).max(100).default(20),
  /** Sort field */
  sortBy: z.string().max(50).optional(),
  /** Sort direction */
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

/**
 * Paginated response wrapper schema factory.
 * Creates a schema for paginated API responses around any item schema.
 */
export function paginatedResponseSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    total: z.number().int().min(0),
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    totalPages: z.number().int().min(0),
  });
}

// ============================================================================
// Date Range
// ============================================================================

/**
 * Date range schema for filtering queries.
 * Accepts ISO 8601 date strings.
 */
export const dateRangeSchema = z.object({
  /** Start of range (inclusive) */
  from: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Must be a valid ISO 8601 date string' }
  ),
  /** End of range (inclusive) */
  to: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Must be a valid ISO 8601 date string' }
  ),
}).refine(
  (data) => new Date(data.from) <= new Date(data.to),
  { message: 'Start date must be before or equal to end date', path: ['from'] }
);

export type DateRange = z.infer<typeof dateRangeSchema>;

// ============================================================================
// Search/Filter
// ============================================================================

/**
 * Generic search query schema.
 */
export const searchQuerySchema = z.object({
  /** Search query string */
  q: z.string().trim().min(1, 'Search query is required').max(200),
  /** Optional filter by visibility */
  visibility: z.enum(CONTENT_VISIBILITY_VALUES).optional(),
  /** Optional filter by status */
  status: z.enum(PUBLISHING_STATUSES).optional(),
  /** Optional filter by tags (comma-separated) */
  tags: z.string().optional(),
  /** Optional filter by category */
  category: z.string().max(50).optional(),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

// ============================================================================
// Social Links
// ============================================================================

/**
 * Social media links schema.
 */
export const socialLinksSchema = z.object({
  twitter: z.string().optional(),
  mastodon: z.string().optional(),
  instagram: z.string().optional(),
  linkedin: z.string().optional(),
});

export type SocialLinks = z.infer<typeof socialLinksSchema>;

// ============================================================================
// Contact Form
// ============================================================================

/**
 * Contact form schema.
 * Simple, clean validation for contact form submissions.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  email: z
    .email('Please enter a valid email address')
    .max(100, 'Email must be at most 100 characters'),
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be at most 200 characters'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be at most 5,000 characters'),
});

export type ContactForm = z.infer<typeof contactSchema>;

// ============================================================================
// ID/Reference Fields
// ============================================================================

/**
 * Generic ID schema (non-empty string).
 */
export const idSchema = z.string().trim().min(1, 'ID is required');

/**
 * Toggle status action schema.
 */
export const toggleStatusSchema = z.object({
  id: z.string().trim().min(1, 'ID is required'),
  currentStatus: z.enum(['published', 'draft'], 'Invalid status'),
});

export type ToggleStatusForm = z.infer<typeof toggleStatusSchema>;

/**
 * Delete action schema.
 */
export const deleteActionSchema = z.object({
  id: z.string().trim().min(1, 'ID is required'),
});

export type DeleteActionForm = z.infer<typeof deleteActionSchema>;












import { z } from 'zod/v4';














export const CONTENT_VISIBILITY_VALUES = [
  'public',
  'unlisted',
  'followers',
  'private',
  'direct',
] as const;

export type ContentVisibility = (typeof CONTENT_VISIBILITY_VALUES)[number];




export const contentVisibilitySchema = z.enum(CONTENT_VISIBILITY_VALUES);








export const PUBLISHING_STATUSES = [
  'draft',
  'pending',
  'scheduled',
  'published',
  'archived',
] as const;

export type PublishingStatus = (typeof PUBLISHING_STATUSES)[number];




export const publishingStatusSchema = z.enum(PUBLISHING_STATUSES);




export const scheduledPublishingSchema = z.object({
  scheduledAt: z
    .string()
    .datetime({ message: 'Must be a valid ISO 8601 datetime' }),
  timezone: z.string().optional(),
  publishedBy: z.string().optional(),
  autoFederate: z.boolean().default(true),
});




export const contentVersionSchema = z.object({
  version: z.number().int().positive(),
  createdAt: z.string().datetime(),
  createdBy: z.string().min(1),
  changeType: z.enum(['create', 'edit', 'status', 'restore']),
  changeSummary: z.string().max(500).optional(),
});




export const publishingMetadataSchema = z.object({
  status: publishingStatusSchema.default('draft'),
  scheduling: scheduledPublishingSchema.optional(),
  versions: z.array(contentVersionSchema).optional(),
  currentVersion: z.number().int().positive().optional(),
  lastEditedAt: z.string().datetime().optional(),
  lastEditedBy: z.string().optional(),
});










export const authorReferenceSchema = z.object({
  
  name: z.string().min(1, 'Author name is required').max(100),
  
  handle: z.string().min(1, 'Author handle is required').max(50),
  
  avatar: z.string().max(500).optional(),
});

export type AuthorReference = z.infer<typeof authorReferenceSchema>;






export const authorFieldSchema = z.union([
  authorReferenceSchema,
  z.string().max(100),
]);









export const paginationSchema = z.object({
  
  page: z.number().int().min(1).default(1),
  
  limit: z.number().int().min(1).max(100).default(20),
  
  sortBy: z.string().max(50).optional(),
  
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationParams = z.infer<typeof paginationSchema>;





export function paginatedResponseSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    total: z.number().int().min(0),
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    totalPages: z.number().int().min(0),
  });
}









export const dateRangeSchema = z.object({
  
  from: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Must be a valid ISO 8601 date string' }
  ),
  
  to: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Must be a valid ISO 8601 date string' }
  ),
}).refine(
  (data) => new Date(data.from) <= new Date(data.to),
  { message: 'Start date must be before or equal to end date', path: ['from'] }
);

export type DateRange = z.infer<typeof dateRangeSchema>;








export const searchQuerySchema = z.object({
  
  q: z.string().trim().min(1, 'Search query is required').max(200),
  
  visibility: z.enum(CONTENT_VISIBILITY_VALUES).optional(),
  
  status: z.enum(PUBLISHING_STATUSES).optional(),
  
  tags: z.string().optional(),
  
  category: z.string().max(50).optional(),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;








export const socialLinksSchema = z.object({
  twitter: z.string().optional(),
  mastodon: z.string().optional(),
  instagram: z.string().optional(),
  linkedin: z.string().optional(),
});

export type SocialLinks = z.infer<typeof socialLinksSchema>;









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








export const idSchema = z.string().trim().min(1, 'ID is required');




export const toggleStatusSchema = z.object({
  id: z.string().trim().min(1, 'ID is required'),
  currentStatus: z.enum(['published', 'draft'], 'Invalid status'),
});

export type ToggleStatusForm = z.infer<typeof toggleStatusSchema>;




export const deleteActionSchema = z.object({
  id: z.string().trim().min(1, 'ID is required'),
});

export type DeleteActionForm = z.infer<typeof deleteActionSchema>;

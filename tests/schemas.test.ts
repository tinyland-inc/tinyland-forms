















import { describe, it, expect } from 'vitest';
import { test as fcTest } from '@fast-check/vitest';
import fc from 'fast-check';
import { z } from 'zod/v4';
import {
  CONTENT_VISIBILITY_VALUES,
  contentVisibilitySchema,
  PUBLISHING_STATUSES,
  publishingStatusSchema,
  scheduledPublishingSchema,
  contentVersionSchema,
  publishingMetadataSchema,
  authorReferenceSchema,
  authorFieldSchema,
  paginationSchema,
  paginatedResponseSchema,
  dateRangeSchema,
  searchQuerySchema,
  socialLinksSchema,
  contactSchema,
  idSchema,
  toggleStatusSchema,
  deleteActionSchema,
} from '../src/schemas.js';





const visibilityArb = fc.constantFrom(...CONTENT_VISIBILITY_VALUES);
const statusArb = fc.constantFrom(...PUBLISHING_STATUSES);

const validAuthorRefArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 100 }),
  handle: fc.string({ minLength: 1, maxLength: 50 }),
  avatar: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
});

const validPaginationArb = fc.record({
  page: fc.integer({ min: 1, max: 1000 }),
  limit: fc.integer({ min: 1, max: 100 }),
  sortBy: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  sortOrder: fc.constantFrom('asc' as const, 'desc' as const),
});





describe('contentVisibilitySchema', () => {
  it('accepts all valid visibility values', () => {
    for (const vis of CONTENT_VISIBILITY_VALUES) {
      expect(contentVisibilitySchema.safeParse(vis).success).toBe(true);
    }
  });

  it('rejects invalid visibility values', () => {
    expect(contentVisibilitySchema.safeParse('invalid').success).toBe(false);
    expect(contentVisibilitySchema.safeParse('').success).toBe(false);
    expect(contentVisibilitySchema.safeParse('members').success).toBe(false);
  });

  fcTest.prop([visibilityArb])('PBT: all visibility enum values pass', (vis) => {
    expect(contentVisibilitySchema.safeParse(vis).success).toBe(true);
  });

  fcTest.prop([fc.string().filter((s) => !(CONTENT_VISIBILITY_VALUES as readonly string[]).includes(s))])(
    'PBT: non-visibility strings always fail',
    (val) => {
      expect(contentVisibilitySchema.safeParse(val).success).toBe(false);
    }
  );
});





describe('publishingStatusSchema', () => {
  it('accepts all valid statuses', () => {
    for (const status of PUBLISHING_STATUSES) {
      expect(publishingStatusSchema.safeParse(status).success).toBe(true);
    }
  });

  it('rejects invalid statuses', () => {
    expect(publishingStatusSchema.safeParse('unknown').success).toBe(false);
  });

  fcTest.prop([statusArb])('PBT: all status enum values pass', (status) => {
    expect(publishingStatusSchema.safeParse(status).success).toBe(true);
  });
});





describe('scheduledPublishingSchema', () => {
  it('accepts valid scheduled publishing config', () => {
    const result = scheduledPublishingSchema.safeParse({
      scheduledAt: '2026-06-15T10:00:00Z',
      autoFederate: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid datetime', () => {
    const result = scheduledPublishingSchema.safeParse({
      scheduledAt: 'not-a-date',
    });
    expect(result.success).toBe(false);
  });
});





describe('contentVersionSchema', () => {
  it('accepts valid version entry', () => {
    const result = contentVersionSchema.safeParse({
      version: 1,
      createdAt: '2026-01-15T10:00:00Z',
      createdBy: 'admin',
      changeType: 'create',
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-positive version numbers', () => {
    const result = contentVersionSchema.safeParse({
      version: 0,
      createdAt: '2026-01-15T10:00:00Z',
      createdBy: 'admin',
      changeType: 'create',
    });
    expect(result.success).toBe(false);
  });
});





describe('publishingMetadataSchema', () => {
  it('accepts minimal publishing metadata', () => {
    const result = publishingMetadataSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts full publishing metadata', () => {
    const result = publishingMetadataSchema.safeParse({
      status: 'published',
      scheduling: {
        scheduledAt: '2026-06-15T10:00:00Z',
        autoFederate: true,
      },
      versions: [
        {
          version: 1,
          createdAt: '2026-01-15T10:00:00Z',
          createdBy: 'admin',
          changeType: 'create',
        },
      ],
      currentVersion: 1,
      lastEditedAt: '2026-01-15T12:00:00Z',
      lastEditedBy: 'editor',
    });
    expect(result.success).toBe(true);
  });
});





describe('authorReferenceSchema', () => {
  it('accepts valid author references', () => {
    const result = authorReferenceSchema.safeParse({
      name: 'Jess Sullivan',
      handle: 'jess',
    });
    expect(result.success).toBe(true);
  });

  it('accepts author references with avatar', () => {
    const result = authorReferenceSchema.safeParse({
      name: 'Jess',
      handle: 'jess',
      avatar: 'https://example.com/avatar.jpg',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = authorReferenceSchema.safeParse({
      name: '',
      handle: 'jess',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty handle', () => {
    const result = authorReferenceSchema.safeParse({
      name: 'Jess',
      handle: '',
    });
    expect(result.success).toBe(false);
  });

  fcTest.prop([validAuthorRefArb])('PBT: valid author refs always pass', (ref) => {
    expect(authorReferenceSchema.safeParse(ref).success).toBe(true);
  });
});





describe('authorFieldSchema', () => {
  it('accepts author reference objects', () => {
    const result = authorFieldSchema.safeParse({
      name: 'Jess',
      handle: 'jess',
    });
    expect(result.success).toBe(true);
  });

  it('accepts string author (deprecated format)', () => {
    const result = authorFieldSchema.safeParse('jess');
    expect(result.success).toBe(true);
  });

  it('rejects strings exceeding 100 characters', () => {
    const result = authorFieldSchema.safeParse('a'.repeat(101));
    expect(result.success).toBe(false);
  });
});





describe('paginationSchema', () => {
  it('accepts valid pagination params', () => {
    const result = paginationSchema.safeParse({
      page: 1,
      limit: 20,
    });
    expect(result.success).toBe(true);
  });

  it('applies defaults', () => {
    const result = paginationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.sortOrder).toBe('desc');
    }
  });

  it('rejects page < 1', () => {
    const result = paginationSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects limit > 100', () => {
    const result = paginationSchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });

  fcTest.prop([validPaginationArb])('PBT: valid pagination always passes', (params) => {
    expect(paginationSchema.safeParse(params).success).toBe(true);
  });
});





describe('paginatedResponseSchema', () => {
  it('wraps item schema correctly', () => {
    const responseSchema = paginatedResponseSchema(z.string());
    const result = responseSchema.safeParse({
      items: ['a', 'b', 'c'],
      total: 10,
      page: 1,
      limit: 3,
      totalPages: 4,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid items', () => {
    const responseSchema = paginatedResponseSchema(z.number());
    const result = responseSchema.safeParse({
      items: ['not', 'numbers'],
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
    expect(result.success).toBe(false);
  });
});





describe('dateRangeSchema', () => {
  it('accepts valid date ranges', () => {
    const result = dateRangeSchema.safeParse({
      from: '2026-01-01',
      to: '2026-12-31',
    });
    expect(result.success).toBe(true);
  });

  it('accepts same-day ranges', () => {
    const result = dateRangeSchema.safeParse({
      from: '2026-06-15',
      to: '2026-06-15',
    });
    expect(result.success).toBe(true);
  });

  it('rejects inverted date ranges (from > to)', () => {
    const result = dateRangeSchema.safeParse({
      from: '2026-12-31',
      to: '2026-01-01',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid date strings', () => {
    const result = dateRangeSchema.safeParse({
      from: 'not-a-date',
      to: '2026-12-31',
    });
    expect(result.success).toBe(false);
  });
});





describe('searchQuerySchema', () => {
  it('accepts valid search queries', () => {
    const result = searchQuerySchema.safeParse({ q: 'hello world' });
    expect(result.success).toBe(true);
  });

  it('accepts queries with optional filters', () => {
    const result = searchQuerySchema.safeParse({
      q: 'test',
      visibility: 'public',
      status: 'published',
      tags: 'tag1,tag2',
      category: 'tech',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty query strings', () => {
    const result = searchQuerySchema.safeParse({ q: '' });
    expect(result.success).toBe(false);
  });

  it('rejects query strings exceeding 200 characters', () => {
    const result = searchQuerySchema.safeParse({ q: 'a'.repeat(201) });
    expect(result.success).toBe(false);
  });
});





describe('socialLinksSchema', () => {
  it('accepts valid social links', () => {
    const result = socialLinksSchema.safeParse({
      twitter: '@handle',
      mastodon: '@user@instance.social',
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty social links', () => {
    const result = socialLinksSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});





describe('contactSchema', () => {
  it('accepts valid contact form data', () => {
    const result = contactSchema.safeParse({
      name: 'Jess Sullivan',
      email: 'jess@example.com',
      subject: 'Hello there!',
      message: 'This is a test message with enough content.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const result = contactSchema.safeParse({
      name: 'Jess',
    });
    expect(result.success).toBe(false);
  });

  it('rejects name shorter than 2 characters', () => {
    const result = contactSchema.safeParse({
      name: 'J',
      email: 'jess@example.com',
      subject: 'Hello there!',
      message: 'Enough content here.',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = contactSchema.safeParse({
      name: 'Jess',
      email: 'not-an-email',
      subject: 'Hello there!',
      message: 'Enough content here.',
    });
    expect(result.success).toBe(false);
  });

  it('rejects subject shorter than 5 characters', () => {
    const result = contactSchema.safeParse({
      name: 'Jess',
      email: 'jess@example.com',
      subject: 'Hi',
      message: 'Enough content here.',
    });
    expect(result.success).toBe(false);
  });

  it('rejects message shorter than 10 characters', () => {
    const result = contactSchema.safeParse({
      name: 'Jess',
      email: 'jess@example.com',
      subject: 'Hello there!',
      message: 'Short',
    });
    expect(result.success).toBe(false);
  });
});





describe('idSchema', () => {
  it('accepts non-empty strings', () => {
    expect(idSchema.safeParse('abc-123').success).toBe(true);
  });

  it('rejects empty strings', () => {
    expect(idSchema.safeParse('').success).toBe(false);
  });

  it('rejects whitespace-only strings', () => {
    expect(idSchema.safeParse('   ').success).toBe(false);
  });
});





describe('toggleStatusSchema', () => {
  it('accepts valid toggle requests', () => {
    expect(
      toggleStatusSchema.safeParse({ id: 'abc', currentStatus: 'published' }).success
    ).toBe(true);
    expect(
      toggleStatusSchema.safeParse({ id: 'abc', currentStatus: 'draft' }).success
    ).toBe(true);
  });

  it('rejects invalid statuses', () => {
    expect(
      toggleStatusSchema.safeParse({ id: 'abc', currentStatus: 'archived' }).success
    ).toBe(false);
  });
});





describe('deleteActionSchema', () => {
  it('accepts valid delete requests', () => {
    expect(deleteActionSchema.safeParse({ id: 'abc-123' }).success).toBe(true);
  });

  it('rejects empty ID', () => {
    expect(deleteActionSchema.safeParse({ id: '' }).success).toBe(false);
  });
});


















import { describe, it, expect } from 'vitest';
import { test as fcTest } from '@fast-check/vitest';
import fc from 'fast-check';
import {
  emailSchema,
  urlSchema,
  slugSchema,
  handleSchema,
  usernameSchema,
  strongPasswordSchema,
  basicPasswordSchema,
  totpCodeSchema,
  titleSchema,
  excerptSchema,
  contentBodySchema,
  iso8601DateSchema,
  timezoneSchema,
  rruleSchema,
  seoTitleSchema,
  seoDescriptionSchema,
} from '../src/fields.js';





const SLUG_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789-';
const validSlugArb = fc
  .array(fc.constantFrom(...SLUG_CHARS.split('')), { minLength: 1, maxLength: 100 })
  .map((arr) => arr.join(''))
  .filter((s) => /^[a-z0-9-]+$/.test(s));

const HANDLE_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789_-';
const validHandleArb = fc
  .array(fc.constantFrom(...HANDLE_CHARS.split('')), { minLength: 3, maxLength: 20 })
  .map((arr) => arr.join(''))
  .filter((s) => /^[a-z0-9_-]+$/.test(s));

const USERNAME_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789_';
const validUsernameArb = fc
  .array(fc.constantFrom(...USERNAME_CHARS.split('')), { minLength: 3, maxLength: 20 })
  .map((arr) => arr.join(''))
  .filter((s) => /^[a-z0-9_]+$/.test(s));

const DIGIT_CHARS = '0123456789';
const validTotpArb = fc
  .array(fc.constantFrom(...DIGIT_CHARS.split('')), { minLength: 6, maxLength: 6 })
  .map((arr) => arr.join(''));





describe('emailSchema', () => {
  it('accepts valid email addresses', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.org',
      'user+tag@domain.co.uk',
    ];
    for (const email of validEmails) {
      expect(emailSchema.safeParse(email).success).toBe(true);
    }
  });

  it('rejects invalid email addresses', () => {
    const invalidEmails = [
      '',
      'not-an-email',
      '@missing-local.com',
      'missing-domain@',
      'missing@.com',
    ];
    for (const email of invalidEmails) {
      expect(emailSchema.safeParse(email).success).toBe(false);
    }
  });

  it('rejects emails exceeding 254 characters', () => {
    const longEmail = 'a'.repeat(243) + '@example.com'; 
    expect(emailSchema.safeParse(longEmail).success).toBe(false);
  });
});





describe('urlSchema', () => {
  it('accepts valid URLs', () => {
    const validUrls = [
      'https://example.com',
      'http://localhost:3000',
      'https://sub.domain.co.uk/path?q=1#fragment',
    ];
    for (const url of validUrls) {
      expect(urlSchema.safeParse(url).success).toBe(true);
    }
  });

  it('rejects invalid URLs', () => {
    const invalidUrls = [
      '',
      'not-a-url',
      'just some text with spaces',
    ];
    for (const url of invalidUrls) {
      expect(urlSchema.safeParse(url).success).toBe(false);
    }
  });

  it('rejects URLs exceeding 2048 characters', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(2040);
    expect(urlSchema.safeParse(longUrl).success).toBe(false);
  });
});





describe('slugSchema', () => {
  it('accepts valid slugs', () => {
    const validSlugs = [
      'hello-world',
      'my-post',
      'a',
      '123',
      'post-123-title',
    ];
    for (const slug of validSlugs) {
      expect(slugSchema.safeParse(slug).success).toBe(true);
    }
  });

  it('rejects invalid slugs', () => {
    const invalidSlugs = [
      '',
      'Hello-World', 
      'hello world', 
      'hello_world', 
      'hello!world', 
    ];
    for (const slug of invalidSlugs) {
      expect(slugSchema.safeParse(slug).success).toBe(false);
    }
  });

  it('rejects slugs exceeding 100 characters', () => {
    const longSlug = 'a'.repeat(101);
    expect(slugSchema.safeParse(longSlug).success).toBe(false);
  });

  fcTest.prop([validSlugArb])('PBT: valid slugs always pass', (slug) => {
    expect(slugSchema.safeParse(slug).success).toBe(true);
  });
});





describe('handleSchema', () => {
  it('accepts valid handles', () => {
    const validHandles = ['alice', 'bob_123', 'user-name', 'abc'];
    for (const handle of validHandles) {
      expect(handleSchema.safeParse(handle).success).toBe(true);
    }
  });

  it('rejects handles shorter than 3 characters', () => {
    expect(handleSchema.safeParse('ab').success).toBe(false);
  });

  it('rejects handles longer than 20 characters', () => {
    expect(handleSchema.safeParse('a'.repeat(21)).success).toBe(false);
  });

  it('rejects handles with uppercase letters', () => {
    expect(handleSchema.safeParse('Alice').success).toBe(false);
  });

  it('rejects handles with special characters', () => {
    expect(handleSchema.safeParse('user@name').success).toBe(false);
    expect(handleSchema.safeParse('user.name').success).toBe(false);
  });

  fcTest.prop([validHandleArb])('PBT: valid handles always pass', (handle) => {
    expect(handleSchema.safeParse(handle).success).toBe(true);
  });
});





describe('usernameSchema', () => {
  it('accepts valid usernames', () => {
    const validUsernames = ['alice', 'bob_123', 'user_name'];
    for (const username of validUsernames) {
      expect(usernameSchema.safeParse(username).success).toBe(true);
    }
  });

  it('rejects usernames with hyphens', () => {
    expect(usernameSchema.safeParse('user-name').success).toBe(false);
  });

  fcTest.prop([validUsernameArb])('PBT: valid usernames always pass', (username) => {
    expect(usernameSchema.safeParse(username).success).toBe(true);
  });
});





describe('strongPasswordSchema', () => {
  it('accepts strong passwords', () => {
    expect(strongPasswordSchema.safeParse('MyP@ssw0rd123!').success).toBe(true);
    expect(strongPasswordSchema.safeParse('Secure#Pass1234').success).toBe(true);
  });

  it('rejects passwords shorter than 12 characters', () => {
    expect(strongPasswordSchema.safeParse('MyP@ss1').success).toBe(false);
  });

  it('rejects passwords without lowercase', () => {
    expect(strongPasswordSchema.safeParse('MYPASSWORD123!').success).toBe(false);
  });

  it('rejects passwords without uppercase', () => {
    expect(strongPasswordSchema.safeParse('mypassword123!').success).toBe(false);
  });

  it('rejects passwords without digit', () => {
    expect(strongPasswordSchema.safeParse('MyPassword!!!abc').success).toBe(false);
  });

  it('rejects passwords without special character', () => {
    expect(strongPasswordSchema.safeParse('MyPassword1234').success).toBe(false);
  });

  it('rejects passwords exceeding 100 characters', () => {
    expect(strongPasswordSchema.safeParse('Aa1!' + 'a'.repeat(100)).success).toBe(false);
  });
});





describe('basicPasswordSchema', () => {
  it('accepts basic passwords meeting minimum requirements', () => {
    expect(basicPasswordSchema.safeParse('MyPass12').success).toBe(true);
    expect(basicPasswordSchema.safeParse('Password1').success).toBe(true);
  });

  it('rejects passwords shorter than 8 characters', () => {
    expect(basicPasswordSchema.safeParse('MyPas1').success).toBe(false);
  });
});





describe('totpCodeSchema', () => {
  it('accepts valid 6-digit codes', () => {
    expect(totpCodeSchema.safeParse('123456').success).toBe(true);
    expect(totpCodeSchema.safeParse('000000').success).toBe(true);
    expect(totpCodeSchema.safeParse('999999').success).toBe(true);
  });

  it('rejects non-digit codes', () => {
    expect(totpCodeSchema.safeParse('abcdef').success).toBe(false);
    expect(totpCodeSchema.safeParse('12345a').success).toBe(false);
  });

  it('rejects codes with wrong length', () => {
    expect(totpCodeSchema.safeParse('12345').success).toBe(false);
    expect(totpCodeSchema.safeParse('1234567').success).toBe(false);
  });

  fcTest.prop([validTotpArb])('PBT: valid TOTP codes always pass', (code) => {
    expect(totpCodeSchema.safeParse(code).success).toBe(true);
  });

  fcTest.prop([fc.string().filter((s) => !/^\d{6}$/.test(s.trim()))])(
    'PBT: non-6-digit strings always fail',
    (code) => {
      expect(totpCodeSchema.safeParse(code).success).toBe(false);
    }
  );
});





describe('titleSchema', () => {
  it('accepts valid titles', () => {
    expect(titleSchema.safeParse('Hello World').success).toBe(true);
    expect(titleSchema.safeParse('abc').success).toBe(true);
  });

  it('rejects titles shorter than 3 characters after trim', () => {
    expect(titleSchema.safeParse('ab').success).toBe(false);
    expect(titleSchema.safeParse('  a ').success).toBe(false);
  });

  it('rejects titles exceeding 200 characters', () => {
    expect(titleSchema.safeParse('a'.repeat(201)).success).toBe(false);
  });
});





describe('excerptSchema', () => {
  it('accepts valid excerpts', () => {
    expect(excerptSchema.safeParse('A short summary').success).toBe(true);
    expect(excerptSchema.safeParse(undefined).success).toBe(true);
  });

  it('rejects excerpts exceeding 500 characters', () => {
    expect(excerptSchema.safeParse('a'.repeat(501)).success).toBe(false);
  });
});





describe('contentBodySchema', () => {
  it('accepts valid content', () => {
    expect(contentBodySchema.safeParse('Hello world, this is content.').success).toBe(true);
  });

  it('rejects content shorter than 10 characters after trim', () => {
    expect(contentBodySchema.safeParse('short').success).toBe(false);
  });

  it('rejects content exceeding 50000 characters', () => {
    expect(contentBodySchema.safeParse('a'.repeat(50001)).success).toBe(false);
  });
});





describe('iso8601DateSchema', () => {
  it('accepts valid ISO 8601 dates', () => {
    const validDates = [
      '2026-01-15',
      '2026-01-15T10:30:00Z',
      '2026-01-15T10:30:00.000Z',
      '2026-01-15T10:30:00+05:00',
    ];
    for (const date of validDates) {
      expect(iso8601DateSchema.safeParse(date).success).toBe(true);
    }
  });

  it('rejects invalid date strings', () => {
    const invalidDates = [
      'not-a-date',
      '2026-13-01', 
      '',
    ];
    for (const date of invalidDates) {
      expect(iso8601DateSchema.safeParse(date).success).toBe(false);
    }
  });
});





describe('timezoneSchema', () => {
  it('accepts valid IANA timezone identifiers', () => {
    const validTimezones = [
      'America/New_York',
      'Europe/London',
      'Asia/Tokyo',
    ];
    for (const tz of validTimezones) {
      expect(timezoneSchema.safeParse(tz).success).toBe(true);
    }
  });

  it('rejects invalid timezone strings', () => {
    const invalidTimezones = ['UTC', 'EST', 'not/valid/tz', ''];
    for (const tz of invalidTimezones) {
      expect(timezoneSchema.safeParse(tz).success).toBe(false);
    }
  });
});





describe('rruleSchema', () => {
  it('accepts valid RRULE strings', () => {
    const validRules = [
      'FREQ=DAILY',
      'FREQ=WEEKLY;BYDAY=MO,WE,FR',
      'FREQ=MONTHLY;BYMONTHDAY=15',
      'FREQ=YEARLY;BYMONTH=12',
    ];
    for (const rule of validRules) {
      expect(rruleSchema.safeParse(rule).success).toBe(true);
    }
  });

  it('rejects invalid RRULE strings', () => {
    expect(rruleSchema.safeParse('DAILY').success).toBe(false);
    expect(rruleSchema.safeParse('').success).toBe(false);
    expect(rruleSchema.safeParse('FREQ=HOURLY').success).toBe(false);
  });
});





describe('seoTitleSchema', () => {
  it('accepts titles within 70 chars', () => {
    expect(seoTitleSchema.safeParse('A Good SEO Title').success).toBe(true);
    expect(seoTitleSchema.safeParse(undefined).success).toBe(true);
  });

  it('rejects titles exceeding 70 characters', () => {
    expect(seoTitleSchema.safeParse('a'.repeat(71)).success).toBe(false);
  });
});

describe('seoDescriptionSchema', () => {
  it('accepts descriptions within 160 chars', () => {
    expect(seoDescriptionSchema.safeParse('A brief page description.').success).toBe(true);
    expect(seoDescriptionSchema.safeParse(undefined).success).toBe(true);
  });

  it('rejects descriptions exceeding 160 characters', () => {
    expect(seoDescriptionSchema.safeParse('a'.repeat(161)).success).toBe(false);
  });
});

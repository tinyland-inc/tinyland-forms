
















import { describe, it, expect } from 'vitest';
import { test as fcTest } from '@fast-check/vitest';
import fc from 'fast-check';
import {
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
} from '../src/helpers.js';





describe('slugify', () => {
  it('converts to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('replaces non-alphanumeric with hyphens', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
    expect(slugify('test@#$%value')).toBe('test-value');
  });

  it('trims leading/trailing hyphens', () => {
    expect(slugify('--hello--')).toBe('hello');
    expect(slugify('!@#hello!@#')).toBe('hello');
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('hello   world')).toBe('hello-world');
    expect(slugify('a---b')).toBe('a-b');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('handles string with only special characters', () => {
    expect(slugify('!@#$%')).toBe('');
  });

  fcTest.prop([fc.string()])('PBT: output only contains [a-z0-9-] or is empty', (input) => {
    const result = slugify(input);
    expect(result).toMatch(/^[a-z0-9-]*$/);
  });

  fcTest.prop([fc.string()])('PBT: no leading or trailing hyphens', (input) => {
    const result = slugify(input);
    if (result.length > 0) {
      expect(result[0]).not.toBe('-');
      expect(result[result.length - 1]).not.toBe('-');
    }
  });

  fcTest.prop([fc.string()])('PBT: deterministic (same input = same output)', (input) => {
    expect(slugify(input)).toBe(slugify(input));
  });
});





describe('parseCommaSeparated', () => {
  it('parses comma-separated values', () => {
    expect(parseCommaSeparated('foo, bar, baz')).toEqual(['foo', 'bar', 'baz']);
  });

  it('trims whitespace from each value', () => {
    expect(parseCommaSeparated('  foo  ,  bar  ')).toEqual(['foo', 'bar']);
  });

  it('filters out empty entries', () => {
    expect(parseCommaSeparated('foo,,bar,,')).toEqual(['foo', 'bar']);
    expect(parseCommaSeparated(',,')).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    expect(parseCommaSeparated('')).toEqual([]);
  });

  fcTest.prop([fc.string()])('PBT: result items never contain leading/trailing whitespace', (input) => {
    const result = parseCommaSeparated(input);
    for (const item of result) {
      expect(item).toBe(item.trim());
      expect(item.length).toBeGreaterThan(0);
    }
  });
});





describe('calculateReadingTime', () => {
  it('returns 1 for empty content', () => {
    expect(calculateReadingTime('')).toBe(1);
  });

  it('returns 1 for short content', () => {
    expect(calculateReadingTime('Hello world')).toBe(1);
  });

  it('calculates correctly for 200 words (1 minute)', () => {
    const twoHundredWords = Array(200).fill('word').join(' ');
    expect(calculateReadingTime(twoHundredWords)).toBe(1);
  });

  it('calculates correctly for 201 words (2 minutes)', () => {
    const words = Array(201).fill('word').join(' ');
    expect(calculateReadingTime(words)).toBe(2);
  });

  it('rounds up fractional minutes', () => {
    const threeHundredWords = Array(300).fill('word').join(' ');
    expect(calculateReadingTime(threeHundredWords)).toBe(2);
  });

  fcTest.prop([fc.string()])('PBT: always returns >= 1', (content) => {
    expect(calculateReadingTime(content)).toBeGreaterThanOrEqual(1);
  });
});





describe('validatePasswordStrength', () => {
  it('returns full score for strong password', () => {
    const result = validatePasswordStrength('MyP@ssw0rd123!');
    expect(result.score).toBe(5);
    expect(result.total).toBe(5);
    expect(result.requirements.lowercase).toBe(true);
    expect(result.requirements.uppercase).toBe(true);
    expect(result.requirements.digit).toBe(true);
    expect(result.requirements.special).toBe(true);
    expect(result.requirements.length).toBe(true);
  });

  it('returns 0 for empty password', () => {
    const result = validatePasswordStrength('');
    expect(result.score).toBe(0);
  });

  it('detects missing lowercase', () => {
    const result = validatePasswordStrength('ABCDEFGH1234!');
    expect(result.requirements.lowercase).toBe(false);
  });

  it('detects missing uppercase', () => {
    const result = validatePasswordStrength('abcdefgh1234!');
    expect(result.requirements.uppercase).toBe(false);
  });

  it('detects missing digit', () => {
    const result = validatePasswordStrength('MyPassword!!!');
    expect(result.requirements.digit).toBe(false);
  });

  it('detects missing special character', () => {
    const result = validatePasswordStrength('MyPassword1234');
    expect(result.requirements.special).toBe(false);
  });

  it('detects insufficient length', () => {
    const result = validatePasswordStrength('MyP@1');
    expect(result.requirements.length).toBe(false);
  });

  fcTest.prop([fc.string()])('PBT: score is always between 0 and total', (password) => {
    const result = validatePasswordStrength(password);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(result.total);
    expect(result.total).toBe(5);
  });

  fcTest.prop([fc.string()])('PBT: deterministic (same input = same output)', (password) => {
    const r1 = validatePasswordStrength(password);
    const r2 = validatePasswordStrength(password);
    expect(r1).toEqual(r2);
  });
});





describe('formatTotpCode', () => {
  it('removes spaces', () => {
    expect(formatTotpCode('123 456')).toBe('123456');
  });

  it('removes hyphens', () => {
    expect(formatTotpCode('123-456')).toBe('123456');
  });

  it('removes mixed whitespace and hyphens', () => {
    expect(formatTotpCode('1 2 3-4-5-6')).toBe('123456');
  });

  it('preserves digits in clean codes', () => {
    expect(formatTotpCode('123456')).toBe('123456');
  });

  fcTest.prop([fc.string()])('PBT: output never contains spaces or hyphens', (code) => {
    const result = formatTotpCode(code);
    expect(result).not.toMatch(/[\s-]/);
  });
});





describe('isValidHandle', () => {
  it('accepts valid handles', () => {
    expect(isValidHandle('alice')).toBe(true);
    expect(isValidHandle('bob_123')).toBe(true);
    expect(isValidHandle('user-name')).toBe(true);
    expect(isValidHandle('abc')).toBe(true);
  });

  it('rejects handles shorter than 3 characters', () => {
    expect(isValidHandle('ab')).toBe(false);
  });

  it('rejects handles longer than 20 characters', () => {
    expect(isValidHandle('a'.repeat(21))).toBe(false);
  });

  it('rejects uppercase', () => {
    expect(isValidHandle('Alice')).toBe(false);
  });

  it('rejects special characters', () => {
    expect(isValidHandle('user@name')).toBe(false);
    expect(isValidHandle('user.name')).toBe(false);
  });
});





describe('sanitizeUsername', () => {
  it('converts to lowercase', () => {
    expect(sanitizeUsername('Alice')).toBe('alice');
  });

  it('trims whitespace', () => {
    expect(sanitizeUsername('  alice  ')).toBe('alice');
  });

  it('removes invalid characters', () => {
    expect(sanitizeUsername('alice-bob')).toBe('alicebob');
    expect(sanitizeUsername('user@name!')).toBe('username');
  });

  it('preserves underscores', () => {
    expect(sanitizeUsername('alice_bob')).toBe('alice_bob');
  });

  fcTest.prop([fc.string()])('PBT: output only contains [a-z0-9_]', (input) => {
    const result = sanitizeUsername(input);
    expect(result).toMatch(/^[a-z0-9_]*$/);
  });
});





describe('isValidSlug', () => {
  it('accepts valid slugs', () => {
    expect(isValidSlug('hello-world')).toBe(true);
    expect(isValidSlug('a')).toBe(true);
    expect(isValidSlug('123')).toBe(true);
  });

  it('rejects empty string', () => {
    expect(isValidSlug('')).toBe(false);
  });

  it('rejects slugs with uppercase', () => {
    expect(isValidSlug('Hello')).toBe(false);
  });

  it('rejects slugs with underscores', () => {
    expect(isValidSlug('hello_world')).toBe(false);
  });

  it('rejects slugs exceeding 100 characters', () => {
    expect(isValidSlug('a'.repeat(101))).toBe(false);
  });
});





describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user+tag@domain.org')).toBe(true);
  });

  it('rejects strings without @', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
  });

  it('rejects strings without domain', () => {
    expect(isValidEmail('user@')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });
});





describe('validatePasswordMatch', () => {
  it('returns true for matching passwords', () => {
    expect(validatePasswordMatch('MyP@ssword123', 'MyP@ssword123')).toBe(true);
  });

  it('trims and compares', () => {
    expect(validatePasswordMatch('  password  ', '  password  ')).toBe(true);
    expect(validatePasswordMatch('password  ', '  password')).toBe(true);
  });

  it('returns false for different passwords', () => {
    expect(validatePasswordMatch('password1', 'password2')).toBe(false);
  });

  it('handles empty strings', () => {
    expect(validatePasswordMatch('', '')).toBe(true);
  });

  fcTest.prop([fc.string()])('PBT: password always matches itself', (password) => {
    expect(validatePasswordMatch(password, password)).toBe(true);
  });
});





describe('Unicode edge cases', () => {
  it('slugify handles unicode characters', () => {
    expect(slugify('cafe')).toBe('cafe');
    
    const result = slugify('hello world');
    expect(result).toMatch(/^[a-z0-9-]*$/);
  });

  it('sanitizeUsername strips non-ASCII characters', () => {
    const result = sanitizeUsername('alice');
    expect(result).toMatch(/^[a-z0-9_]*$/);
  });

  it('parseCommaSeparated handles unicode in values', () => {
    const result = parseCommaSeparated('hello, world');
    expect(result.length).toBeGreaterThanOrEqual(1);
    for (const item of result) {
      expect(item.length).toBeGreaterThan(0);
    }
  });
});





describe('Extremely long inputs', () => {
  it('slugify handles very long strings', () => {
    const longStr = 'word '.repeat(10000);
    const result = slugify(longStr);
    expect(typeof result).toBe('string');
    expect(result).toMatch(/^[a-z0-9-]*$/);
  });

  it('parseCommaSeparated handles very long strings', () => {
    const longStr = Array(1000).fill('tag').join(',');
    const result = parseCommaSeparated(longStr);
    expect(result.length).toBe(1000);
  });

  it('validatePasswordStrength handles very long passwords', () => {
    const longPw = 'Aa1!' + 'x'.repeat(10000);
    const result = validatePasswordStrength(longPw);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });
});

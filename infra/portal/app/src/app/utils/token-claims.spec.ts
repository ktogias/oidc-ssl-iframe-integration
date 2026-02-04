import { describe, expect, it } from 'vitest';
import { buildDisplayName } from './token-claims';

describe('buildDisplayName', () => {
  it('returns full name when available', () => {
    expect(buildDisplayName({ given_name: 'Demo', family_name: 'User' })).toBe('Demo User');
  });

  it('falls back to username when names are missing', () => {
    expect(buildDisplayName({ preferred_username: 'demo.user' })).toBe('demo.user');
  });

  it('uses default fallback when no claims are present', () => {
    expect(buildDisplayName({})).toBe('unknown.user');
  });
});

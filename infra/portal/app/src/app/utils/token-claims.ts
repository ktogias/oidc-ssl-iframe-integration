export interface TokenClaims {
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
}

export function buildDisplayName(claims: TokenClaims): string {
  const first = claims.given_name?.trim();
  const last = claims.family_name?.trim();
  if (first || last) {
    return [first, last].filter(Boolean).join(' ').trim();
  }
  return claims.preferred_username ?? 'unknown.user';
}

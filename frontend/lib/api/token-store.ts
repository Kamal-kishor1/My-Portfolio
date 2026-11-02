/**
 * Holds the short-lived JWT access token in memory only.
 *
 * Deliberately NOT localStorage or sessionStorage — both are readable by
 * any injected script. The access token lives in JS memory (lost on full
 * page reload) and is restored via the httpOnly refresh cookie on mount.
 * The refresh token itself never touches JS.
 */

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

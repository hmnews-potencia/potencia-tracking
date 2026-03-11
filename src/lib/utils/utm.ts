/**
 * Sanitizes a UTM parameter value.
 * Truncates to 200 characters and removes special characters,
 * allowing only alphanumeric, underscores, and hyphens.
 */
export function sanitizeUtmParam(value: string): string {
  return value.substring(0, 200).replace(/[^a-zA-Z0-9_\-]/g, '');
}

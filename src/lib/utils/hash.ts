import crypto from 'crypto';

/**
 * Hashes an IP address with a salt using SHA-256, truncated to 16 characters.
 * Used for privacy-compliant IP tracking without storing raw IPs.
 */
export function hashIp(ip: string, salt: string): string {
  return crypto
    .createHash('sha256')
    .update(ip + salt)
    .digest('hex')
    .substring(0, 16);
}

/**
 * Securely hashes an IP address using SHA-256 via Web Crypto API.
 * Designed to anonymize IPs to support GDPR/privacy compliance.
 *
 * @param ip Optional clear-text IP address
 * @returns SHA-256 hashed string or 'unknown'
 */
export async function hashIp(ip: string | null | undefined): Promise<string> {
  if (!ip || ip.trim() === '' || ip === 'unknown') {
    return 'unknown';
  }

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(ip.trim());
    
    // Use Web Crypto API (supported natively in Next.js Edge and Node environments)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // Convert ArrayBuffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  } catch (error) {
    console.error('Failed to hash IP:', error);
    return 'unknown';
  }
}

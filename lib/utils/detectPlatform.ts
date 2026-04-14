/**
 * Analyzes a URL and extracts its logical platform identifier.
 * Fast, pure, deterministic.
 */
export function detectPlatform(url: string | null | undefined): string {
  if (!url) return 'unknown';

  try {
    const parsedUrl = new URL(url);
    // Remove "www." if present
    const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');

    // Common standard names matching
    if (hostname.includes('instagram.com')) return 'instagram';
    if (hostname.includes('wa.me') || hostname.includes('api.whatsapp.com') || hostname.includes('whatsapp.com')) return 'whatsapp';
    if (hostname.includes('linkedin.com')) return 'linkedin';
    if (hostname.includes('x.com') || hostname.includes('twitter.com')) return 'x';
    if (hostname.includes('facebook.com') || hostname.includes('fb.com')) return 'facebook';
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube';
    if (hostname.includes('tiktok.com')) return 'tiktok';
    if (hostname.includes('github.com')) return 'github';
    // Add more as needed

    // Fallback for custom links
    return 'custom';
  } catch (err) {
    // URL parsing failed
    return 'unknown';
  }
}

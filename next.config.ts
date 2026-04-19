import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking — disallow embedding in iframes from other origins
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Stop sending referrer to cross-origin destinations
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Force HTTPS for 1 year (only active in production behind HTTPS)
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  // Restrict browser features not needed by the app
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  // Content Security Policy
  // - default-src 'self': block all unlisted sources by default
  // - script-src: allow self + Next.js inline scripts (required for hydration)
  // - style-src: allow self + inline styles (Tailwind injects these)
  // - img-src: allow self, Cloudinary (user avatars/banners), and data URIs
  // - connect-src: allow self + Supabase API calls
  // - font-src: allow self + Google Fonts
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://res.cloudinary.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/signup',
        destination: '/register',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;

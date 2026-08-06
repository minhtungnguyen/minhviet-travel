// Media Library assets (Tour gallery, News featured images, SEO OG
// images) are served from Supabase Storage's public bucket — `next/image`
// refuses to optimize an unconfigured remote host, so its hostname must be
// allowlisted here. Derived from the same env var the app already uses to
// talk to Supabase, not hardcoded, so this doesn't drift across environments.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : undefined

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: supabaseHostname
      ? [{ protocol: 'https', hostname: supabaseHostname, pathname: '/storage/v1/object/public/**' }]
      : [],
  },
  async redirects() {
    return [
      // /tickets was the placeholder route before the real Vé vui chơi
      // module shipped (docs/mv-ticket/01-product-scope.md §5) — already
      // indexed via sitemap.ts, so redirect rather than break the URL.
      { source: '/tickets', destination: '/ve-vui-choi', permanent: true },
    ]
  },
}

export default nextConfig

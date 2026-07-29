/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
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

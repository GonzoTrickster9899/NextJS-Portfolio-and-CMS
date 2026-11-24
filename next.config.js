/**
 * Remote image pattern for Neon Object Storage.
 *
 * Public objects are served path-style from `<endpoint>/<bucket>/<key>`, where the
 * endpoint looks like https://<branch-id>.storage.c-<n>.<region>.aws.neon.tech.
 * When the storage env vars are available at build time the pattern is pinned to
 * that exact host and bucket; otherwise it falls back to any Neon storage host.
 */
function neonStoragePattern() {
  const bucket = process.env.NEON_STORAGE_BUCKET || 'portfolio-images'
  const endpoint = process.env.NEON_STORAGE_ENDPOINT?.replace(/\/+$/, '')
  const base = process.env.NEON_STORAGE_PUBLIC_URL || (endpoint && `${endpoint}/${bucket}`)

  if (base) {
    const url = new URL(base)
    return {
      protocol: url.protocol.replace(':', ''),
      hostname: url.hostname,
      pathname: `${url.pathname.replace(/\/+$/, '')}/**`,
    }
  }

  return { protocol: 'https', hostname: '**.aws.neon.tech', pathname: '/**' }
}

const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      neonStoragePattern(),
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '6mb',
    },
  },
}

module.exports = nextConfig

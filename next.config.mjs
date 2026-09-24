/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow the v0 preview iframe (served from *.vusercontent.net) to talk to the
  // Next.js dev server for HMR and other dev resources.
  allowedDevOrigins: [
    "*.vusercontent.net",
    "*.v0.app",
    "*.v0.dev",
    "*.vercel.run",
  ],
}

export default nextConfig

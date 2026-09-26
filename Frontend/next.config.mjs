/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  poweredByHeader: false,
  output: "standalone"
};
export default nextConfig;

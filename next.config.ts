import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=()",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
  },
];

if (
  process.env.VERCEL_ENV === "production" ||
  process.env.ENABLE_HSTS === "true"
) {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  });
}

const nextConfig: NextConfig = {
  // Drie.js-gerelateerde packages worden getranspileerd door Next zelf,
  // verdere configuratie is voor deze fase niet nodig.
  reactStrictMode: true,
  // Geen dev-badge linksonder tijdens ontwikkelen/screenshots;
  // heeft geen effect op de productie-build.
  devIndicators: false,
  async redirects() {
    return [
      {
        // /cv was vroeger een duplicate van de homepage; redirect vangt
        // eventueel al gedeelde links op.
        source: "/cv",
        destination: "/",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

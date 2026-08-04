import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Emits .next/standalone with a self-contained server and only the modules
   * actually imported. This is what the Docker image runs on the VPS.
   */
  output: "standalone",
  poweredByHeader: false,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },

  async redirects() {
    return [
      { source: "/sobre", destination: "/about", permanent: true },
      {
        source: "/projetos/:path*",
        destination: "/projects/:path*",
        permanent: true,
      },
      {
        source: "/admin/projetos/novo",
        destination: "/admin/projects/new",
        permanent: true,
      },
      {
        source: "/admin/projetos/:path*",
        destination: "/admin/projects/:path*",
        permanent: true,
      },
      {
        source: "/admin/tecnologias",
        destination: "/admin/technologies",
        permanent: true,
      },
      {
        source: "/admin/perfil",
        destination: "/admin/profile",
        permanent: true,
      },
      {
        source: "/admin/conta",
        destination: "/admin/account",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

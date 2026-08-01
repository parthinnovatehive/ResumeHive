/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/resumes/:path*",
        destination: "http://127.0.0.1:8000/resumes/:path*",
      },
      {
        source: "/api/jobs/:path*",
        destination: "http://127.0.0.1:8000/jobs/:path*",
      },
      {
        source: "/api/linkedin/:path*",
        destination: "http://127.0.0.1:8000/linkedin/:path*",
      },
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;

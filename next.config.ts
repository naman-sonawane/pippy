import type { NextConfig } from "next";
import withPWA from '@ducanh2912/next-pwa';

const nextConfig: NextConfig = {
    turbopack: {}, // Silence webpack/turbopack warning in Next.js 16
};

export default withPWA({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    workboxOptions: {
        skipWaiting: true,
    },
})(nextConfig);
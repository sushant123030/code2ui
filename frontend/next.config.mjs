/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: process.cwd().replace(/\/frontend$/, ''),
  },
};

export default nextConfig;

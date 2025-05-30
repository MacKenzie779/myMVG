/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Add this line to enable static export
  //basePath: '/~momi/era', // Set your base path here
  basePath: process.env.NEXT_PUBLIC_BASEPATH
};

export default nextConfig;
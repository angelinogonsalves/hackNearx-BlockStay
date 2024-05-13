/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        API_KEY: process.env.API_KEY,
        API_SECRET: process.env.API_SECRET,
        API_JWT: process.env.API_JWT
    }
};

export default nextConfig;

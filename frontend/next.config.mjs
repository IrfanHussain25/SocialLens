/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // This tells Next.js: "Do not exclude these packages from the serverless build!"
  serverExternalPackages: [
    '@aws-sdk/client-s3',
    '@aws-sdk/s3-request-presigner',
    '@aws-sdk/client-dynamodb',
    '@aws-sdk/lib-dynamodb',
    '@aws-sdk/client-sqs'
  ],
  // If you are on an older Next.js version (13 or early 14), you might need the experimental flag instead:
  experimental: {
    serverComponentsExternalPackages: [
      '@aws-sdk/client-s3',
      '@aws-sdk/s3-request-presigner',
      '@aws-sdk/client-dynamodb',
      '@aws-sdk/lib-dynamodb',
      '@aws-sdk/client-sqs'
    ]
  }
};

export default nextConfig;
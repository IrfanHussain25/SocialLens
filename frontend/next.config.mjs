// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   /* config options here */
//   reactStrictMode: false
// };

// export default nextConfig;




/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // This forces Next.js to bake the AWS SDK directly into your API routes
  // preventing Amplify's Turbopack from mangling the names with hashes.
  transpilePackages: [
    '@aws-sdk/client-s3',
    '@aws-sdk/s3-request-presigner',
    '@aws-sdk/client-dynamodb',
    '@aws-sdk/lib-dynamodb',
    '@aws-sdk/client-sqs'
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Bulletproof fallback: Strip AWS SDK out of externals
      config.externals = (config.externals || []).filter(
        (ext) => !String(ext).includes('@aws-sdk')
      );
    }
    return config;
  },
};

export default nextConfig;
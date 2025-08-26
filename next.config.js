/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false, // enable browser source map generation during the production build

  // Configure pageExtensions to include md and mdx
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],

  experimental: {
    // appDir: true,
  },

  // fix all before production. Now it slow the develop speed.
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  typescript: {
    // https://nextjs.org/docs/api-reference/next.config.js/ignoring-typescript-errors
    ignoreBuildErrors: true,
  },

  images: {
    domains: [
      'upload.dify.ai', // ← 送信直後のファイル表示に必要
      'cdn.dify.ai',    // ← Difyが将来CDNを使うケースに備えて
      'files.dify.ai',  // ← Visionや他LLMが返す場合の画像ドメイン
      'api.dify.ai',    // ← 応答中の画像埋め込みやアイコン読み込み対策
    ],
  },
}

module.exports = nextConfig

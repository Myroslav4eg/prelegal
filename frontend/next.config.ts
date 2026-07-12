import type { NextConfig } from "next";
import path from "path";

// app/page.tsx reads ../templates/Mutual-NDA.md via fs at request time. That
// file lives outside this Next.js project root (a sibling to frontend/), so
// both the dev bundler and production output tracing need to be told about
// the wider root or the deployed server will throw ENOENT even though
// `next dev` works fine. Next.js requires these two roots to match.
const repoRoot = path.join(__dirname, "..");

const nextConfig: NextConfig = {
  outputFileTracingRoot: repoRoot,
  outputFileTracingIncludes: {
    "/": ["../templates/Mutual-NDA.md"],
  },
  turbopack: {
    root: repoRoot,
  },
};

export default nextConfig;

import type { NextConfig } from "next";
import path from "path";

// app/page.tsx reads every file in ../templates/ via fs at request time. That
// directory lives outside this Next.js project root (a sibling to frontend/),
// so both the dev bundler and production output tracing need to be told
// about the wider root or the deployed server will throw ENOENT even though
// `next dev` works fine. Next.js requires these two roots to match.
const repoRoot = path.join(__dirname, "..");

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  outputFileTracingRoot: repoRoot,
  outputFileTracingIncludes: {
    "/": ["../templates/*.md"],
  },
  turbopack: {
    root: repoRoot,
  },
};

export default nextConfig;

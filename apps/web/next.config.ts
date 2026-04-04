import type { NextConfig } from "next";
import { fileURLToPath } from "url";
import path from "path";
import createNextIntlPlugin from "next-intl/plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: ["@marriage/shared"],
  serverExternalPackages: ["postgres", "sharp"],
  allowedDevOrigins: ["http://10.20.0.20:3333"],
};

export default withNextIntl(nextConfig);

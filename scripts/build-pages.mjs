import { build } from "vite";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const project = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const output = path.join(project, "pages-dist");
await build({
  configFile: false,
  root: path.join(project, "web"),
  publicDir: path.join(project, "public"),
  base: process.env.AFTERWORK_PAGES_BASE || "./",
  resolve: {
    alias: [
      { find: /^next\/link$/, replacement: path.join(project, "web/link.tsx") },
      { find: /^next\/navigation$/, replacement: path.join(project, "web/navigation.ts") },
      { find: "@", replacement: project },
    ],
  },
  define: { "process.env.NEXT_PUBLIC_AFTERWORK_STATIC": JSON.stringify("true") },
  css: { postcss: path.join(project, "postcss.config.mjs") },
  build: { outDir: output, emptyOutDir: true },
});
fs.writeFileSync(path.join(output, ".nojekyll"), "");

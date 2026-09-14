import path from "node:path";
import { fileURLToPath } from "node:url";
export const projectRoot = fileURLToPath(new URL("../", import.meta.url));
process.env.CLOUDFLARE_CF_FETCH_ENABLED ??= "false";
process.env.WRANGLER_SEND_METRICS ??= "false";
process.env.WRANGLER_WRITE_LOGS ??= "false";
process.env.WRANGLER_LOG_PATH ??= path.join(projectRoot, ".runtime/logs");
process.env.WRANGLER_REGISTRY_PATH ??= path.join(projectRoot, ".runtime/registry");
process.env.MINIFLARE_REGISTRY_PATH ??= path.join(projectRoot, ".runtime/registry");

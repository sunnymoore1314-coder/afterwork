import { env } from "cloudflare:workers";
export function GET(){const vars=env as unknown as Record<string,string|undefined>;return Response.json({mode:vars.OPENAI_API_KEY?"ai":"example"},{headers:{"Cache-Control":"no-store"}})}

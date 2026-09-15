import { draftSchema, type RecoveryInput } from "./types";
import { attachTimeline } from "./planner";
import { manualPrompt, parseManualResponse } from "./manual";
import { loadPreferences } from "./preferences";

export type PlannerProvider = "manual" | "openai" | "deepseek" | "openrouter" | "custom";
export type ProviderSettings = { provider: PlannerProvider; apiKey: string; model: string; baseUrl: string };
const storageKey = "afterwork-provider-settings";
const defaults: ProviderSettings = { provider: "manual", apiKey: "", model: "", baseUrl: "" };

export function loadProviderSettings(): ProviderSettings {
  if (typeof window === "undefined") return defaults;
  try {
    const value = JSON.parse(sessionStorage.getItem(storageKey) || "{}");
    const provider: PlannerProvider = ["manual", "openai", "deepseek", "openrouter", "custom"].includes(value.provider) ? value.provider : "manual";
    return { provider, apiKey: typeof value.apiKey === "string" ? value.apiKey : "", model: typeof value.model === "string" ? value.model : "", baseUrl: typeof value.baseUrl === "string" ? value.baseUrl : "" };
  } catch { return defaults; }
}
export function saveProviderSettings(settings: ProviderSettings) { sessionStorage.setItem(storageKey, JSON.stringify(settings)); window.dispatchEvent(new Event("afterwork-provider-change")); }
export function clearProviderSettings() { sessionStorage.removeItem(storageKey); window.dispatchEvent(new Event("afterwork-provider-change")); }
export function providerEndpoint(settings: ProviderSettings) {
  if (settings.provider === "openai") return "https://api.openai.com/v1/chat/completions";
  if (settings.provider === "deepseek") return "https://api.deepseek.com/chat/completions";
  if (settings.provider === "openrouter") return "https://openrouter.ai/api/v1/chat/completions";
  return settings.baseUrl.replace(/\/$/, "") + "/chat/completions";
}
export function providerDefaultModel(provider: PlannerProvider) {
  if (provider === "openai") return "gpt-4.1-mini";
  if (provider === "deepseek") return "deepseek-flash";
  if (provider === "openrouter") return "openrouter/free";
  return "";
}
function requestHeaders(settings: ProviderSettings) {
  const headers: Record<string,string> = { "Content-Type": "application/json", Authorization: `Bearer ${settings.apiKey.trim()}` };
  if (settings.provider === "openrouter") {
    headers["X-Title"] = "Afterwork";
    if (typeof location !== "undefined" && location.origin && location.origin !== "null") headers["HTTP-Referer"] = location.origin;
  }
  return headers;
}

export async function requestProviderPlan(input: RecoveryInput, settings: ProviderSettings, signal: AbortSignal) {
  if (settings.provider === "manual" || !settings.apiKey.trim()) throw new Error("API_NOT_CONFIGURED");
  const model = settings.model.trim() || providerDefaultModel(settings.provider); if (!model) throw new Error("MODEL_REQUIRED");
  const response = await fetch(providerEndpoint(settings), { method: "POST", headers: requestHeaders(settings), signal, body: JSON.stringify({ model, temperature: 0.7, response_format: { type: "json_object" }, messages: [{ role: "user", content: manualPrompt(input, document.documentElement.lang.startsWith("zh") ? "zh" : "en",loadPreferences()) }] }) });
  let payload: any; try { payload = await response.json(); } catch { throw new Error("INVALID_PROVIDER_RESPONSE"); }
  if (!response.ok) throw new Error(typeof payload?.error?.message === "string" ? payload.error.message : `HTTP ${response.status}`);
  const content = payload?.choices?.[0]?.message?.content; if (typeof content !== "string") throw new Error("INVALID_PROVIDER_RESPONSE");
  return { plan: attachTimeline(draftSchema.parse(parseManualResponse(content)), input), context: input, source: "ai" as const };
}
export async function testProvider(settings: ProviderSettings, signal: AbortSignal) {
  if (!settings.apiKey.trim()) throw new Error("API_NOT_CONFIGURED"); const model = settings.model.trim() || providerDefaultModel(settings.provider); if (!model) throw new Error("MODEL_REQUIRED");
  const response = await fetch(providerEndpoint(settings), { method: "POST", headers: requestHeaders(settings), signal, body: JSON.stringify({ model, max_tokens: 8, messages: [{ role: "user", content: "Reply with OK" }] }) });
  if (!response.ok) { let detail=""; try { const payload=await response.json() as any; detail=typeof payload?.error?.message==="string"?payload.error.message:"" } catch {} throw new Error(detail||`HTTP ${response.status}`); }
}

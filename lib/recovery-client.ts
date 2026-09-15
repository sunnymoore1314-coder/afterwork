import type { RecoveryInput } from "./types";
import { loadProviderSettings, requestProviderPlan } from "./provider";

// GitHub Pages has no server. This flag is replaced at build time.
const staticDemo = process.env.NEXT_PUBLIC_AFTERWORK_STATIC === "true";

export async function getPlannerMode(signal: AbortSignal) {
  if (staticDemo) return { mode: loadProviderSettings().provider === "manual" ? "manual" : "ai" };
  const response = await fetch("/api/status", { signal });
  return response.ok ? response.json() : null;
}

export async function requestRecoveryPlan(context: RecoveryInput, signal: AbortSignal): Promise<unknown> {
  if (staticDemo) {
    return requestProviderPlan(context, loadProviderSettings(), signal);
  }
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify(context),
  });
  const body: unknown = await response.json();
  if (!response.ok) {
    throw new Error(
      body && typeof body === "object" && "error" in body && typeof body.error === "string"
        ? body.error : "We couldn’t make a plan. Please try again."
    );
  }
  return body;
}

export function usesManualPlanner() {
  return staticDemo && loadProviderSettings().provider === "manual";
}

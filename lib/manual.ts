import { slotDurations } from "./planner";
import { systemPrompt } from "./prompts";
import type { RecoveryInput } from "./types";

export function manualPrompt(input: RecoveryInput) {
  const language = /[\u3400-\u9fff]/.test(input.note)
    ? "Simplified Chinese"
    : "the same language as the user's note, or English if it is empty";
  const durations = slotDurations[input.minutes];
  return `${systemPrompt}

Create a recovery plan for this context:
${JSON.stringify(input, null, 2)}

Return only valid JSON. Do not use Markdown fences or commentary. Use ${language}.
The JSON must have exactly this shape:
{
  "title": "short title",
  "goal": "one gentle intention",
  "summary": "brief summary",
  "steps": [
    {"activity": "one feasible activity", "reason": "why it helps"}
  ],
  "final_message": "short closing message"
}

Return exactly ${durations.length} steps, in order. Their durations are ${durations.join(", ")} minutes. Do not include time fields; Afterwork calculates them.`;
}

export function parseManualResponse(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(trimmed);
  } catch {}
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1));
  throw new Error("No valid JSON object was found in the AI response.");
}

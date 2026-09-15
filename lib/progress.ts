import { envelopeSchema, type PlanEnvelope } from "./types";

export type StepStatus="pending"|"done"|"skipped";
export type ActivePlan={envelope:PlanEnvelope;statuses:StepStatus[];startedAt:string};
const key="afterwork-active-plan";

export function startActivePlan(envelope:PlanEnvelope){const value:ActivePlan={envelope,statuses:envelope.plan.steps.map(()=>"pending"),startedAt:new Date().toISOString()};localStorage.setItem(key,JSON.stringify(value));return value}
export function readActivePlan():ActivePlan|null{try{const raw=JSON.parse(localStorage.getItem(key)||"null");if(!raw||!Array.isArray(raw.statuses)||typeof raw.startedAt!=="string")return null;const envelope=envelopeSchema.safeParse(raw.envelope);if(!envelope.success||raw.statuses.length!==envelope.data.plan.steps.length||raw.statuses.some((value:unknown)=>!['pending','done','skipped'].includes(String(value))))return null;return {envelope:envelope.data,statuses:raw.statuses,startedAt:raw.startedAt}}catch{return null}}
export function saveActivePlan(value:ActivePlan){localStorage.setItem(key,JSON.stringify(value))}
export function clearActivePlan(){localStorage.removeItem(key)}
export function planAsText(envelope:PlanEnvelope){const {plan}=envelope;return [plan.title,plan.goal,"",...plan.steps.flatMap((step,index)=>[`${index+1}. ${step.time}  ${step.activity}`,`   ${step.reason}`]),"",plan.final_message].join("\n")}

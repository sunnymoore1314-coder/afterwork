import { z } from "zod";
export const inputSchema=z.object({
 mood:z.enum(["exhausted","stressed","empty","restless","fine"]),
 minutes:z.union([z.literal(15),z.literal(30),z.literal(45),z.literal(60)]),
 budget:z.union([z.literal(0),z.literal(30),z.literal(100)]),
 preference:z.enum(["indoors","outside","either"]),
 start_time:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
 note:z.string().trim().max(600).default(""),
 city:z.string().trim().max(80).default(""),
 weather:z.string().trim().max(100).default("")
}).strict();
export type RecoveryInput=z.infer<typeof inputSchema>;
const shortText=(max:number)=>z.string().trim().min(1).max(max);
export const draftSchema=z.object({title:shortText(100),goal:shortText(180),summary:shortText(360),steps:z.array(z.object({activity:shortText(200),reason:shortText(240)}).strict()).min(1).max(4),final_message:shortText(200)}).strict();
export const planSchema=draftSchema.extend({steps:z.array(z.object({time:z.string().regex(/^\d{2}:\d{2}–\d{2}:\d{2}$/),activity:shortText(200),reason:shortText(240)}).strict()).min(1).max(4)});
export type PlanDraft=z.infer<typeof draftSchema>;
export type RecoveryPlan=z.infer<typeof planSchema>;
export const envelopeSchema=z.object({plan:planSchema,context:inputSchema,source:z.enum(["ai","manual","example"])});
export type PlanEnvelope=z.infer<typeof envelopeSchema>;

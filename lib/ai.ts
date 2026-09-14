import { draftSchema, type RecoveryInput } from "./types";
import { attachTimeline, slotDurations, usesChinese } from "./planner";
import { systemPrompt } from "./prompts";
export class PlannerError extends Error{constructor(public code:string){super(code)}}
const textProperty={type:"string"};
function responseSchema(count:number){return {type:"object",additionalProperties:false,properties:{title:textProperty,goal:textProperty,summary:textProperty,steps:{type:"array",minItems:count,maxItems:count,items:{type:"object",additionalProperties:false,properties:{activity:textProperty,reason:textProperty},required:["activity","reason"]}},final_message:textProperty},required:["title","goal","summary","steps","final_message"]}}
export async function generatePlan(input:RecoveryInput,key:string,model:string,requestFetch:typeof fetch=fetch){
 const slots=slotDurations[input.minutes];
 let response:Response;
 try{
 response=await requestFetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+key},signal:AbortSignal.timeout(42000),body:JSON.stringify({model,store:false,instructions:systemPrompt,input:JSON.stringify({context:input,language:usesChinese(input)?"Simplified Chinese":"English",activity_slots_minutes:slots}),max_output_tokens:1800,text:{format:{type:"json_schema",name:"afterwork_plan",strict:true,schema:responseSchema(slots.length)}}})});
 }catch(error){throw new PlannerError(error instanceof Error && (error.name==="TimeoutError"||error.name==="AbortError")?"TIMEOUT":"AI_UNAVAILABLE")}
 if(!response.ok)throw new PlannerError(response.status===429?"RATE_LIMIT":response.status===401||response.status===403?"CONFIGURATION":"AI_UNAVAILABLE");
 const payload=await response.json() as {status?:string,output?:{type:string,content?:{type:string,text?:string}[]}[]};
 if(payload.status!=="completed")throw new PlannerError("INCOMPLETE");
 const content=(payload.output??[]).filter(item=>item.type==="message").flatMap(item=>item.content??[]);
 if(content.some(item=>item.type==="refusal"))throw new PlannerError("REFUSED");
 const output=content.filter(item=>item.type==="output_text").map(item=>item.text??"").join("");
 try{return attachTimeline(draftSchema.parse(JSON.parse(output)),input)}catch{throw new PlannerError("INVALID_PLAN")}
}

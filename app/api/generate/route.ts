import { env } from "cloudflare:workers";
import { inputSchema } from "@/lib/types";
import { examplePlan } from "@/lib/planner";
import { generatePlan, PlannerError } from "@/lib/ai";
const errorMessages:Record<string,string>={TIMEOUT:"The plan took too long. Please try again.",RATE_LIMIT:"The planner is busy. Give it a moment, then try again.",CONFIGURATION:"The planner is temporarily unavailable. Please try later.",AI_UNAVAILABLE:"We couldn’t reach the planner. Please try again.",INCOMPLETE:"The plan wasn’t finished. Please try again.",REFUSED:"Try describing your evening in a different way.",INVALID_PLAN:"That plan didn’t come through correctly. Please try again."};
export async function POST(request:Request){
 const headers={"Cache-Control":"no-store"};
 const origin=request.headers.get("origin");
 if(origin&&origin!==new URL(request.url).origin)return Response.json({error:"This request isn’t allowed."},{status:403,headers});
 if(!request.headers.get("content-type")?.includes("application/json"))return Response.json({error:"Please send a JSON request."},{status:415,headers});
 let input;
 try{const text=await request.text();if(text.length>8000)return Response.json({error:"Your note is too long."},{status:413,headers});const parsed=inputSchema.safeParse(JSON.parse(text));if(!parsed.success)return Response.json({error:"Please check your choices and start time."},{status:400,headers});input=parsed.data}catch{return Response.json({error:"Please check your input."},{status:400,headers})}
 const vars=env as unknown as Record<string,string|undefined>;
 if(!vars.OPENAI_API_KEY)return Response.json({plan:examplePlan(input),context:input,source:"example"},{headers});
 try{return Response.json({plan:await generatePlan(input,vars.OPENAI_API_KEY,vars.OPENAI_MODEL||"gpt-4.1-mini"),context:input,source:"ai"},{headers})}catch(error){const code=error instanceof PlannerError?error.code:"AI_UNAVAILABLE";return Response.json({error:errorMessages[code]||errorMessages.AI_UNAVAILABLE},{status:code==="TIMEOUT"?504:code==="RATE_LIMIT"?429:502,headers})}
}

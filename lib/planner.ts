import { draftSchema, type RecoveryInput, type PlanDraft, type RecoveryPlan } from "./types";
export const slotDurations:Record<number,number[]>={15:[5,10],30:[5,15,10],45:[10,20,15],60:[10,20,15,15]};
export function clockAt(start:string,offset:number){const [h,m]=start.split(":").map(Number);const total=(h*60+m+offset)%1440;return String(Math.floor(total/60)).padStart(2,"0")+":"+String(total%60).padStart(2,"0")}
export function attachTimeline(draft:PlanDraft,input:RecoveryInput):RecoveryPlan {
 const valid=draftSchema.parse(draft),durations=slotDurations[input.minutes];
 if(valid.steps.length!==durations.length)throw new Error("INVALID_PLAN");
 let offset=0;
 return {...valid,steps:valid.steps.map((step,i)=>{const time=clockAt(input.start_time,offset)+"–"+clockAt(input.start_time,offset+durations[i]);offset+=durations[i];return {...step,time}})};
}
export function usesChinese(input:RecoveryInput){return /[\u3400-\u9fff]/.test(input.note)}
export function examplePlan(input:RecoveryInput):RecoveryPlan{
 const cn=usesChinese(input);
 const unpleasant=/rain|storm|snow|heat|寒|雨|雪|雷|高温/i.test(input.weather);
 const tired=input.mood==="exhausted"||/疲|累|exhaust|tired/i.test(input.note);
 const inside=input.preference==="indoors"||unpleasant||(input.preference==="either"&&tired);
 const activities=cn?[
 {activity:input.budget===0?"喝几口自己带的水，暂时放下工作消息":"在身边已有的店里选一杯 15 元以内的饮料；不方便就喝水",reason:"用一个很小的动作，给今天的工作画上句号。"},
 {activity:inside?"找一个熟悉的室内位置坐下，肩膀放松，不看工作消息":tired?"在熟悉、明亮的地方慢慢走；累了随时坐下":"在熟悉、明亮的地方慢慢走，不绕远路",reason:unpleasant?"天气不适合在外面停留，给自己一个安静的室内间隙。":tired?"今天已经够累了，这段时间不用再要求自己做什么。":"让注意力从工作里慢慢移开，不需要走很远。"},
 {activity:"听几首熟悉的歌，然后留一点安静的时间；不想听就坐一会儿",reason:"熟悉的声音可以陪你度过这个过渡，不需要寻找新东西。"},
 {activity:"在原处安静坐一会儿，最后收好东西，决定下一站",reason:"用自己的节奏结束这段空白，不急着进入下一件事。"}
 ]:[
 {activity:input.budget===0?"Sip the water you have. Put work messages on mute.":"Pick a drink under ¥15 at a shop already nearby, or sip your own water.",reason:"A small, familiar ritual gives the workday an ending."},
 {activity:inside?"Sit somewhere familiar indoors. Let your shoulders settle. Leave work messages alone.":tired?"Walk slowly somewhere familiar and well lit. Sit down whenever you like.":"Take an easy walk somewhere familiar and well lit. Keep close by.",reason:unpleasant?"With this weather, a quiet indoor pause asks less of you.":tired?"You have used enough energy today. This part can be very small.":"A change of pace helps create a little distance from your workday."},
 {activity:"Listen to a few familiar songs, with quiet pauses in between. Sitting without music is fine too.",reason:"Something familiar keeps you company without adding another decision."},
 {activity:"Stay seated for a little while. At the end, gather your things and choose where to go next.",reason:"Leave this little pause at your own pace."}
 ];
 const goals:Record<string,string>=cn?{exhausted:"给已经疲惫的自己留一点空白",stressed:"让今天的紧绷慢慢停下来",empty:"用一点熟悉的感觉填补过渡时间",restless:"用轻松的节奏结束工作",fine:"不用急着进入下一件事"}:{exhausted:"Give your tired mind a little room",stressed:"Let the workday’s tension settle",empty:"Find one small, familiar comfort",restless:"Ease into a slower rhythm",fine:"Take your time before the next part of the evening"};
 const draft:PlanDraft={title:cn?input.minutes+" 分钟，慢慢结束今天":"A quiet "+input.minutes+"-minute reset",goal:goals[input.mood],summary:cn?"几个很小的动作，让下班和私人生活之间多一点缓冲。可以坐着、放空，也可以随时结束。":"A few small, familiar moments between work and the rest of your evening. You can sit, pause, or stop whenever you like.",steps:activities.slice(0,slotDurations[input.minutes].length),final_message:cn?"今晚不用变得高效。工作结束了，你可以慢一点。":"You don’t need to make tonight productive. Let it be yours."};
 return attachTimeline(draft,input);
}

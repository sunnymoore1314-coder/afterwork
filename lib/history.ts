import { envelopeSchema, type PlanEnvelope } from "./types";

export type HistoryItem={id:string;createdAt:string;favorite:boolean;envelope:PlanEnvelope};
const key="afterwork-history";

export function readHistory():HistoryItem[]{
  if(typeof window==="undefined")return [];
  try{
    const raw=JSON.parse(localStorage.getItem(key)||"[]");
    if(!Array.isArray(raw))return [];
    return raw.flatMap((item):HistoryItem[]=>{
      if(!item||typeof item!=="object"||typeof item.id!=="string"||typeof item.createdAt!=="string")return [];
      const envelope=envelopeSchema.safeParse(item.envelope);
      return envelope.success?[{id:item.id,createdAt:item.createdAt,favorite:Boolean(item.favorite),envelope:envelope.data}]:[];
    }).sort((a,b)=>Number(b.favorite)-Number(a.favorite)||b.createdAt.localeCompare(a.createdAt)).slice(0,10);
  }catch{return []}
}

function writeHistory(items:HistoryItem[]){localStorage.setItem(key,JSON.stringify(items.slice(0,10)))}
export function addHistory(envelope:PlanEnvelope){const item={id:crypto.randomUUID?.()||Date.now().toString(36),createdAt:new Date().toISOString(),favorite:false,envelope};writeHistory([item,...readHistory()]);return item}
export function setFavorite(id:string,favorite:boolean){writeHistory(readHistory().map(item=>item.id===id?{...item,favorite}:item).sort((a,b)=>Number(b.favorite)-Number(a.favorite)||b.createdAt.localeCompare(a.createdAt)))}
export function removeHistory(id:string){writeHistory(readHistory().filter(item=>item.id!==id))}
export function clearHistory(){localStorage.removeItem(key)}

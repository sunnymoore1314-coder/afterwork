"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { envelopeSchema, type RecoveryInput } from "@/lib/types";
import { getPlannerMode, requestRecoveryPlan } from "@/lib/recovery-client";
import { LoaderCircle, ChevronDown, Plus, AlertCircle } from "lucide-react";
import { ArrowRight, BatteryLow, CloudLightning, CircleDashed, Waves, Moon, Clock3, Wallet, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
const moods=[{value:"exhausted",label:"Exhausted",icon:BatteryLow},{value:"stressed",label:"Stressed",icon:CloudLightning},{value:"empty",label:"Empty",icon:CircleDashed},{value:"restless",label:"Restless",icon:Waves},{value:"fine",label:"Not ready to go home",icon:Moon}];
export function RecoveryForm(){
const [mood,setMood]=useState("exhausted"),[minutes,setMinutes]=useState("30"),[budget,setBudget]=useState("30"),[preference,setPreference]=useState("either"),[note,setNote]=useState("");
const router=useRouter();
const [startTime,setStartTime]=useState(""),[city,setCity]=useState(""),[weather,setWeather]=useState(""),[detailsOpen,setDetailsOpen]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState(""),[mode,setMode]=useState<"ai"|"example"|null>(null);
const submitting=useRef(false),editedTime=useRef(false),activeRequest=useRef<AbortController|null>(null);
useEffect(()=>{
 const updateClock=()=>{if(!editedTime.current){const now=new Date();setStartTime(String(now.getHours()).padStart(2,"0")+":"+String(now.getMinutes()).padStart(2,"0"))}};
 updateClock();
 try{const cached=sessionStorage.getItem("afterwork-plan");if(cached){const value=envelopeSchema.safeParse(JSON.parse(cached));if(value.success){const ctx=value.data.context;setMood(ctx.mood);setMinutes(String(ctx.minutes));setBudget(String(ctx.budget));setPreference(ctx.preference);setNote(ctx.note);setCity(ctx.city);setWeather(ctx.weather);setDetailsOpen(Boolean(ctx.city||ctx.weather));setStartTime(ctx.start_time);editedTime.current=true}}}catch{}
 const timer=setInterval(updateClock,60000);
 const controller=new AbortController();
 getPlannerMode(controller.signal).then(value=>{if(value&&typeof value==="object"&&"mode" in value&&(value.mode==="ai"||value.mode==="example"))setMode(value.mode)}).catch(()=>{});
 return ()=>{clearInterval(timer);controller.abort();activeRequest.current?.abort()};
},[]);
async function submit(event:React.FormEvent<HTMLFormElement>){
 event.preventDefault();if(submitting.current)return;submitting.current=true;setLoading(true);setError("");
 const controller=new AbortController();activeRequest.current=controller;const timer=setTimeout(()=>controller.abort(),50000);
 try{
 const body=await requestRecoveryPlan({mood,minutes:Number(minutes),budget:Number(budget),preference,start_time:startTime,note,city,weather} as RecoveryInput,controller.signal);
 const result=envelopeSchema.safeParse(body);if(!result.success)throw new Error("That plan didn’t come through correctly. Please try again.");
 try{sessionStorage.setItem("afterwork-plan",JSON.stringify(result.data))}catch{throw new Error("Your browser couldn’t keep this plan. Allow storage for this tab, then try again.")}
 router.push("/result");
 }catch(err){if(controller.signal.aborted)setError("The plan took too long. Please try again.");else setError(err instanceof Error?err.message:"We couldn’t reach the planner. Please try again.");setLoading(false)}
 finally{clearTimeout(timer);submitting.current=false;activeRequest.current=null}
}
return <form className="recovery-form" onSubmit={submit} aria-busy={loading}><fieldset className="form-fields" disabled={loading}><div className="check-in-title"><h2>How are you feeling?</h2>{mode==="example"&&<span className="form-mode-tag">Example mode</span>}</div><RadioGroup className="mood-options" value={mood} onValueChange={setMood} aria-label="How are you feeling?">{moods.map(({value,label,icon:Icon})=><label className={`mood-chip ${mood===value?"selected":""}`} key={value}><RadioGroupItem className="chip-radio" value={value}/><Icon size={17} strokeWidth={1.6}/>{label}</label>)}</RadioGroup><label htmlFor="note" className="field-label note-label">Want to say a little more? <span>Optional</span></label><Textarea id="note" className="feeling-input" placeholder="Long day. Too many meetings. My head is still at work…" value={note} onChange={e=>setNote(e.target.value)} maxLength={600}/><div className="form-divider"/><div className="start-time-row"><label htmlFor="start-time">Starting at</label><Input id="start-time" type="time" aria-label="Start time" className="time-input" value={startTime} required onInput={e=>{editedTime.current=true;setStartTime(e.currentTarget.value)}} onChange={e=>{editedTime.current=true;setStartTime(e.target.value)}}/></div><fieldset className="field-group"><legend className="field-label"><Clock3 size={17}/>How much time do you have?</legend><RadioGroup className="segment time-segment" value={minutes} onValueChange={setMinutes} aria-label="Available time">{[15,30,45,60].map(n=><label className={minutes===String(n)?"selected":""} key={n}><RadioGroupItem className="chip-radio" value={String(n)}/><strong>{n}</strong> min</label>)}</RadioGroup></fieldset><div className="form-two-columns"><fieldset className="field-group"><legend className="field-label"><Wallet size={17}/>Budget</legend><RadioGroup className="segment" value={budget} onValueChange={setBudget} aria-label="Budget">{[{v:"0",l:"Free"},{v:"30",l:"< ¥30"},{v:"100",l:"< ¥100"}].map(({v,l})=><label key={v} className={budget===v?"selected":""}><RadioGroupItem className="chip-radio" value={v}/>{l}</label>)}</RadioGroup></fieldset><fieldset className="field-group"><legend className="field-label"><MapPin size={17}/>Where feels right?</legend><RadioGroup className="segment" value={preference} onValueChange={setPreference} aria-label="Preference">{[{v:"indoors",l:"Indoors"},{v:"outside",l:"Outside"},{v:"either",l:"Either"}].map(({v,l})=><label key={v} className={preference===v?"selected":""}><RadioGroupItem className="chip-radio" value={v}/>{l}</label>)}</RadioGroup></fieldset></div><Collapsible open={detailsOpen} onOpenChange={setDetailsOpen} className="optional-context"><CollapsibleTrigger className="details-trigger"><span><Plus size={15}/>City & weather <span className="optional-word">Optional</span></span><ChevronDown size={15} className={detailsOpen?"rotated":""}/></CollapsibleTrigger><CollapsibleContent><div className="context-fields"><div><label htmlFor="city" className="field-label">City</label><Input id="city" placeholder="e.g. Shanghai" value={city} maxLength={80} onChange={e=>setCity(e.target.value)}/></div><div><label htmlFor="weather" className="field-label">Weather right now</label><Input id="weather" placeholder="e.g. rainy, cool" value={weather} maxLength={100} onChange={e=>setWeather(e.target.value)}/></div></div></CollapsibleContent></Collapsible>{error&&<div className="form-error" role="alert"><AlertCircle size={17}/><span>{error}</span></div>}<Button type="submit" className="generate-button" disabled={loading||!startTime}>{loading?<><span>Choosing a softer landing…</span><LoaderCircle className="spin" size={19}/></>:<>Make room for tonight <ArrowRight size={19}/></>}</Button>{mode==="example"&&<p className="mode-note">Example mode · plans use a small activity library.</p>}</fieldset></form>;
}

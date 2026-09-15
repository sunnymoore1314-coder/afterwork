"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { envelopeSchema, inputSchema } from "@/lib/types";
import { getPlannerMode, requestRecoveryPlan, usesManualPlanner } from "@/lib/recovery-client";
import { LoaderCircle, ChevronDown, Plus, AlertCircle } from "lucide-react";
import { ArrowRight, BatteryLow, CloudLightning, CircleDashed, Waves, Moon, Clock3, Wallet, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLanguage } from "@/components/LanguageProvider";
import { addHistory } from "@/lib/history";
const moods=[{value:"exhausted",label:"exhausted",icon:BatteryLow},{value:"stressed",label:"stressed",icon:CloudLightning},{value:"empty",label:"empty",icon:CircleDashed},{value:"restless",label:"restless",icon:Waves},{value:"fine",label:"fine",icon:Moon}];
export function RecoveryForm(){
const {t}=useLanguage();
const [mood,setMood]=useState("exhausted"),[minutes,setMinutes]=useState("30"),[budget,setBudget]=useState("30"),[preference,setPreference]=useState("either"),[note,setNote]=useState("");
const router=useRouter();
const [startTime,setStartTime]=useState(""),[city,setCity]=useState(""),[weather,setWeather]=useState(""),[detailsOpen,setDetailsOpen]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState(""),[mode,setMode]=useState<"ai"|"manual"|"example"|null>(null);
const submitting=useRef(false),editedTime=useRef(false),activeRequest=useRef<AbortController|null>(null);
useEffect(()=>{
 const updateClock=()=>{if(!editedTime.current){const now=new Date();setStartTime(String(now.getHours()).padStart(2,"0")+":"+String(now.getMinutes()).padStart(2,"0"))}};
 updateClock();
 try{const cached=sessionStorage.getItem("afterwork-plan");if(cached){const value=envelopeSchema.safeParse(JSON.parse(cached));if(value.success){const ctx=value.data.context;setMood(ctx.mood);setMinutes(String(ctx.minutes));setBudget(String(ctx.budget));setPreference(ctx.preference);setNote(ctx.note);setCity(ctx.city);setWeather(ctx.weather);setDetailsOpen(Boolean(ctx.city||ctx.weather));setStartTime(ctx.start_time);editedTime.current=true}}}catch{}
 const timer=setInterval(updateClock,60000);
 const controller=new AbortController();
 getPlannerMode(controller.signal).then(value=>{if(value&&typeof value==="object"&&"mode" in value&&(value.mode==="ai"||value.mode==="manual"||value.mode==="example"))setMode(value.mode)}).catch(()=>{});
 const refreshMode=()=>getPlannerMode(new AbortController().signal).then(value=>{if(value&&typeof value==="object"&&"mode" in value&&(value.mode==="ai"||value.mode==="manual"||value.mode==="example"))setMode(value.mode)}).catch(()=>{});window.addEventListener("afterwork-provider-change",refreshMode);
 return ()=>{clearInterval(timer);controller.abort();activeRequest.current?.abort();window.removeEventListener("afterwork-provider-change",refreshMode)};
},[]);
async function submit(event:React.FormEvent<HTMLFormElement>){
 event.preventDefault();if(submitting.current)return;submitting.current=true;setLoading(true);setError("");
 const context=inputSchema.safeParse({mood,minutes:Number(minutes),budget:Number(budget),preference,start_time:startTime,note,city,weather});
 if(!context.success){setError(t("inputError"));setLoading(false);submitting.current=false;return}
 if(usesManualPlanner()){
  try{sessionStorage.setItem("afterwork-context",JSON.stringify(context.data));router.push("/manual")}
  catch{setError(t("storageError"));setLoading(false)}
  submitting.current=false;return;
 }
 const controller=new AbortController();activeRequest.current=controller;const timer=setTimeout(()=>controller.abort(),50000);
 try{
 const body=await requestRecoveryPlan(context.data,controller.signal);
 const result=envelopeSchema.safeParse(body);if(!result.success)throw new Error(t("invalidPlan"));
 try{sessionStorage.setItem("afterwork-plan",JSON.stringify(result.data));addHistory(result.data)}catch{throw new Error(t("storageError"))}
 router.push("/result");
 }catch(err){if(controller.signal.aborted)setError(t("timeout"));else setError(err instanceof Error?err.message:t("plannerError"));setLoading(false)}
 finally{clearTimeout(timer);submitting.current=false;activeRequest.current=null}
}
return <form className="recovery-form" onSubmit={submit} aria-busy={loading}><fieldset className="form-fields" disabled={loading}><div className="check-in-title"><h2>{t("feeling")}</h2>{mode==="manual"&&<span className="form-mode-tag">{t("personalAI")}</span>}{mode==="example"&&<span className="form-mode-tag">{t("exampleMode")}</span>}</div><RadioGroup className="mood-options" value={mood} onValueChange={setMood} aria-label={t("feeling")}>{moods.map(({value,label,icon:Icon})=><label className={`mood-chip ${mood===value?"selected":""}`} key={value}><RadioGroupItem className="chip-radio" value={value}/><Icon size={17} strokeWidth={1.6}/>{t(label)}</label>)}</RadioGroup><label htmlFor="note" className="field-label note-label">{t("noteLabel")} <span>{t("optional")}</span></label><Textarea id="note" className="feeling-input" placeholder={t("notePlaceholder")} value={note} onChange={e=>setNote(e.target.value)} maxLength={600}/><div className="form-divider"/><div className="start-time-row"><label htmlFor="start-time">{t("starting")}</label><Input id="start-time" type="time" aria-label={t("starting")} className="time-input" value={startTime} required onInput={e=>{editedTime.current=true;setStartTime(e.currentTarget.value)}} onChange={e=>{editedTime.current=true;setStartTime(e.target.value)}}/></div><fieldset className="field-group"><legend className="field-label"><Clock3 size={17}/>{t("timeQuestion")}</legend><RadioGroup className="segment time-segment" value={minutes} onValueChange={setMinutes} aria-label={t("timeQuestion")}>{[15,30,45,60].map(n=><label className={minutes===String(n)?"selected":""} key={n}><RadioGroupItem className="chip-radio" value={String(n)}/><strong>{n}</strong> {t("minutes")}</label>)}</RadioGroup></fieldset><div className="form-two-columns"><fieldset className="field-group"><legend className="field-label"><Wallet size={17}/>{t("budget")}</legend><RadioGroup className="segment" value={budget} onValueChange={setBudget} aria-label={t("budget")}>{[{v:"0",l:t("free")},{v:"30",l:"< ¥30"},{v:"100",l:"< ¥100"}].map(({v,l})=><label key={v} className={budget===v?"selected":""}><RadioGroupItem className="chip-radio" value={v}/>{l}</label>)}</RadioGroup></fieldset><fieldset className="field-group"><legend className="field-label"><MapPin size={17}/>{t("place")}</legend><RadioGroup className="segment" value={preference} onValueChange={setPreference} aria-label={t("place")}>{[{v:"indoors",l:t("indoors")},{v:"outside",l:t("outside")},{v:"either",l:t("either")} ].map(({v,l})=><label key={v} className={preference===v?"selected":""}><RadioGroupItem className="chip-radio" value={v}/>{l}</label>)}</RadioGroup></fieldset></div><Collapsible open={detailsOpen} onOpenChange={setDetailsOpen} className="optional-context"><CollapsibleTrigger className="details-trigger"><span><Plus size={15}/>{t("cityWeather")} <span className="optional-word">{t("optional")}</span></span><ChevronDown size={15} className={detailsOpen?"rotated":""}/></CollapsibleTrigger><CollapsibleContent><div className="context-fields"><div><label htmlFor="city" className="field-label">{t("city")}</label><Input id="city" placeholder={t("cityPlaceholder")} value={city} maxLength={80} onChange={e=>setCity(e.target.value)}/></div><div><label htmlFor="weather" className="field-label">{t("weather")}</label><Input id="weather" placeholder={t("weatherPlaceholder")} value={weather} maxLength={100} onChange={e=>setWeather(e.target.value)}/></div></div></CollapsibleContent></Collapsible>{error&&<div className="form-error" role="alert"><AlertCircle size={17}/><span>{error}</span></div>}<Button type="submit" className="generate-button" disabled={loading||!startTime}>{loading?<><span>{t("loading")}</span><LoaderCircle className="spin" size={19}/></>:<>{mode==="manual"?t("prepare"):t("makePlan")} <ArrowRight size={19}/></>}</Button>{mode==="manual"&&<p className="mode-note">{t("manualNote")}</p>}{mode==="example"&&<p className="mode-note">{t("exampleNote")}</p>}</fieldset></form>;
}

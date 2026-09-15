"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, CheckCircle2, Clipboard, Moon, RotateCcw, SkipForward } from "lucide-react";
import { Brand, Footer } from "@/components/Brand";
import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { clearActivePlan, planAsText, readActivePlan, saveActivePlan, type ActivePlan, type StepStatus } from "@/lib/progress";

export default function FocusPage(){
 const {t}=useLanguage();const [active,setActive]=useState<ActivePlan|null>(null),[ready,setReady]=useState(false),[copied,setCopied]=useState(false);
 useEffect(()=>{setActive(readActivePlan());setReady(true)},[]);
 const completed=active?.statuses.filter(value=>value!=="pending").length??0,total=active?.statuses.length??0;
 const current=active?.statuses.findIndex(value=>value==="pending")??-1;
 const percent=total?Math.round(completed/total*100):0;
 const update=(index:number,status:StepStatus)=>{if(!active)return;const next={...active,statuses:active.statuses.map((value,i)=>i===index?status:value)};saveActivePlan(next);setActive(next)};
 const copy=async()=>{if(!active)return;await navigator.clipboard.writeText(planAsText(active.envelope));setCopied(true);setTimeout(()=>setCopied(false),1600)};
 const reset=()=>{if(!active)return;const next={...active,statuses:active.statuses.map(()=>"pending" as const)};saveActivePlan(next);setActive(next)};
 const finished=total>0&&completed===total;
 if(!ready)return <div className="site-shell"><Brand/><main className="empty-result"><Moon size={30}/><p>{t("resultLoading")}</p></main><Footer/></div>;
 if(!active)return <div className="site-shell"><Brand/><main className="empty-result"><Moon size={32}/><h1>{t("noActiveTitle")}</h1><p>{t("noActiveText")}</p><Link href="/" className="primary-link">{t("emptyAction")}</Link></main><Footer/></div>;
 if(finished)return <div className="site-shell"><Brand/><main className="focus-finished"><CheckCircle2 size={42}/><p className="eyebrow">{t("completeEyebrow")}</p><h1>{t("completeTitle")}</h1><p>{active.envelope.plan.final_message}</p><div><button type="button" className="secondary-button" onClick={reset}><RotateCcw size={16}/>{t("resetProgress")}</button><Link href="/" className="primary-link" onClick={()=>clearActivePlan()}>{t("newPlan")}</Link></div></main><Footer/></div>;
 return <div className="site-shell"><Brand/><main className="focus-main"><div className="focus-heading"><div><p className="eyebrow">{t("focusEyebrow")}</p><h1>{active.envelope.plan.title}</h1><p>{active.envelope.plan.goal}</p></div><button type="button" className="text-button" onClick={copy}><Clipboard size={15}/>{copied?t("copied"):t("copyPlan")}</button></div><div className="progress-row"><span>{t("progress")} · {completed}/{total}</span><strong>{percent}%</strong></div><div className="progress-track"><span style={{width:percent+"%"}}/></div><ol className="focus-list">{active.envelope.plan.steps.map((step,index)=>{const status=active.statuses[index];return <li key={step.time} className={`focus-step ${status}`}><div className="focus-step-top"><span className="step-number">{status==="done"?<Check size={15}/>:String(index+1).padStart(2,"0")}</span><time>{step.time}</time>{index===current&&<span className="now-badge">{t("now")}</span>}</div><h2>{step.activity}</h2><p>{step.reason}</p><div className="focus-actions">{status==="pending"?<><Button type="button" className="done-button" onClick={()=>update(index,"done")}><Check size={17}/>{t("done")}</Button><button type="button" className="skip-button" onClick={()=>update(index,"skipped")}><SkipForward size={16}/>{t("skip")}</button></>:<button type="button" className="undo-button" onClick={()=>update(index,"pending")}><RotateCcw size={15}/>{t("undo")}</button>}</div></li>})}</ol></main><Footer/></div>
}

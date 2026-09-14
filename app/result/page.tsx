"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Brand, Footer } from "@/components/Brand";
import { RecoveryTimeline } from "@/components/RecoveryTimeline";
import { envelopeSchema, type PlanEnvelope } from "@/lib/types";
import { clockAt } from "@/lib/planner";
import { ArrowLeft, Clock3, Wallet, Moon, Sparkles, MapPin, Cloud, LoaderCircle } from "lucide-react";
export default function ResultPage(){
 const [value,setValue]=useState<PlanEnvelope|null>(null),[ready,setReady]=useState(false);
 useEffect(()=>{try{const cached=sessionStorage.getItem("afterwork-plan");if(cached){const result=envelopeSchema.safeParse(JSON.parse(cached));if(result.success)setValue(result.data)}}catch{}setReady(true)},[]);
 if(!ready)return <div className="site-shell"><Brand/><main className="empty-result"><LoaderCircle className="spin" size={27}/><p>Bringing your evening into focus…</p></main><Footer/></div>;
 if(!value)return <div className="site-shell"><Brand/><main className="empty-result"><Moon size={32}/><h1>Your evening is still unwritten.</h1><p>Check in for a moment, and we’ll make a little room for tonight.</p><Link href="/" className="primary-link">Make an evening plan</Link></main><Footer/></div>;
 const {plan,context,source}=value;
 const [h,m]=context.start_time.split(":").map(Number),tomorrow=h*60+m+context.minutes>=1440;
 const chinese=/[\u3400-\u9fff]/.test(plan.title);
 return <div className="site-shell"><Brand/><main className="result-main"><Link href="/" className="back-link"><ArrowLeft size={16}/>Back to check-in</Link><div className="result-intro"><p className="eyebrow">TONIGHT BELONGS TO YOU</p><h1>Your evening,<br/><em>a little softer.</em></h1></div><article className="result-card"><div className="result-card-top"><span><Sparkles size={16}/>{source==="ai"?"YOUR RECOVERY PLAN":"YOUR EXAMPLE PLAN"}</span><span className="result-end">{context.start_time} — {clockAt(context.start_time,context.minutes)}{tomorrow?" · ends tomorrow":""}</span></div><h2 lang={chinese?"zh-CN":"en"}>{plan.title}</h2><div className="result-meta"><span><Clock3 size={15}/>{context.minutes} min</span><span><Wallet size={15}/>{context.budget===0?"Free":"Under ¥"+context.budget}</span><span><MapPin size={15}/>{context.preference==="indoors"?"Indoors preferred":context.preference==="outside"?"Outside preferred":"Flexible"}</span>{context.city&&<span>{context.city}</span>}{context.weather&&<span><Cloud size={15}/>{context.weather}</span>}</div><div className="result-goal"><span>{chinese?"今晚的小目标":"A LITTLE INTENTION"}</span><h3>{plan.goal}</h3><p>{plan.summary}</p></div><RecoveryTimeline steps={plan.steps}/><div className="closing-note"><Moon size={20}/><blockquote>{plan.final_message}</blockquote><span>— afterwork</span></div>{source==="example"&&<p className="example-disclosure">An example from our activity library, adapted to your choices.</p>}</article><div className="result-after"><span>You can skip a step. You can stop early. This time is yours.</span><Link href="/">Adjust my evening <ArrowLeft size={15}/></Link></div></main><Footer/></div>;
}
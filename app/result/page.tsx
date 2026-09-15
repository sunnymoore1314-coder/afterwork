"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Brand, Footer } from "@/components/Brand";
import { RecoveryTimeline } from "@/components/RecoveryTimeline";
import { envelopeSchema, type PlanEnvelope } from "@/lib/types";
import { clockAt } from "@/lib/planner";
import { ArrowLeft, Clock3, Wallet, Moon, Sparkles, MapPin, Cloud, LoaderCircle } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
export default function ResultPage(){
 const {t}=useLanguage();
 const [value,setValue]=useState<PlanEnvelope|null>(null),[ready,setReady]=useState(false);
 useEffect(()=>{try{const cached=sessionStorage.getItem("afterwork-plan");if(cached){const result=envelopeSchema.safeParse(JSON.parse(cached));if(result.success)setValue(result.data)}}catch{}setReady(true)},[]);
 if(!ready)return <div className="site-shell"><Brand/><main className="empty-result"><LoaderCircle className="spin" size={27}/><p>{t("resultLoading")}</p></main><Footer/></div>;
 if(!value)return <div className="site-shell"><Brand/><main className="empty-result"><Moon size={32}/><h1>{t("emptyTitle")}</h1><p>{t("emptyText")}</p><Link href="/" className="primary-link">{t("emptyAction")}</Link></main><Footer/></div>;
 const {plan,context,source}=value;
 const [h,m]=context.start_time.split(":").map(Number),tomorrow=h*60+m+context.minutes>=1440;
 const chinese=/[\u3400-\u9fff]/.test(plan.title);
 return <div className="site-shell"><Brand/><main className="result-main"><Link href="/" className="back-link"><ArrowLeft size={16}/>{t("back")}</Link><div className="result-intro"><p className="eyebrow">{t("resultEyebrow")}</p><h1>{t("resultTitle")}<br/><em>{t("resultEmphasis")}</em></h1></div><article className="result-card"><div className="result-card-top"><span><Sparkles size={16}/>{source==="example"?t("examplePlan"):t("recoveryPlan")}</span><span className="result-end">{context.start_time} — {clockAt(context.start_time,context.minutes)}{tomorrow?" · "+t("endsTomorrow"):""}</span></div><h2 lang={chinese?"zh-CN":"en"}>{plan.title}</h2><div className="result-meta"><span><Clock3 size={15}/>{context.minutes} {t("minutes")}</span><span><Wallet size={15}/>{context.budget===0?t("free"):t("under")+context.budget}</span><span><MapPin size={15}/>{context.preference==="indoors"?t("indoors"):context.preference==="outside"?t("outside"):t("flexible")}</span>{context.city&&<span>{context.city}</span>}{context.weather&&<span><Cloud size={15}/>{context.weather}</span>}</div><div className="result-goal"><span>{t("intention")}</span><h3>{plan.goal}</h3><p>{plan.summary}</p></div><RecoveryTimeline steps={plan.steps}/><div className="closing-note"><Moon size={20}/><blockquote>{plan.final_message}</blockquote><span>— afterwork</span></div>{source==="manual"&&<p className="example-disclosure">{t("imported")}</p>}{source==="example"&&<p className="example-disclosure">{t("exampleDisclosure")}</p>}</article><div className="result-after"><span>{t("resultNote")}</span><Link href="/">{t("adjust")} <ArrowLeft size={15}/></Link></div></main><Footer/></div>;
}
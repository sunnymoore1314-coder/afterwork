"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock3, Heart, History, Trash2 } from "lucide-react";
import { Brand, Footer } from "@/components/Brand";
import { useLanguage } from "@/components/LanguageProvider";
import { clearHistory, readHistory, removeHistory, setFavorite, type HistoryItem } from "@/lib/history";

export default function HistoryPage(){
 const {language,t}=useLanguage(),router=useRouter();const [items,setItems]=useState<HistoryItem[]>([]),[ready,setReady]=useState(false);
 useEffect(()=>{setItems(readHistory());setReady(true)},[]);
 const refresh=()=>setItems(readHistory());
 const open=(item:HistoryItem)=>{sessionStorage.setItem("afterwork-plan",JSON.stringify(item.envelope));router.push("/result")};
 const reuse=(item:HistoryItem)=>{sessionStorage.setItem("afterwork-plan",JSON.stringify(item.envelope));sessionStorage.setItem("afterwork-context",JSON.stringify(item.envelope.context));router.push("/")};
 const clear=()=>{if(window.confirm(t("clearConfirm"))){clearHistory();refresh()}};
 return <div className="site-shell"><Brand/><main className="history-main"><Link href="/" className="back-link"><ArrowLeft size={16}/>{t("back")}</Link><div className="history-heading"><div><p className="eyebrow">{t("historyEyebrow")}</p><h1>{t("historyTitle")}</h1><p>{t("historyIntro")}</p></div>{items.length>0&&<button type="button" className="text-button danger" onClick={clear}><Trash2 size={15}/>{t("clearAll")}</button>}</div>{ready&&items.length===0?<div className="history-empty"><History size={31}/><h2>{t("historyEmptyTitle")}</h2><p>{t("historyEmptyText")}</p><Link href="/" className="primary-link">{t("emptyAction")}</Link></div>:<div className="history-list">{items.map(item=><article className="history-card" key={item.id}><div className="history-card-copy"><div className="history-card-meta"><span><Clock3 size={14}/>{new Intl.DateTimeFormat(language==="zh"?"zh-CN":"en",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(item.createdAt))}</span><span>{item.envelope.context.minutes} {t("minutes")}</span></div><h2>{item.envelope.plan.title}</h2><p>{item.envelope.plan.goal}</p></div><div className="history-actions"><button type="button" className={item.favorite?"icon-button active":"icon-button"} aria-label={item.favorite?t("unfavorite"):t("favorite")} onClick={()=>{setFavorite(item.id,!item.favorite);refresh()}}><Heart size={18} fill={item.favorite?"currentColor":"none"}/></button><button type="button" className="icon-button" aria-label={t("delete")} onClick={()=>{removeHistory(item.id);refresh()}}><Trash2 size={18}/></button><button type="button" className="secondary-button" onClick={()=>reuse(item)}>{t("reuse")}</button><button type="button" className="primary-small" onClick={()=>open(item)}>{t("openPlan")}</button></div></article>)}</div>}</main><Footer/></div>
}

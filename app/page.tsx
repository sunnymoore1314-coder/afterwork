"use client";
import { RecoveryForm } from "@/components/RecoveryForm";
import { Brand, Footer, ExamplePlan } from "@/components/Brand";
import { useLanguage } from "@/components/LanguageProvider";
export default function Home(){const {t}=useLanguage();return <div className="site-shell"><Brand/><main className="home-main"><div className="intro"><p className="eyebrow">{t("heroEyebrow")}</p><h1>{t("heroTitle")}<br/><em>{t("heroEmphasis")}</em></h1><p>{t("heroText")}</p></div><div className="workspace"><RecoveryForm/><aside className="aside"><ExamplePlan/><div className="small-note"><span>{t("pressure")}</span><p>{t("pressureText").split("\n").map((line,index)=><span key={line}>{line}{index===0&&<br/>}</span>)}</p></div></aside></div></main><Footer/></div>}

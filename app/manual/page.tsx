"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Check, Clipboard, Sparkles } from "lucide-react";
import { Brand, Footer } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { manualPrompt, parseManualResponse } from "@/lib/manual";
import { attachTimeline } from "@/lib/planner";
import { draftSchema, inputSchema, type RecoveryInput } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";
import { addHistory } from "@/lib/history";

export default function ManualPage() {
  const {language,t}=useLanguage();
  const router = useRouter();
  const [context, setContext] = useState<RecoveryInput | null>(null);
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("afterwork-context");
      if (raw) {
        const parsed = inputSchema.safeParse(JSON.parse(raw));
        if (parsed.success) setContext(parsed.data);
      }
    } catch {}
  }, []);

  const prompt = context ? manualPrompt(context, language) : "";

  async function copyPrompt() {
    setError("");
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError(t("copyError"));
    }
  }

  function importPlan() {
    if (!context) return;
    setError("");
    try {
      const draft = draftSchema.parse(parseManualResponse(response));
      const plan = attachTimeline(draft, context);
      const envelope={ plan, context, source: "manual" as const };
      sessionStorage.setItem("afterwork-plan", JSON.stringify(envelope));
      addHistory(envelope);
      router.push("/result");
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Invalid response";
      setError(t("formatError") + detail);
    }
  }

  if (!context) {
    return <div className="site-shell"><Brand/><main className="empty-result"><Sparkles size={32}/><h1>{t("noContextTitle")}</h1><p>{t("noContextText")}</p><Link href="/" className="primary-link">{t("goCheckin")}</Link></main><Footer/></div>;
  }

  return <div className="site-shell"><Brand/><main className="manual-main">
    <Link href="/" className="back-link"><ArrowLeft size={16}/>{t("back")}</Link>
    <div className="manual-intro"><p className="eyebrow">{t("manualEyebrow")}</p><h1>{t("manualTitle")}<br/><em>{t("manualEmphasis")}</em></h1><p>{t("manualIntro")}</p></div>
    <section className="manual-grid">
      <article className="manual-card"><span className="manual-step">{t("copyStep")}</span><h2>{t("copyTitle")}</h2><Textarea className="manual-textarea prompt-textarea" readOnly value={prompt}/><Button type="button" className="manual-button" onClick={copyPrompt}>{copied?<><Check size={18}/>{t("copied")}</>:<><Clipboard size={18}/>{t("copyPrompt")}</>}</Button></article>
      <article className="manual-card"><span className="manual-step">{t("askStep")}</span><h2>{t("askTitle")}</h2><p className="manual-help">{t("askHelp")}</p><p className="manual-choice">{t("anyAI")}</p></article>
      <article className="manual-card manual-import"><span className="manual-step">{t("importStep")}</span><h2>{t("importTitle")}</h2><Textarea className="manual-textarea" value={response} onChange={event=>setResponse(event.target.value)} placeholder={t("pastePlaceholder")}/>{error&&<div className="form-error" role="alert"><AlertCircle size={17}/><span>{error}</span></div>}<Button type="button" className="manual-button" onClick={importPlan} disabled={!response.trim()}><Sparkles size={18}/>{t("buildTimeline")}</Button></article>
    </section>
    <p className="manual-privacy">{t("privacy")}</p>
  </main><Footer/></div>;
}

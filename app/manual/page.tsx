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

export default function ManualPage() {
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

  const prompt = context ? manualPrompt(context) : "";

  async function copyPrompt() {
    setError("");
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Could not copy automatically. Select the prompt and copy it manually.");
    }
  }

  function importPlan() {
    if (!context) return;
    setError("");
    try {
      const draft = draftSchema.parse(parseManualResponse(response));
      const plan = attachTimeline(draft, context);
      sessionStorage.setItem("afterwork-plan", JSON.stringify({ plan, context, source: "manual" }));
      router.push("/result");
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Invalid response";
      setError("The response is not in the required format: " + detail);
    }
  }

  if (!context) {
    return <div className="site-shell"><Brand/><main className="empty-result"><Sparkles size={32}/><h1>Start with a quick check-in.</h1><p>Your choices are needed before we can prepare an AI prompt.</p><Link href="/" className="primary-link">Go to check-in</Link></main><Footer/></div>;
  }

  return <div className="site-shell"><Brand/><main className="manual-main">
    <Link href="/" className="back-link"><ArrowLeft size={16}/>Back to check-in</Link>
    <div className="manual-intro"><p className="eyebrow">PERSONAL AI MODE</p><h1>Bring your own AI,<br/><em>keep your key private.</em></h1><p>Afterwork prepares the request. You choose where to run it.</p></div>
    <section className="manual-grid">
      <article className="manual-card"><span className="manual-step">01 · COPY</span><h2>Copy your prepared prompt</h2><Textarea className="manual-textarea prompt-textarea" readOnly value={prompt}/><Button type="button" className="manual-button" onClick={copyPrompt}>{copied?<><Check size={18}/>Copied</>:<><Clipboard size={18}/>Copy prompt</>}</Button></article>
      <article className="manual-card"><span className="manual-step">02 · ASK</span><h2>Run it in your AI chat</h2><p className="manual-help">Open the AI service you already use, paste the prompt, and send it. Copy the complete JSON response when it finishes.</p><p className="manual-choice">Works with any AI that can return JSON.</p></article>
      <article className="manual-card manual-import"><span className="manual-step">03 · IMPORT</span><h2>Paste the AI response</h2><Textarea className="manual-textarea" value={response} onChange={event=>setResponse(event.target.value)} placeholder="Paste the JSON response here…"/>{error&&<div className="form-error" role="alert"><AlertCircle size={17}/><span>{error}</span></div>}<Button type="button" className="manual-button" onClick={importPlan} disabled={!response.trim()}><Sparkles size={18}/>Build my timeline</Button></article>
    </section>
    <p className="manual-privacy">Your prompt and response stay in this browser tab. Afterwork does not receive your AI account or API key.</p>
  </main><Footer/></div>;
}

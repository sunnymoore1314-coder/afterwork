"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "en" | "zh";

const messages: Record<Language, Record<string, string>> = {
  en: {
    headerNote:"A little space for yourself", footerLeft:"Made for the hours that belong to you.", footerRight:"Less doing. More being.", homeLabel:"Afterwork home",
    heroEyebrow:"THE SPACE BETWEEN WORK & LIFE", heroTitle:"Don’t go straight from", heroEmphasis:"work mode to home mode.", heroText:"Take a few minutes to become yourself again.",
    pressure:"NO PRESSURE. NO CHECKLIST TO CONQUER.", pressureText:"Tonight doesn’t have to be productive.\nIt can just be yours.",
    exampleAria:"Example recovery plan", exampleTop:"A GLIMPSE OF YOUR EVENING", exampleBadge:"EXAMPLE", exampleTitle:"A quiet little reset", exampleDescription:"30 minutes to put a little distance\nbetween you and your workday.", lowEffort:"Low effort", under30:"Under ¥30", exampleQuote:"You don’t need to make tonight productive.", exampleBottom:"A small plan. A softer landing.",
    ex1:"Something you actually like", ex1Text:"Pick up a favorite drink. No rush.", ex2:"Take the slower way", ex2Text:"An easy walk, work messages on mute.", ex3:"A song, then home", ex3Text:"Let something familiar keep you company.",
    feeling:"How are you feeling?", exhausted:"Exhausted", stressed:"Stressed", empty:"Empty", restless:"Restless", fine:"Not ready to go home", personalAI:"Personal AI", exampleMode:"Example mode",
    noteLabel:"Want to say a little more?", optional:"Optional", notePlaceholder:"Long day. Too many meetings. My head is still at work…", starting:"Starting at", timeQuestion:"How much time do you have?", minutes:"min", budget:"Budget", free:"Free", place:"Where feels right?", indoors:"Indoors", outside:"Outside", either:"Either", cityWeather:"City & weather", city:"City", cityPlaceholder:"e.g. Shanghai", weather:"Weather right now", weatherPlaceholder:"e.g. rainy, cool",
    prepare:"Prepare my AI prompt", makePlan:"Make room for tonight", loading:"Choosing a softer landing…", manualNote:"No account or API key required · you run the prompt in your own AI chat.", exampleNote:"Example mode · plans use a small activity library.", inputError:"Please check your choices and start time.", storageError:"Your browser could not keep these choices for this tab.", timeout:"The plan took too long. Please try again.", plannerError:"We couldn’t reach the planner. Please try again.", invalidPlan:"That plan didn’t come through correctly. Please try again.",
    back:"Back to check-in", manualEyebrow:"PERSONAL AI MODE", manualTitle:"Bring your own AI,", manualEmphasis:"keep your key private.", manualIntro:"Afterwork prepares the request. You choose where to run it.", copyStep:"01 · COPY", copyTitle:"Copy your prepared prompt", copied:"Copied", copyPrompt:"Copy prompt", askStep:"02 · ASK", askTitle:"Run it in your AI chat", askHelp:"Open the AI service you already use, paste the prompt, and send it. Copy the complete JSON response when it finishes.", anyAI:"Works with any AI that can return JSON.", importStep:"03 · IMPORT", importTitle:"Paste the AI response", pastePlaceholder:"Paste the JSON response here…", buildTimeline:"Build my timeline", privacy:"Your prompt and response stay in this browser tab. Afterwork does not receive your AI account or API key.", copyError:"Could not copy automatically. Select the prompt and copy it manually.", formatError:"The response is not in the required format: ", noContextTitle:"Start with a quick check-in.", noContextText:"Your choices are needed before we can prepare an AI prompt.", goCheckin:"Go to check-in",
    resultLoading:"Bringing your evening into focus…", emptyTitle:"Your evening is still unwritten.", emptyText:"Check in for a moment, and we’ll make a little room for tonight.", emptyAction:"Make an evening plan", resultEyebrow:"TONIGHT BELONGS TO YOU", resultTitle:"Your evening,", resultEmphasis:"a little softer.", recoveryPlan:"YOUR RECOVERY PLAN", examplePlan:"YOUR EXAMPLE PLAN", endsTomorrow:"ends tomorrow", under:"Under ¥", flexible:"Flexible", intention:"A LITTLE INTENTION", imported:"Imported from the AI chat you chose. Afterwork validated the structure and calculated the timeline.", exampleDisclosure:"An example from our activity library, adapted to your choices.", resultNote:"You can skip a step. You can stop early. This time is yours.", adjust:"Adjust my evening"
  },
  zh: {
    headerNote:"给自己留一点空间", footerLeft:"献给真正属于你的下班时间。", footerRight:"少做一点，多感受一点。", homeLabel:"Afterwork 首页",
    heroEyebrow:"工作与生活之间的缓冲", heroTitle:"别让自己直接从工作模式", heroEmphasis:"跳进下班后的生活。", heroText:"花几分钟，慢慢回到自己的状态。",
    pressure:"没有压力，也没有必须完成的清单。", pressureText:"今晚不需要追求效率。\n它只需要属于你。",
    exampleAria:"恢复计划示例", exampleTop:"今晚可能是这样", exampleBadge:"示例", exampleTitle:"一次安静的小恢复", exampleDescription:"用 30 分钟，让工作和今晚之间\n多一点距离。", lowEffort:"低负担", under30:"30 元以内", exampleQuote:"今晚不需要变得高效。", exampleBottom:"一个小计划，一次柔和的过渡。",
    ex1:"选一件自己喜欢的小事", ex1Text:"买一杯喜欢的饮料，不用着急。", ex2:"走一段慢一点的路", ex2Text:"轻松走走，暂时关闭工作消息。", ex3:"听一首歌，然后回家", ex3Text:"让熟悉的声音陪你一会儿。",
    feeling:"你现在感觉怎么样？", exhausted:"筋疲力尽", stressed:"压力很大", empty:"有点空", restless:"静不下来", fine:"还不想马上回家", personalAI:"个人 AI", exampleMode:"示例模式",
    noteLabel:"还想补充一点吗？", optional:"选填", notePlaceholder:"今天很累，开了太多会，脑子还停在工作里……", starting:"开始时间", timeQuestion:"你有多少时间？", minutes:"分钟", budget:"预算", free:"免费", place:"更想待在哪里？", indoors:"室内", outside:"室外", either:"都可以", cityWeather:"城市和天气", city:"城市", cityPlaceholder:"例如：上海", weather:"当前天气", weatherPlaceholder:"例如：下雨、凉爽",
    prepare:"生成 AI 提示词", makePlan:"为今晚留一点空间", loading:"正在安排一段柔和的过渡……", manualNote:"无需账号或 API Key · 在你自己的 AI 对话中运行提示词。", exampleNote:"示例模式 · 计划来自小型活动库。", inputError:"请检查你的选择和开始时间。", storageError:"浏览器无法在当前标签页保存这些选择。", timeout:"生成时间过长，请重试。", plannerError:"暂时无法连接计划服务，请重试。", invalidPlan:"计划格式不正确，请重试。",
    back:"返回修改", manualEyebrow:"个人 AI 模式", manualTitle:"使用你自己的 AI，", manualEmphasis:"密钥只属于你。", manualIntro:"Afterwork 准备提示词，由你选择在哪里运行。", copyStep:"01 · 复制", copyTitle:"复制准备好的提示词", copied:"已复制", copyPrompt:"复制提示词", askStep:"02 · 调用", askTitle:"在你的 AI 对话中运行", askHelp:"打开你常用的 AI，粘贴并发送提示词。完成后复制完整的 JSON 返回内容。", anyAI:"支持任何能够返回 JSON 的 AI。", importStep:"03 · 导入", importTitle:"粘贴 AI 返回内容", pastePlaceholder:"在这里粘贴 JSON……", buildTimeline:"生成我的时间轴", privacy:"提示词和返回内容只保存在当前标签页。Afterwork 不会接收你的 AI 账号或 API Key。", copyError:"无法自动复制，请选中提示词后手动复制。", formatError:"AI 返回内容不符合要求：", noContextTitle:"先做一个简单的状态选择。", noContextText:"生成 AI 提示词前需要你的选择。", goCheckin:"前往填写",
    resultLoading:"正在整理今晚的计划……", emptyTitle:"今晚的计划还没有写下。", emptyText:"先简单选择一下当前状态，我们一起给今晚留一点空间。", emptyAction:"制定今晚的计划", resultEyebrow:"今晚属于你", resultTitle:"让你的今晚，", resultEmphasis:"柔和一点。", recoveryPlan:"你的恢复计划", examplePlan:"计划示例", endsTomorrow:"次日结束", under:"不超过 ¥", flexible:"灵活选择", intention:"今晚的小目标", imported:"计划来自你选择的 AI。Afterwork 已校验结构并计算时间轴。", exampleDisclosure:"根据你的选择从活动库生成的示例。", resultNote:"可以跳过，也可以提前结束。这段时间属于你。", adjust:"修改今晚的安排"
  }
};

type LanguageContextValue={language:Language;setLanguage:(language:Language)=>void;t:(key:string)=>string};
const LanguageContext=createContext<LanguageContextValue|undefined>(undefined);

export function LanguageProvider({children}:{children:React.ReactNode}){
  const [language,setLanguageState]=useState<Language>("en");
  useEffect(()=>{
    const saved=localStorage.getItem("afterwork-language");
    const next=saved==="zh"||saved==="en"?saved:navigator.language.toLowerCase().startsWith("zh")?"zh":"en";
    setLanguageState(next);document.documentElement.lang=next==="zh"?"zh-CN":"en";
  },[]);
  const setLanguage=(next:Language)=>{setLanguageState(next);localStorage.setItem("afterwork-language",next);document.documentElement.lang=next==="zh"?"zh-CN":"en"};
  const value=useMemo(()=>({language,setLanguage,t:(key:string)=>messages[language][key]??key}),[language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(){const value=useContext(LanguageContext);if(!value)throw new Error("LanguageProvider is missing");return value}

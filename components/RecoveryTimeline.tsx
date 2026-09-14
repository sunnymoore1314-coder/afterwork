import { type RecoveryPlan } from "@/lib/types";
export function RecoveryTimeline({steps}:{steps:RecoveryPlan["steps"]}){
 return <ol className="recovery-timeline">{steps.map((step,index)=><li key={step.time}><div className="recovery-time"><span className="step-number">{String(index+1).padStart(2,"0")}</span><time>{step.time}</time></div><div className="recovery-activity"><h3>{step.activity}</h3><p>{step.reason}</p></div></li>)}</ol>;
}
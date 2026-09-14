import { RecoveryForm } from "@/components/RecoveryForm";
import { Brand, Footer, ExamplePlan } from "@/components/Brand";
export default function Home() {
return <div className="site-shell"><Brand/><main className="home-main"><div className="intro"><p className="eyebrow">THE SPACE BETWEEN WORK & LIFE</p><h1>Don’t go straight from<br/><em>work mode to home mode.</em></h1><p>Take a few minutes to become yourself again.</p></div><div className="workspace"><RecoveryForm/><aside className="aside"><ExamplePlan/><div className="small-note"><span>NO PRESSURE. NO CHECKLIST TO CONQUER.</span><p>Tonight doesn’t have to be productive.<br/>It can just be yours.</p></div></aside></div></main><Footer/></div>;
}
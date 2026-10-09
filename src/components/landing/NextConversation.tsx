import brief from '@/assets/brief-v5.webp';
import plan from '@/assets/plan-v5.webp';
import plane from '@/assets/plane-v4.webp';
const steps=[{title:'We read your brief.',text:'Your goal and the key questions.',art:brief},{title:'We talk it through.',text:'A conversation to agree the right scope.',art:plane},{title:'You get a clear plan.',text:'Scope, deliverables and costs before committing.',art:plan}];
export default function NextConversation(){return <aside className="contact-next next-conversation"><p className="landing-eyebrow">What happens next?</p><h3>A clear next move.</h3><ol>{steps.map((step,i)=><li key={step.title}><div className="next-art"><img src={step.art} alt="" loading="lazy"/></div><div><span>0{i+1}</span><h4>{step.title}</h4><p>{step.text}</p></div></li>)}</ol><p className="next-promise">Scope and costs agreed before work begins.</p></aside>;}

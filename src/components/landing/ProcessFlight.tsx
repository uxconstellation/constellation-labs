import {useLayoutEffect,useRef} from 'react';
import gsap from 'gsap';
import brief from '@/assets/brief-v5.webp';
import plan from '@/assets/plan-v5.webp';
import tools from '@/assets/tools-v4.webp';
import rocket from '@/assets/rocket-v4.webp';
export default function ProcessFlight(){
 const root=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{
  const node=root.current!,section=node.closest('section')!;let tl:gsap.core.Timeline|undefined,visible=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const numbers=Array.from(section.querySelectorAll<HTMLElement>('.process-number'));
  const copy=section.querySelectorAll('.process-grid h3,.process-grid p');
  const build=()=>{
   tl?.kill();const bounds=node.getBoundingClientRect();const points=numbers.map(el=>{const r=el.getBoundingClientRect();return{x:r.left-bounds.left+r.width/2,y:r.top-bounds.top+r.height/2};});if(points.length!==4)return;
   const icons=node.querySelectorAll('[data-flight-icon]');
   gsap.set(icons,{autoAlpha:0,scale:1});gsap.set(numbers,{backgroundColor:'#f3eee5'});gsap.set(copy,{x:0,rotation:0});
   if(reduced.matches)return;
   tl=gsap.timeline({repeat:-1,repeatDelay:1.2,paused:!visible});
   points.forEach((p,i)=>{const start=i*3.1,end=points[i+1];
    // Each new tool emerges from the preceding numbered portal, then returns into the next.
    tl!.set(icons[i],{x:p.x-48,y:p.y-48,scale:.08,rotation:i===3?75:0,autoAlpha:1},start)
      .to(numbers[i],{backgroundColor:i%2?'#a1dfcb':'#f6bb99',duration:.3},start)
      .to(icons[i],{x:p.x-24,y:p.y-110,scale:1,duration:.6,ease:'power2.out'},start);
    if(!end){
     tl!.to(icons[i],{x:bounds.width+170,y:p.y-110,duration:1.8,ease:'power3.in'},start+.65)
      .to(copy,{x:6,rotation:.25,stagger:.025,duration:.16,ease:'power2.out'},start+2.05)
      .to(copy,{x:-1.5,rotation:-.08,duration:.18},start+2.28)
      .to(copy,{x:0,rotation:0,duration:.55,ease:'elastic.out(1,.5)'},start+2.46);
    }else{
     if(Math.abs(end.y-p.y)>8){tl!.to(icons[i],{x:bounds.width-62,duration:.45,ease:'none'},start+.6).to(icons[i],{y:end.y-110,duration:.75,ease:'none'},start+1.05).to(icons[i],{x:end.x-24,duration:.45,ease:'none'},start+1.8);}
     else tl!.to(icons[i],{x:end.x-24,y:end.y-110,duration:1.65,ease:'none'},start+.6);
     tl!.to(icons[i],{x:end.x-48,y:end.y-48,scale:.08,duration:.55,ease:'power3.in'},start+2.25);
    }
    tl!.set(icons[i],{autoAlpha:0},start+2.85);
   });tl.set(numbers,{backgroundColor:'#f3eee5'});
  };
  const resize=new ResizeObserver(build);resize.observe(section);
  const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible&&!document.hidden)tl?.play();else tl?.pause();},{threshold:.05});observer.observe(section);
  const visibility=()=>{if(visible&&!document.hidden)tl?.play();else tl?.pause();};document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',build);build();const settled=setTimeout(build,1200);
  return()=>{clearTimeout(settled);tl?.kill();resize.disconnect();observer.disconnect();document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',build);gsap.set(numbers,{clearProps:'backgroundColor'});gsap.set(copy,{clearProps:'transform'});};
 },[]);
 return <div ref={root} className="process-flight process-flight-path" aria-hidden="true">{[brief,plan,tools,rocket].map((src,i)=><img data-flight-icon key={src} src={src} alt="" className={i===3?'flight-rocket':''}/>)}</div>;
}

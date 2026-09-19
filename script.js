const loader=document.querySelector('.loader');
window.addEventListener('load',()=>{
  document.querySelectorAll('video').forEach(v=>{v.muted=true; v.play().catch(()=>{});});
  setTimeout(()=>loader.classList.add('done'),700);
});
const scenes=[...document.querySelectorAll('.scene')];
const progress=document.querySelector('.progress span');

const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('active');
      const v=e.target.querySelector('video');
      if(v){ v.currentTime = v.currentTime || 0; v.play().catch(()=>{}); }
    }
  });
},{threshold:.35});
scenes.forEach(s=>io.observe(s));

function update(){
  const vh=innerHeight;
  const max=document.body.scrollHeight-vh;
  progress.style.height=(max>0?scrollY/max*100:0)+'%';

  scenes.forEach((s,i)=>{
    const r=s.getBoundingClientRect();
    const centerProgress=Math.max(0,Math.min(1,(vh-r.top)/(vh+r.height)));
    const visible=Math.max(0,Math.min(1,1-Math.abs(r.top)/(vh)));
    const m=s.querySelector('.media');

    if(m){
      // Cinematic camera: incoming scene starts slightly wide, outgoing scene pushes deep.
      const isLeaving=r.top<0;
      const depth=isLeaving ? Math.min(1,Math.abs(r.top)/vh) : Math.min(1,Math.max(0,(vh-r.top)/vh));
      const scale=isLeaving ? 1.08 + depth*.22 : 1.12 - visible*.04;
      const y=isLeaving ? depth*-3 : (1-visible)*4;
      const blur=isLeaving ? depth*1.5 : 0;
      m.style.transform=`scale(${scale}) translateY(${y}px)`;
      m.style.filter=`blur(${blur}px) saturate(${1+visible*.08})`;
      s.style.setProperty('--scene-progress',centerProgress);
    }
  });
}
addEventListener('scroll',update,{passive:true});
addEventListener('resize',update);
update();

// Full-scene snap with a cinematic handoff.
let wheelLock=false;
addEventListener('wheel',e=>{
  if(Math.abs(e.deltaY)<35||wheelLock)return;
  const current=scenes.reduce((best,s)=>
    Math.abs(s.getBoundingClientRect().top)<Math.abs(best.getBoundingClientRect().top)?s:best,scenes[0]);
  let idx=scenes.indexOf(current);
  if(e.deltaY>0&&idx<scenes.length-1){
    wheelLock=true;
    scenes[idx+1].scrollIntoView({behavior:'smooth',block:'start'});
    setTimeout(()=>wheelLock=false,950);
  }else if(e.deltaY<0&&idx>0){
    wheelLock=true;
    scenes[idx-1].scrollIntoView({behavior:'smooth',block:'start'});
    setTimeout(()=>wheelLock=false,950);
  }
},{passive:true});

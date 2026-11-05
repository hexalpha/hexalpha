/* HEXALPHA FUTURE: progressive enhancement, no external runtime dependencies. */
(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  let motion = !reduced;
  const button = $('#fxMotion');
  const cmdBtn = $('#fxCommandTrigger');
  const dialog = $('#fxPalette');
  const cmdInput = $('#fxSearch');
  const topBtn = $('#fxBackTop');
  const commandItems = $$('#fxPalette [data-fx-command]');

  function applyMotion() {
    document.body.classList.toggle('fx-static', !motion);
    button?.setAttribute('aria-pressed', String(motion));
    if (button) button.textContent = motion ? '3D ON' : '3D OFF';
  }
  button?.addEventListener('click', () => {motion = !motion;applyMotion()});
  applyMotion();

  const targets = {home:'#top',about:'#about',projects:'#work',expertise:'#expertise',contact:'#contact',console:'#lab'};
  function navigate(id) {
    const target = targets[id];
    if (target) document.querySelector(target)?.scrollIntoView({behavior:motion?'smooth':'auto'});
    else if (id === 'resume') location.href='./resume.html';
    else if (id === 'github') window.open('https://github.com/hexalpha','_blank','noopener,noreferrer');
    else if (id === 'email') location.href='mailto:junelmohmmad1234@gmail.com';
  }

  function openPalette() {
    if (!dialog || !dialog.showModal) return;
    if (!dialog.open) dialog.showModal();
    if (cmdInput) {cmdInput.value='';filterCommands('');cmdInput.focus()}
  }
  function filterCommands(text) {
    const q=text.toLowerCase().trim();let count=0;
    commandItems.forEach(x=>{const match=x.textContent.toLowerCase().includes(q);x.hidden=!match;if(match)count++});
    $('#fxEmpty')?.classList.toggle('is-hidden', count>0);
  }
  function chooseCommand(key) {dialog?.close();navigate(key)}
  cmdBtn?.addEventListener('click',openPalette);
  $('#fxClose')?.addEventListener('click',()=>dialog?.close());
  cmdInput?.addEventListener('input',()=>filterCommands(cmdInput.value));
  commandItems.forEach(x=>x.addEventListener('click',()=>chooseCommand(x.dataset.fxCommand)));
  cmdInput?.addEventListener('keydown',event=>{
    if(event.key==='Enter'){
      const first=commandItems.find(x=>!x.hidden);
      if(first){event.preventDefault();chooseCommand(first.dataset.fxCommand)}
    }
  });
  document.addEventListener('keydown', event=>{
    const typing=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if ((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k') {event.preventDefault();openPalette()}
    else if(event.key==='/'&&!typing&&!dialog?.open) {event.preventDefault();openPalette()}
  });

  const filters = $$('#fxFilters [data-filter]');
  const projects = $$('.project-flow[data-category]');
  function filterProjects(filter){
    let count=0;
    projects.forEach(p=>{const show=filter==='all'||p.dataset.category===filter;p.hidden=!show;if(show)count++});
    filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
    const status=$('#fxFilterStatus');if(status)status.textContent=`${count} ${count===1?'project':'projects'} shown`;
  }
  filters.forEach(b=>b.addEventListener('click',()=>filterProjects(b.dataset.filter)));
  filterProjects('all');

  const skills={
    LINUX:'Linux and Kali workspaces · system fundamentals · terminal operations.',
    PYTHON:'Automation scripts · FastAPI services · structured data processing.',
    NETWORKING:'IP networking · HTTP fundamentals · practical network inspection.',
    'WEB PENTEST':'Authorized assessment methodology · Burp Suite · evidence-based reporting.',
    FASTAPI:'Python REST endpoints · backend service design · API-first projects.',
    DOCKER:'Containerized development · Compose stacks · reproducible local workflows.',
    'LOCAL AI':'Ollama · llama.cpp · GGUF experiments · controlled AI tooling.',
    REPORTING:'Technical writeups · security evidence · clear remediation notes.'
  };
  const skillOutput=$('#fxSkillDetail');
  $$('.fx-skill').forEach(btn=>btn.addEventListener('click',()=>{
    $$('.fx-skill').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
    if(skillOutput) skillOutput.textContent=skills[btn.dataset.skill]||'Select a skill to explore.';
  }));

  const terminal=$('#fxTermOutput');
  const form=$('#fxTermForm');
  const input=$('#fxTermInput');
  const terminalCommands={
    help:'Supported portfolio commands: help, whoami, projects, skills, links, contact, clear.',
    whoami:'Junel Mohammad // Cybersecurity · Security Engineering · Local AI // Rajasthan, India.',
    projects:'01 DarkTrace-X · 02 HEX ALERT · 03 HexBounty · 04 Hex-Alpha LLM. Use the Projects filter above to explore.',
    skills:'Linux · Python · Networking · Web Pentest · FastAPI · Docker · Local AI · Reporting.',
    links:'GitHub: github.com/hexalpha  |  Portfolio resume: resume.html  |  LinkedIn: linkedin.com/in/junel123',
    contact:'Email: junelmohmmad1234@gmail.com  |  LinkedIn: linkedin.com/in/junel123'
  };
  function line(text, className) {const el=document.createElement('div');el.className=className||'';el.textContent=text;terminal?.appendChild(el)}
  function runTerm(raw){
    const cmd=raw.trim().toLowerCase().slice(0,70);if(!cmd||!terminal)return;
    if(cmd==='clear'){terminal.textContent='';line('Portfolio guide reset. Type help for options.','muted');return}
    line('hexalpha@portfolio:~$ '+cmd,'prompt');
    line(terminalCommands[cmd]||'Not a supported portfolio command. Type help. (No system commands are executed.)','');
    terminal.scrollTop=terminal.scrollHeight;
  }
  form?.addEventListener('submit',e=>{e.preventDefault();runTerm(input?.value||'');if(input)input.value=''});
  $$('[data-fx-term]').forEach(b=>b.addEventListener('click',()=>runTerm(b.dataset.fxTerm)));

  // Active navigation rail and return-to-top; uses passive scroll and rAF coalescing.
  const rail=$$('.fx-pager a');
  let scheduled=false;
  function trackScroll(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{
    scheduled=false;const ids=['top','about','work','expertise','lab','contact'];let selected='top';
    ids.forEach(id=>{const el=document.getElementById(id);if(el&&el.getBoundingClientRect().top<innerHeight*.48)selected=id});
    rail.forEach(a=>a.classList.toggle('is-active',a.getAttribute('href')==='#'+selected));
    topBtn?.classList.toggle('is-shown',scrollY>650);
  })}
  addEventListener('scroll',trackScroll,{passive:true});trackScroll();
  topBtn?.addEventListener('click',()=>scrollTo({top:0,behavior:motion?'smooth':'auto'}));

  // Mouse driven CSS 3D tilts. Keep text readable and never add duplicated imagery.
  if(fine&&!reduced){
    $$('.flow-card,.frame-card,.contact__box').forEach(card=>{
      let frame=0;
      card.addEventListener('pointermove',e=>{
        if(!motion||frame)return;
        const r=card.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;
        frame=requestAnimationFrame(()=>{
          card.style.setProperty('--fx-tilt-x',`${(-y*5).toFixed(2)}deg`);
          card.style.setProperty('--fx-tilt-y',`${(x*6).toFixed(2)}deg`);
          frame=0;
        });
      },{passive:true});
      card.addEventListener('pointerleave',()=>{
        if(frame)cancelAnimationFrame(frame);frame=0;
        card.style.removeProperty('--fx-tilt-x');card.style.removeProperty('--fx-tilt-y');
      });
    });
  }

  // Perspective starfield: 2D canvas rendering 3D-projected points; no external JS or WebGL dependency.
  const canvas=$('#fx-stars');
  if(canvas&&motion&&fine&&innerWidth>850){
    const context=canvas.getContext('2d',{alpha:true});
    if(context){
      let w=0,h=0,stars=[],last=0,mouseX=0,mouseY=0;
      const resize=()=>{
        const ratio=Math.min(devicePixelRatio||1,1.5);w=innerWidth;h=innerHeight;
        canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);
        context.setTransform(ratio,0,0,ratio,0,0);
        stars=Array.from({length:74},()=>({x:(Math.random()-.5)*w*2,y:(Math.random()-.5)*h*2,z:150+Math.random()*850,size:.5+Math.random()*1.4}));
      };
      resize();addEventListener('resize',resize,{passive:true});
      addEventListener('pointermove',e=>{mouseX=(e.clientX/w-.5)*20;mouseY=(e.clientY/h-.5)*20},{passive:true});
      const render=t=>{
        requestAnimationFrame(render);
        if(!motion||document.hidden||t-last<40)return;last=t;context.clearRect(0,0,w,h);
        const ox=w/2,oy=h/2;
        stars.forEach(s=>{
          s.z-=1.45;if(s.z<100)s.z=950;
          const scale=260/s.z,x=ox+(s.x+mouseX*scale)*scale,y=oy+(s.y+mouseY*scale)*scale;
          if(x<0||x>w||y<0||y>h)return;
          context.fillStyle=`rgba(255,76,103,${Math.min(.45,scale*.8)})`;
          context.fillRect(x,y,Math.min(3,s.size*scale),Math.min(3,s.size*scale));
        });
      };requestAnimationFrame(render);
    }
  }
})();
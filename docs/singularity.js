(() => {
  'use strict';
  const $ = (query, root = document) => root.querySelector(query);
  const $$ = (query, root = document) => Array.from(root.querySelectorAll(query));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointerFine = window.matchMedia('(pointer:fine)').matches;
  const state = { motion: !prefersReduced, activeSection: 'top', toastTimer: null, coreVisible: false, raf: 0 };
  const email = 'junelmohmmad1234@gmail.com';
  const categories = ['all', 'security', 'automation', 'ai'];

  const projects = {
    darktrace: {
      serial:'001 / DEFENSIVE THREAT INTELLIGENCE', title:'DarkTrace-X', summary:'A security intelligence workspace connecting source discovery, ingestion, investigation workflows and AI-assisted analysis.',
      notes:['Next.js and FastAPI form the application foundation, with data services and security-focused backend workflows.','Source discovery, management and quality controls have been under active development.','Feature maturity varies by module; do not treat all planned workflows as production-ready.'],
      tags:['NEXT.JS','FASTAPI','PYTHON','THREAT INTEL'], links:[{label:'VIEW PUBLIC REPOSITORY ↗',href:'https://github.com/hexalpha/DarkTrace-X'}]
    },
    hexalert: {
      serial:'002 / ALERTING AUTOMATION', title:'HEX ALERT', summary:'A self-hosted cybersecurity news and vulnerability collector with scheduled alerts, a dashboard and Discord routing.',
      notes:['Python collectors normalize intelligence from supported news and vulnerability sources.','Discord channels distribute categorized security and jobs updates for review.','FastAPI, PostgreSQL and containerized services support the system architecture.'],
      tags:['PYTHON','FASTAPI','DISCORD','POSTGRESQL'], links:[{label:'VIEW PUBLIC REPOSITORY ↗',href:'https://github.com/hexalpha/HEX-ALERT'}]
    },
    hexbounty: {
      serial:'003 / AUTHORIZED SECURITY ASSESSMENT', title:'HexBounty', summary:'A local security-assessment workspace focused on explicit scope, approvals, evidence and controlled automation.',
      notes:['Research and local implementation built around Go, React and containerized services.','Assessment requests, approval checkpoints and run-level tracking are development priorities.','Automated assessment features must be validated individually; full autonomy is not claimed.'],
      tags:['GO','REACT','DOCKER','LOCAL AI'], links:[]
    },
    hexllm: {
      serial:'004 / LOCAL AI RESEARCH', title:'HEX-ALPHA LLM', summary:'Personal research into private inference, local quantized models and human-controlled tooling.',
      notes:['Experiments include Ollama, llama.cpp and quantized GGUF models.','Areas of interest include multilingual assistance and scoped tool integration.','This is a research track, not a released general-purpose AI model.'],
      tags:['OLLAMA','GGUF','LLAMA.CPP','LINUX'], links:[]
    }
  };

  const systemData = {
    observe:{index:'01 — 04',tag:'SIGNAL ACQUISITION',title:'OBSERVE',description:'Understand the system before taking action: collect approved data, normalize signals and create an observable baseline.',details:['APPROVED-SOURCE INGESTION','TELEMETRY & EVENTS','INITIAL TRIAGE']},
    model:{index:'02 — 04',tag:'CONTEXTUAL ANALYSIS',title:'MODEL',description:'Connect technical observations to the environment: relate indicators, investigate behavior and prioritize relevant context.',details:['THREAT INTELLIGENCE','SYSTEM CONTEXT','HYPOTHESIS BUILDING']},
    validate:{index:'03 — 04',tag:'EVIDENCE-DRIVEN SECURITY',title:'VALIDATE',description:'Confirm findings with reproducible evidence, defined scope and reliable tests before drawing conclusions.',details:['AUTHORIZED WEB TESTING','REPRODUCIBLE EVIDENCE','CLEAR REPORTING']},
    automate:{index:'04 — 04',tag:'CONTROLLED EXECUTION',title:'AUTOMATE',description:'Use scripts and local AI to reduce repeated work while retaining operator approval, logs and explicit boundaries.',details:['PYTHON AUTOMATION','APPROVAL GATES','LOCAL AI WORKFLOWS']}
  };

  const skillData = {
    linux:['LINUX / KALI','Working with Linux environments, system tooling and security-focused workflows.'],
    python:['PYTHON','Python for scripts, API services, automation and security data processing.'],
    vapt:['WEB VAPT','Web security testing methodology, validation and reporting within authorized scope.'],
    network:['NETWORKING','TCP/IP and networking fundamentals for understanding systems and investigating behaviors.'],
    api:['FASTAPI','Building Python API services and backend components for security platforms.'],
    docker:['DOCKER','Containerized local development, service isolation and reproducible environments.'],
    ai:['LOCAL LLMS','Local inference and quantized model experiments using Ollama, llama.cpp and GGUF.'],
    data:['POSTGRESQL','Relational data modeling and persistence for application and alerting workflows.']
  };

  const scrollTargets = ['top','about','projects','systems','arsenal','lab','contact'];
  const commandMap = {
    top:'#top',about:'#about',projects:'#projects',systems:'#systems',arsenal:'#arsenal',lab:'#lab',contact:'#contact',
    resume:'./resume.html',github:'https://github.com/hexalpha',email:`mailto:${email}`
  };

  function showToast(message) {
    const el = $('#toast'); if(!el) return;
    el.textContent = message; el.classList.add('is-visible');
    if (state.toastTimer) clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2600);
  }

  function setMotion(enabled, announce = true) {
    state.motion = Boolean(enabled) && !prefersReduced;
    document.body.classList.toggle('motion-off', !state.motion);
    const button = $('#motionToggle');
    if (button) {button.setAttribute('aria-pressed', String(state.motion));button.setAttribute('aria-label', `${state.motion ? 'Disable' : 'Enable'} decorative animations`);}
    const label = $('#motionLabel'); if(label) label.textContent = state.motion ? '3D ON' : '3D OFF';
    if (announce) showToast(state.motion ? 'VISUAL MOTION ENABLED' : 'REDUCED MOTION ENABLED');
    try {localStorage.setItem('hexalpha-motion', state.motion ? 'on' : 'off');} catch {}
  }

  function initMotion() {
    let preference = null;
    try {preference = localStorage.getItem('hexalpha-motion');} catch {}
    setMotion(preference === 'off' ? false : !prefersReduced, false);
    $('#motionToggle')?.addEventListener('click', () => setMotion(!state.motion));
  }

  function initNavigation() {
    const button = $('#navToggle'), nav = $('#siteNav');
    if (button && nav) {
      button.addEventListener('click', () => {
        const open = !nav.classList.contains('is-open');
        nav.classList.toggle('is-open', open);
        button.setAttribute('aria-expanded', String(open));
        button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      });
      $$('a',nav).forEach(link => link.addEventListener('click', () => {nav.classList.remove('is-open');button.setAttribute('aria-expanded','false');}));
    }
    const progress = $('#scrollProgress'),header = $('#siteHeader'), back = $('#backTop');
    let queued = false;
    const updateScroll = () => {
      queued = false;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if(progress) progress.style.width = `${Math.max(0,Math.min(100,scrollY/max*100))}%`;
      if(header) header.classList.toggle('is-scrolled', scrollY > 30);
      if(back) back.classList.toggle('is-visible', scrollY > window.innerHeight * .8);
      let active = 'top';
      for (const id of scrollTargets) {
        const section = document.getElementById(id);
        if(section && section.getBoundingClientRect().top < window.innerHeight * .45) active = id;
      }
      if(active !== state.activeSection) {
        state.activeSection = active;
        $$('[data-rail]').forEach(el => el.classList.toggle('is-active', el.dataset.rail === active));
        $$('[data-section-link]').forEach(el => el.classList.toggle('is-active',el.dataset.sectionLink === active));
      }
    };
    window.addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(updateScroll);}}, {passive:true});
    window.addEventListener('resize',updateScroll,{passive:true});
    updateScroll();
    back?.addEventListener('click',()=>window.scrollTo({top:0,behavior:state.motion?'smooth':'instant'}));
  }

  function initReveal() {
    const reveal = $$('[data-reveal]');
    if(!('IntersectionObserver' in window) || prefersReduced) return;
    const observer = new IntersectionObserver(entries => {
      for(const entry of entries) if(entry.isIntersecting){entry.target.classList.add('is-in');observer.unobserve(entry.target);}
    },{rootMargin:'0px 0px -55px 0px',threshold:.08});
    reveal.forEach((el,i)=>{el.style.setProperty('--delay',`${Math.min((i%3)*75,150)}ms`);observer.observe(el);});
    // Invisibility should never persist if the browser doesn't deliver IO events.
    setTimeout(()=>{reveal.forEach(el=>{if(el.getBoundingClientRect().top<innerHeight*1.1)el.classList.add('is-in');});},1200);
  }

  function initPointer() {
    if(!pointerFine || prefersReduced) return;
    const aura = $('#cursorAura');let queued=false,x=0,y=0;
    window.addEventListener('pointermove',(event)=>{
      x=event.clientX;y=event.clientY;
      if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;if(aura && state.motion){aura.style.left=`${x}px`;aura.style.top=`${y}px`;aura.classList.add('is-on');}});}
    },{passive:true});
    const portrait = $('#portraitTilt');
    if(portrait){
      portrait.addEventListener('pointermove',event=>{
        if(!state.motion) return;
        const box=portrait.getBoundingClientRect();const x=(event.clientX-box.left)/box.width-.5;const y=(event.clientY-box.top)/box.height-.5;
        portrait.style.transform=`perspective(950px) rotateY(${x*9}deg) rotateX(${-y*7}deg)`;
      },{passive:true});
      portrait.addEventListener('pointerleave',()=>portrait.style.transform='');
    }
    $$('.tilt-card').forEach(el=>{
      el.addEventListener('pointermove',event=>{
        if(!state.motion || !el.classList.contains('is-in')) return;
        const r=el.getBoundingClientRect();const x=(event.clientX-r.left)/r.width-.5;const y=(event.clientY-r.top)/r.height-.5;
        el.style.transform=`perspective(1100px) rotateY(${x*3.1}deg) rotateX(${-y*3.1}deg)`;
      },{passive:true});
      el.addEventListener('pointerleave',()=>el.style.transform='');
    });
  }

  function initProjectFilters() {
    const buttons=$$('[data-project-filter]');const cards=$$('.mission-card[data-category]');
    const apply=filter=>{
      if(!categories.includes(filter))filter='all';
      buttons.forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.projectFilter===filter)));
      let count=0;cards.forEach(card=>{const match=filter==='all'||card.dataset.category.split(' ').includes(filter);card.hidden=!match;if(match) count++;});
      const result=$('#filterResult');if(result)result.textContent=`SHOWING 0${count} / 04`;
    };
    buttons.forEach(btn=>btn.addEventListener('click',()=>apply(btn.dataset.projectFilter)));
    apply('all');
  }

  function initDossiers() {
    const dialog=$('#dossierDialog');if(!dialog)return;
    const open=id=>{
      const p=projects[id];if(!p)return;
      $('#dossierOverline').textContent=`MISSION RECORD / ${p.serial}`;
      $('#dossierTitle').textContent=p.title;
      $('#dossierSummary').textContent=p.summary;
      const notes=$('#dossierNotes');notes.replaceChildren();p.notes.forEach(n=>{const el=document.createElement('p');el.textContent=n;notes.appendChild(el);});
      const tags=$('#dossierTags');tags.replaceChildren();p.tags.forEach(s=>{const el=document.createElement('span');el.textContent=s;tags.appendChild(el);});
      const links=$('#dossierLinks');links.replaceChildren();p.links.forEach(item=>{const a=document.createElement('a');a.href=item.href;a.target='_blank';a.rel='noopener noreferrer';a.textContent=item.label;links.appendChild(a);});
      if(!p.links.length){const span=document.createElement('span');span.textContent='LOCAL / RESEARCH PROJECT — NO PUBLIC SOURCE LINK';span.style.cssText='font:10px var(--mono);color:var(--muted)';links.appendChild(span);}
      try{dialog.showModal();}catch{dialog.setAttribute('open','');}
    };
    $$('[data-dossier]').forEach(btn=>btn.addEventListener('click',()=>open(btn.dataset.dossier)));
    $('#dossierClose')?.addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  }

  function initSystems() {
    const keys=Object.keys(systemData);let current=0;
    const show=key=>{
      const data=systemData[key];if(!data)return;
      current=keys.indexOf(key);
      $$('[data-system]').forEach(el=>{const yes=el.dataset.system===key;el.setAttribute('aria-pressed',String(yes));el.classList.toggle('is-selected',yes);});
      $('#systemCounter').textContent=data.index;$('#systemTag').textContent=data.tag;
      $('#systemTitle').replaceChildren(document.createTextNode(data.title));const dot=document.createElement('span');dot.textContent='.';$('#systemTitle').appendChild(dot);
      $('#systemDescription').textContent=data.description;
      const list=$('#systemDetails');list.replaceChildren();data.details.forEach(s=>{const el=document.createElement('span');el.textContent=s;list.appendChild(el);});
    };
    $$('[data-system]').forEach(el=>el.addEventListener('click',()=>show(el.dataset.system)));
    $('#nextSystem')?.addEventListener('click',()=>show(keys[(current+1)%keys.length]));
  }

  function initSkills() {
    const buttons=$$('[data-skill]');const output=$('#skillDescription');
    buttons.forEach(btn=>btn.addEventListener('click',()=>{
      const key=btn.dataset.skill;const info=skillData[key];if(!info||!output)return;
      buttons.forEach(b=>{b.classList.toggle('is-selected',b===btn);b.setAttribute('aria-pressed',String(b===btn));});
      output.replaceChildren();
      const index=document.createElement('span');index.textContent=`CAPABILITY / 0${buttons.indexOf(btn)+1}`;
      const title=document.createElement('strong');title.textContent=info[0];
      const p=document.createElement('p');p.textContent=info[1];output.append(index,title,p);
    }));
  }

  const localAnswers=[
    {re:/darktrace|threat intel|intelligence/i,reply:'DarkTrace-X is an actively developed threat-intelligence workspace. It combines source management, ingestion and investigation-oriented interfaces. Stack: Next.js, FastAPI and Python. Public source: github.com/hexalpha/DarkTrace-X.'},
    {re:/alert|discord|cve|jobs|news/i,reply:'HEX ALERT is a Python and FastAPI-based collector and Discord routing system for security news, CVE information and job opportunities. Public source: github.com/hexalpha/HEX-ALERT.'},
    {re:/hexbounty|bounty|pentest|vapt|assessment|hacking/i,reply:'HexBounty is a local security assessment workspace researching scope-aware, operator-approved testing and auditable workflows. Full autonomous testing is not claimed. Authorized VAPT and web security are key areas of interest.'},
    {re:/llm|ollama|model|ai|qwen|gguf|llama/i,reply:'HEX-ALPHA LLM is local AI research using Ollama, llama.cpp and quantized GGUF models. Focus: private inference and permissioned tool experiments. It is not a released general-purpose model.'},
    {re:/skill|stack|tech|python|linux|docker|network|experience/i,reply:'Core practical areas: Linux/Kali, networking, web security testing, Python automation, FastAPI, Docker, PostgreSQL and local-model experimentation. The interactive capability matrix has more details.'},
    {re:/contact|email|linkedin|hire|collab|reach|resume/i,reply:`Contact Junel at ${email}. GitHub: github.com/hexalpha. LinkedIn: linkedin.com/in/junel123. Open resume.html for a public-safe resume.`},
    {re:/whoami|about|junel|profile|education/i,reply:'Junel Mohammad is a cybersecurity-focused builder based in Rajasthan, India, with an M.Sc. Computer Science background. Interests include SOC workflows, VAPT, security engineering and local AI.'},
    {re:/help|commands|menu/i,reply:'Available questions: about Junel, DarkTrace-X, HEX ALERT, HexBounty, local AI, skills, resume or contact. You can also use the Ctrl/⌘+K command palette.'},
    {re:/project|work|mission|portfolio/i,reply:'Four featured tracks: DarkTrace-X (threat intelligence), HEX ALERT (automation), HexBounty (authorized assessment workspace), and HEX-ALPHA LLM (private AI research). Select OPEN DOSSIER in the Missions section.'}
  ];
  function localReply(query) {
    const q=query.toLowerCase().trim();
    if(q==='clear') return '__CLEAR__';
    for(const item of localAnswers){if(item.re.test(q))return item.reply;}
    return 'I can help with this portfolio’s projects, technical stack and contact information. Try asking “What is DarkTrace-X?”, “What technologies do you use?” or type “help”. This on-page guide is rule-based, not a live AI model.';
  }
  function initConsole() {
    const history=$('#consoleHistory'), input=$('#consoleInput'),form=$('#consoleForm');if(!history||!input||!form)return;
    const line=(label,content,user=false)=>{
      const wrap=document.createElement('div');wrap.className=`console-line ${user?'console-line--user':'console-line--system'}`;
      const prompt=document.createElement('span');prompt.className='console-line__prompt';prompt.textContent=label;
      const p=document.createElement('p');p.textContent=content;
      wrap.append(prompt,p);history.appendChild(wrap);while(history.childElementCount>35) history.firstElementChild.remove();history.scrollTop=history.scrollHeight;
    };
    const ask=query=>{
      const clean=String(query).trim().slice(0,240);if(!clean)return;
      if(clean.toLowerCase()==='clear'){history.replaceChildren();line('SYSTEM','Console output cleared. Type help to get started.');return;}
      line('YOU',clean,true);line('HEXALPHA / GUIDE',localReply(clean));
    };
    form.addEventListener('submit',event=>{event.preventDefault();ask(input.value);input.value='';input.focus();});
    $$('[data-lab-prompt]').forEach(btn=>btn.addEventListener('click',()=>{ask(btn.dataset.labPrompt);document.getElementById('lab')?.scrollIntoView({behavior:state.motion?'smooth':'instant',block:'center'});input.focus();}));
    $('#clearConsole')?.addEventListener('click',()=>ask('clear'));
  }

  function initCommands() {
    const dialog=$('#commandDialog'),search=$('#commandSearch');if(!dialog||!search)return;
    const buttons=$$('[data-command]',dialog),empty=$('#commandEmpty');
    const filter=()=>{
      const q=search.value.trim().toLowerCase();let count=0;
      for(const b of buttons){const yes=b.textContent.toLowerCase().includes(q)||b.dataset.command.toLowerCase().includes(q);b.hidden=!yes;if(yes)count++;}
      if(empty)empty.hidden=!!count;
    };
    const open=()=>{search.value='';filter();if(!dialog.open)dialog.showModal();requestAnimationFrame(()=>search.focus());};
    const choose=key=>{
      const dest=commandMap[key];if(!dest)return;
      dialog.close();
      if(dest.startsWith('#')){document.querySelector(dest)?.scrollIntoView({behavior:state.motion?'smooth':'instant'});}
      else if(dest.startsWith('mailto:')) window.location.href=dest;
      else if(dest.startsWith('https:')) window.open(dest,'_blank','noopener,noreferrer');
      else window.location.href=dest;
    };
    $('#commandTrigger')?.addEventListener('click',open);
    $$('[data-open-palette]').forEach(button=>button.addEventListener('click',open));
    $('#commandClose')?.addEventListener('click',()=>dialog.close());
    search.addEventListener('input',filter);
    search.addEventListener('keydown',event=>{if(event.key==='Enter'){const first=buttons.find(x=>!x.hidden);if(first){event.preventDefault();choose(first.dataset.command);}}});
    buttons.forEach(button=>button.addEventListener('click',()=>choose(button.dataset.command)));
    dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
    document.addEventListener('keydown',event=>{
      if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();dialog.open?dialog.close():open();}
      if(event.key==='/'&&!event.ctrlKey&&!event.metaKey&&!dialog.open&& !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){event.preventDefault();open();}
    });
  }

  function initContact() {
    $('#copyEmail')?.addEventListener('click',async()=>{
      try {if(!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(email);showToast('EMAIL ADDRESS COPIED');}
      catch {showToast(`COPY MANUALLY: ${email}`);}
    });
    const year=$('#year');if(year)year.textContent=String(new Date().getFullYear());
  }

  function initCoreCanvas() {
    const canvas=$('#coreCanvas'),host=$('#coreStage');if(!canvas||!host)return;
    const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
    const mobile=window.matchMedia('(max-width:640px)').matches;
    const golden=Math.PI*(3-Math.sqrt(5));
    const points=Array.from({length:mobile?74:112},(_,i)=>{const y=1-2*(i+.5)/(mobile?74:112);const radius=Math.sqrt(1-y*y),angle=golden*i;return{x:Math.cos(angle)*radius,y,z:Math.sin(angle)*radius};});
    const edges=[];
    for(let i=0;i<points.length;i++){
      const sorted=[];for(let j=0;j<points.length;j++)if(i!==j){const p=points[i],q=points[j],d=(p.x-q.x)**2+(p.y-q.y)**2+(p.z-q.z)**2;sorted.push([d,j]);}
      sorted.sort((a,b)=>a[0]-b[0]);for(const pair of sorted.slice(0,3))if(i<pair[1])edges.push([i,pair[1]]);
    }
    let width=0,height=0,dpr=1,rotation=0.5,pitch=-.15,drag=false,oldX=0,oldY=0,lastFrame=0,hasFrame=false;
    const resize=()=>{const box=canvas.getBoundingClientRect();width=Math.max(220,box.width);height=Math.max(220,box.height);dpr=Math.min(window.devicePixelRatio||1,1.6);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);};
    resize();if('ResizeObserver' in window)new ResizeObserver(resize).observe(canvas);else window.addEventListener('resize',resize,{passive:true});
    const project=p=>{
      const cr=Math.cos(rotation),sr=Math.sin(rotation),cp=Math.cos(pitch),sp=Math.sin(pitch);
      const xx=p.x*cr-p.z*sr,zz=p.x*sr+p.z*cr,yy=p.y*cp-zz*sp,z=p.y*sp+zz*cp;
      const perspective=2.85/(3.4-z);const size=Math.min(width,height)*.33;
      return{x:width/2+xx*perspective*size,y:height/2+yy*perspective*size,z,depth:perspective};
    };
    const frame=timestamp=>{
      if(!prefersReduced)requestAnimationFrame(frame);
      if(!state.motion||document.hidden||!state.coreVisible)return;
      if(timestamp-lastFrame<(mobile?32:18))return;lastFrame=timestamp;
      if(!drag){rotation+=.0028;pitch+=Math.sin(timestamp*.00014)*.00011;}
      ctx.clearRect(0,0,width,height);
      const mapped=points.map(project);
      ctx.lineWidth=.8;
      for(const [a,b] of edges){const p=mapped[a],q=mapped[b],opacity=.09+(p.z+q.z+2)/4*.32;ctx.strokeStyle=`rgba(255,66,93,${opacity})`;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}
      for(let r=0;r<3;r++){
        ctx.beginPath();const spin=r*.7;
        for(let i=0;i<=180;i++){
          const angle=i/180*Math.PI*2;const p=project({x:Math.cos(angle)*1.18,y:Math.sin(angle)*1.18*Math.sin(spin+.6),z:Math.sin(angle)*1.18*Math.cos(spin+.6)});
          if(!i)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);
        }
        ctx.strokeStyle=`rgba(255,47,81,${.1+r*.05})`;ctx.lineWidth=1;ctx.stroke();
      }
      for(let i=0;i<mapped.length;i++){
        const p=mapped[i];const r=Math.max(1,1.2+(p.z+1)*.9);
        ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);
        ctx.fillStyle=i%9===0?'rgba(255,179,187,.9)':`rgba(255,65,93,${.35+(p.z+1)*.25})`;ctx.fill();
      }
      // Progress pulse on the lattice, rendered locally without claiming live security telemetry.
      const pulseIndex=Math.floor((timestamp*.012)%mapped.length);const pulse=mapped[pulseIndex];
      if(pulse){ctx.strokeStyle='rgba(255,132,155,.7)';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(pulse.x,pulse.y,8+(timestamp%500)/100,0,Math.PI*2);ctx.stroke();}
      hasFrame=true;
    };
    const onDown=e=>{if(e.pointerType==='mouse'&&e.button!==0)return;drag=true;oldX=e.clientX;oldY=e.clientY;if(e.pointerType==='mouse')canvas.setPointerCapture(e.pointerId);};
    const onMove=e=>{if(!drag||!state.motion)return;const dx=e.clientX-oldX,dy=e.clientY-oldY;oldX=e.clientX;oldY=e.clientY;rotation+=dx*.009;pitch=Math.max(-1.3,Math.min(1.3,pitch+dy*.005));};
    canvas.addEventListener('pointerdown',onDown);
    canvas.addEventListener('pointermove',onMove);
    ['pointerup','pointercancel','lostpointercapture'].forEach(type=>canvas.addEventListener(type,()=>{drag=false;}));
    if('IntersectionObserver' in window){new IntersectionObserver(entries=>{state.coreVisible=entries[0]?.isIntersecting??false;},{rootMargin:'120px'}).observe(host);}else state.coreVisible=true;
    if(!prefersReduced)requestAnimationFrame(frame);
    else{state.coreVisible=true;state.motion=true;frame(0);state.motion=false;}
  }

  function initialize() {
    initMotion();
    if(state.motion && 'IntersectionObserver' in window)document.documentElement.classList.add('js-ready');
    initNavigation();initReveal();initPointer();initProjectFilters();initDossiers();initSystems();initSkills();initConsole();initCommands();initContact();initCoreCanvas();
    const boot=$('#boot');
    if(boot)setTimeout(()=>{boot.classList.add('is-out');setTimeout(()=>boot.remove(),650);},state.motion?760:40);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => $("#boot")?.classList.add("is-hidden"), 900);
  $("#year").textContent = new Date().getFullYear();

  // Reveal
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const d = Number(e.target.dataset.delay || 0);
      setTimeout(() => e.target.classList.add("visible"), d);
      io.unobserve(e.target);
    });
  }, {threshold:.12});
  $$(".reveal").forEach(el => io.observe(el));

  // Pointer glow
  const glow = $("#cursorGlow");
  window.addEventListener("pointermove", (e) => {
    if (!glow) return;
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  }, {passive:true});

  // 3D tilt
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    $$(".tilt").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX-r.left)/r.width-.5;
        const y = (e.clientY-r.top)/r.height-.5;
        card.style.transform = `perspective(900px) rotateX(${-y*7}deg) rotateY(${x*9}deg) translateY(-3px)`;
      });
      card.addEventListener("pointerleave", () => card.style.transform = "");
    });
  }

  initSpace();
  initCore();
  initAI();
  initPalette();
  initProjects();
  initContact();
  initMobileMenu();
  loadGitHub();
});

function initSpace(){
  if (!window.THREE) return;
  const canvas=$("#space");
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,1000);
  camera.position.z=40;
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));
  renderer.setSize(innerWidth,innerHeight);

  const geo=new THREE.BufferGeometry();
  const count=1100;
  const positions=new Float32Array(count*3);
  for(let i=0;i<count*3;i++) positions[i]=(Math.random()-.5)*150;
  geo.setAttribute("position",new THREE.BufferAttribute(positions,3));
  const pts=new THREE.Points(geo,new THREE.PointsMaterial({size:.075,color:0x57cfff,transparent:true,opacity:.48}));
  scene.add(pts);

  const ring=new THREE.Mesh(
    new THREE.TorusGeometry(16,0.022,8,180),
    new THREE.MeshBasicMaterial({color:0x2d8bff,transparent:true,opacity:.11})
  );
  ring.rotation.x=1.15; ring.position.set(19,-5,-20); scene.add(ring);

  let mx=0,my=0;
  addEventListener("pointermove",e=>{mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2},{passive:true});
  const clock=new THREE.Clock();
  function loop(){
    requestAnimationFrame(loop);
    const t=clock.getElapsedTime();
    pts.rotation.y=t*.007; pts.rotation.x=t*.003;
    ring.rotation.z=t*.035;
    camera.position.x+=(mx*1.2-camera.position.x)*.015;
    camera.position.y+=(-my*.8-camera.position.y)*.015;
    camera.lookAt(0,0,0);
    renderer.render(scene,camera);
  } loop();
  addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
}

function initCore(){
  if (!window.THREE) return;
  const canvas=$("#core3d");
  const wrap=canvas.parentElement;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(46,1,.1,100);
  camera.position.z=7;
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));

  const core=new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.65,1),
    new THREE.MeshBasicMaterial({color:0x42e8ff,wireframe:true,transparent:true,opacity:.48})
  );
  scene.add(core);
  const inner=new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.02,2),
    new THREE.MeshBasicMaterial({color:0x347fff,wireframe:true,transparent:true,opacity:.2})
  );
  scene.add(inner);
  const halo=new THREE.Mesh(
    new THREE.TorusGeometry(2.15,.018,8,160),
    new THREE.MeshBasicMaterial({color:0x78efff,transparent:true,opacity:.32})
  );
  halo.rotation.x=1.06; scene.add(halo);
  const halo2=halo.clone();halo2.scale.set(.79,.79,.79);halo2.rotation.set(.4,.6,.2);scene.add(halo2);

  function resize(){
    const r=wrap.getBoundingClientRect();
    renderer.setSize(r.width,r.height,false);
    camera.aspect=r.width/r.height; camera.updateProjectionMatrix();
  } resize();
  new ResizeObserver(resize).observe(wrap);

  const clock=new THREE.Clock();
  function loop(){
    requestAnimationFrame(loop);
    const t=clock.getElapsedTime();
    core.rotation.x=t*.18;core.rotation.y=t*.25;
    inner.rotation.x=-t*.23;inner.rotation.y=t*.15;
    halo.rotation.z=t*.13;halo2.rotation.z=-t*.19;
    renderer.render(scene,camera);
  } loop();
}

async function loadGitHub(){
  try{
    const res=await fetch("https://api.github.com/users/hexalpha",{headers:{Accept:"application/vnd.github+json"}});
    if(!res.ok)return;
    const data=await res.json();
    if(data.public_repos!=null) $("#repoCount").textContent=data.public_repos;
  }catch{}
}

function initAI(){
  const panel=$("#aiPanel"), launcher=$("#aiLauncher"), close=$("#aiClose"), form=$("#aiForm"), input=$("#aiInput"), log=$("#aiLog");
  const open=()=>{panel.classList.add("open");panel.setAttribute("aria-hidden","false");setTimeout(()=>input.focus(),120)};
  const shut=()=>{panel.classList.remove("open");panel.setAttribute("aria-hidden","true")};
  launcher.addEventListener("click",()=>panel.classList.contains("open")?shut():open());
  close.addEventListener("click",shut);

  const reply=(q)=>{
    const s=q.toLowerCase();
    if(/darktrace|threat|intel/.test(s)) return "DarkTrace-X is a local-preview threat-intelligence platform with approved-source ingestion, IOC/CVE analysis, investigations, report exports and a Qwen GGUF copilot. Public source: github.com/hexalpha/DarkTrace-X.";
    if(/hex.alert|discord|jobs|alert/.test(s)) return "HEX ALERT collects permitted security feeds and jobs, normalizes alerts and routes reviewed updates to Discord. Its FastAPI dashboard, PostgreSQL storage and optional local GGUF service are in the public source preview: github.com/hexalpha/HEX-ALERT.";
    if(/bounty|pentest|vapt|kali|terminal/.test(s)) return "HexBounty is Junel's local AI-assisted, authorized assessment workspace built with Go, React, Docker, Kali and Ollama. Approval-gated tool execution is under active development; full autonomous workflows are not yet verified.";
    if(/hex.alpha|qwen|ollama|gguf|llm|local ai/.test(s)) return "Hex-Alpha LLM is an experimental local-AI research track using quantized Qwen models, Ollama/llama.cpp, speech experiments and controlled Kali/MCP tool orchestration.";
    if(/skill|stack|tech|python/.test(s)) return "Junel works with Python, Go, React/TypeScript, Next.js, FastAPI, Linux/Kali, Docker, PostgreSQL, Redis, Elasticsearch and local AI.";
    if(/resume|cv/.test(s)) return "Open the Resume button or visit resume.html. The public-safe resume can be printed or saved as a PDF.";
    if(/contact|email|gmail|hire|linkedin/.test(s)) return "Email Junel at junelmohmmad1234@gmail.com using the Contact section. LinkedIn: linkedin.com/in/junel123.";
    return "I can guide you through the four projects: DarkTrace-X, Hex-Alpha LLM, HEX ALERT and HexBounty. Ask about their features, technology, contact or resume. This is a built-in project guide, not a live LLM.";
  };
  form.addEventListener("submit",(e)=>{
    e.preventDefault();
    const q=input.value.trim(); if(!q)return;
    const u=document.createElement("div");u.className="user-msg";u.textContent=q;log.appendChild(u);input.value="";
    log.scrollTop=log.scrollHeight;
    setTimeout(()=>{const b=document.createElement("div");b.className="bot-msg";b.textContent=reply(q);log.appendChild(b);log.scrollTop=log.scrollHeight},260);
  });
}

function initPalette(){
  const p=$("#palette"), openBtn=$("#paletteBtn"), closeBtn=$("#paletteClose");
  const open=()=>{p.classList.add("open");p.setAttribute("aria-hidden","false")};
  const close=()=>{p.classList.remove("open");p.setAttribute("aria-hidden","true")};
  openBtn.addEventListener("click",open);closeBtn.addEventListener("click",close);
  p.addEventListener("click",e=>{if(e.target===p)close()});
  $$("[data-jump]",p).forEach(b=>b.addEventListener("click",()=>{document.querySelector(b.dataset.jump)?.scrollIntoView({behavior:"smooth"});close()}));
  addEventListener("keydown",e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();p.classList.contains("open")?close():open()}
    if(e.key==="Escape") close();
  });
}

function initProjects(){
  const buttons=$$(".filter-chip"),cards=$$(".feature-project");
  buttons.forEach(btn=>btn.addEventListener("click",()=>{
    const filter=btn.dataset.filter;
    buttons.forEach(b=>{const active=b===btn;b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active))});
    cards.forEach(card=>{card.hidden=filter!=="all"&&!card.dataset.tags.split(" ").includes(filter)});
  }));
}
function initContact(){
  const button=$("#copyEmail"),feedback=$("#copyFeedback");
  if(!button)return;
  button.addEventListener("click",async()=>{
    try{
      if(!navigator.clipboard||!window.isSecureContext)throw Error("clipboard unavailable");
      await navigator.clipboard.writeText("junelmohmmad1234@gmail.com");
      button.textContent="Copied email ✓";feedback.textContent="Email address copied";
    }catch{
      button.textContent="Email: junelmohmmad1234@gmail.com";
      feedback.textContent="Select and copy the address shown";
    }
  });
}
function initMobileMenu(){
  const toggle=$("#menuBtn"),nav=$("#primaryNav");if(!toggle||!nav)return;
  const close=()=>{nav.classList.remove("mobile-open");toggle.setAttribute("aria-expanded","false")};
  toggle.addEventListener("click",()=>{const open=nav.classList.toggle("mobile-open");toggle.setAttribute("aria-expanded",String(open))});
  $$("a",nav).forEach(a=>a.addEventListener("click",close));
  window.addEventListener("keydown",e=>{if(e.key==="Escape")close()});
}

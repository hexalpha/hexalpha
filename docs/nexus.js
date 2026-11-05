/* HEXALPHA NEXUS: Interactive topology. Informational visualization, no external API calls. */
(() => {
  'use strict';
  const nodes = {
    intel: {index:'01 / 05',glyph:'◇',label:'THREAT INTELLIGENCE',title:'DarkTrace-X',description:'Source discovery, collection and investigation workflows for threat intelligence.',domain:'INTELLIGENCE',stack:'NEXT.JS / FASTAPI',link:'#work',linkLabel:'EXPLORE PROJECTS'},
    alert: {index:'02 / 05',glyph:'⌁',label:'SECURITY SIGNALS',title:'HEX ALERT',description:'A cybersecurity intelligence feed with CVE monitoring, source collectors and Discord routing.',domain:'MONITORING',stack:'PYTHON / POSTGRESQL',link:'#work',linkLabel:'EXPLORE PROJECTS'},
    assess: {index:'03 / 05',glyph:'⬡',label:'AUTHORIZED ASSESSMENTS',title:'HexBounty',description:'Operator-approved, scope-aware assessment workflows with auditable execution and reporting.',domain:'SECURITY TESTING',stack:'GO / REACT / DOCKER',link:'#work',linkLabel:'EXPLORE PROJECTS'},
    ai: {index:'04 / 05',glyph:'✳',label:'PRIVATE INTELLIGENCE',title:'Hex-Alpha LLM',description:'Local inference experiments with quantized language models and privacy-focused security tooling.',domain:'LOCAL AI',stack:'OLLAMA / LLAMA.CPP',link:'#work',linkLabel:'EXPLORE PROJECTS'},
    defend: {index:'05 / 05',glyph:'⛨',label:'ENGINEERING PRINCIPLES',title:'Build · Test · Defend',description:'Evidence-driven engineering, controlled automation and clear reporting across security workflows.',domain:'SECURITY ENGINEERING',stack:'LINUX / PYTHON',link:'#expertise',linkLabel:'VIEW EXPERTISE'}
  };
  const deck=document.getElementById('hxDeck');
  if(!deck)return;
  const scene=document.getElementById('hxScene');
  const buttons=[...deck.querySelectorAll('[data-hx-node]')];
  const ids={hxNodeIndex:'index',hxGlyph:'glyph',hxNodeLabel:'label',hxNodeTitle:'title',hxNodeDescription:'description',hxNodeDomain:'domain',hxNodeStack:'stack'};
  function select(key){
    const data=nodes[key];if(!data)return;
    for(const [id,prop] of Object.entries(ids)){const el=document.getElementById(id);if(el)el.textContent=data[prop];}
    const link=document.getElementById('hxNodeLink');
    if(link){link.setAttribute('href',data.link);link.firstChild.textContent=data.linkLabel+' ';}
    buttons.forEach(button=>{const selected=button.dataset.hxNode===key;button.classList.toggle('is-selected',selected);button.setAttribute('aria-pressed',String(selected));});
  }
  buttons.forEach(button=>{
    button.addEventListener('click',()=>select(button.dataset.hxNode));
    button.addEventListener('keydown',event=>{
      if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight'&&event.key!=='ArrowUp'&&event.key!=='ArrowDown')return;
      event.preventDefault();const i=buttons.indexOf(button),next=buttons[(i+(event.key==='ArrowLeft'||event.key==='ArrowUp'?-1:1)+buttons.length)%buttons.length];next.focus();select(next.dataset.hxNode);
    });
  });
  select('intel');
  const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(fine&&!reduced&&scene){
    let frame=0;
    scene.addEventListener('pointermove',event=>{
      if(document.body.classList.contains('fx-static')||frame)return;
      const rect=scene.getBoundingClientRect();
      const x=(event.clientX-rect.left)/rect.width-.5;
      const y=(event.clientY-rect.top)/rect.height-.5;
      frame=requestAnimationFrame(()=>{
        scene.style.setProperty('--hx-parallax-x',(x*12).toFixed(2)+'px');
        scene.style.setProperty('--hx-parallax-y',(y*12).toFixed(2)+'px');
        frame=0;
      });
    },{passive:true});
    scene.addEventListener('pointerleave',()=>{scene.style.removeProperty('--hx-parallax-x');scene.style.removeProperty('--hx-parallax-y');});
  }
})();

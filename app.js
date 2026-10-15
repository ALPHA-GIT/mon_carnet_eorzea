const defaults=[["Menuisier", 100], ["Forgeron", 66], ["Armurier", 57], ["Orfèvre", 85], ["Tanneur", 96], ["Couturier", 91], ["Alchimiste", 81], ["Cuisinier", 90]];const saved=JSON.parse(localStorage.getItem('eorzea-levels')||'{}');const levels=Object.fromEntries(defaults.map(([n,l])=>[n,saved[n]??l]));let tab='personnage',selected=null;const view=document.getElementById('view');const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));function render(){document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));if(tab==='personnage')view.innerHTML=`<section class="feature"><div><span class="eyebrow">✦ Guerrière de la Lumière ✦</span><h2>Lenea Silveri</h2><p>Raiden · Carnet d'aventures</p></div></section><div class="tiles"><div class="tile"><span class="eyebrow">Job principal</span><p><strong>100</strong></p>Faucheur</div><div class="tile"><span class="eyebrow">Artisanat</span><p><strong>8</strong></p>Métiers suivis</div></div><section class="card"><h3>Bienvenue dans ton carnet</h3><p>Retrouve tes métiers, tes niveaux et tes collections dans un espace inspiré d'Éorzéa.</p><p class="muted">Tes modifications sont sauvegardées localement sur cet appareil.</p></section>`;if(tab==='collections')view.innerHTML=`<h2 class="section-title">Mes collections</h2><div class="tiles"><div class="card collection-card" style="background-image:linear-gradient(#10182722,#101827dd),url('./assets/hero.svg')"><h3>♞ Montures</h3></div><div class="card collection-card" style="background-image:linear-gradient(#10182722,#101827dd),url('./assets/adventurer.svg')"><h3>✦ Mascottes</h3></div><div class="card collection-card" style="background-image:linear-gradient(#10182722,#101827dd),url('./assets/landscape.svg')"><h3>✧ Apparences</h3></div></div><section class="card"><p class="muted">Le suivi détaillé des collections reste à développer. Aucun objet n'est déclaré obtenu automatiquement.</p></section>`;if(tab==='jobs'){if(selected){const l=levels[selected];const suggestions=selected==='Cuisinier'?['Livraisons de la Grande Compagnie','Commandes de collectionnables adaptées au niveau','Mandats d’artisanat disponibles']:['Livraisons de la Grande Compagnie','Commandes de collectionnables adaptées au niveau','Mandats d’artisanat disponibles'];view.innerHTML=`<button class="back" id="back">← Tous les métiers</button><section class="card"><h2>${escapeHTML(selected)}</h2><div class="row"><label>Niveau actuel</label><input id="level" type="number" min="1" max="100" value="${l}"></div><p>${l>=100?'Niveau maximal atteint !':'Objectif automatique : atteindre le niveau '+(l+1)}</p><progress max="100" value="${l}"></progress><p class="muted">Progression des niveaux : ${l}/100 (XP non renseignée)</p></section><section class="card"><h3>Comment progresser ?</h3>${l>=100?'<p>Ce métier a atteint le niveau 100.</p>':suggestions.map((s,i)=>`<p>${i+1}. ${s}</p>`).join('')}<p class="muted">Suggestions générales pour cette première version ; les prérequis et gains d’XP restent à vérifier en jeu.</p></section>`;document.getElementById('back').onclick=()=>{selected=null;render()};document.getElementById('level').onchange=e=>{levels[selected]=Math.max(1,Math.min(100,Number(e.target.value)||1));localStorage.setItem('eorzea-levels',JSON.stringify(levels));render()}}else{view.innerHTML='<h2 class="section-title">Mes métiers d’artisanat</h2>'+defaults.map(([n],i)=>`<button class="card job-card" style="width:100%;text-align:left" data-job="${escapeHTML(n)}"><span class="job-icon">${['⚒','⚔','⛨','✦','◈','✂','⚗','♨'][i]}</span><span class="job-copy"><strong>${escapeHTML(n)}</strong><br><small>Niveau ${levels[n]} / 100</small><progress max="100" value="${levels[n]}"></progress></span><span>›</span></button>`).join('');document.querySelectorAll('[data-job]').forEach(b=>b.onclick=()=>{selected=b.dataset.job;render()})}}}document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;selected=null;render()});render();if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});

const lodestoneJobs={'Carpenter':'Menuisier','Blacksmith':'Forgeron','Armorer':'Armurier','Goldsmith':'Orfèvre','Leatherworker':'Tanneur','Weaver':'Couturier','Alchemist':'Alchimiste','Culinarian':'Cuisinier','Menuisier':'Menuisier','Forgeron':'Forgeron','Armurier':'Armurier','Orfèvre':'Orfèvre','Tanneur':'Tanneur','Couturier':'Couturier','Alchimiste':'Alchimiste','Cuisinier':'Cuisinier'};
function importLodestone(text){
 let updates={};
 for(const [label,name] of Object.entries(lodestoneJobs)){
  const escaped=label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const patterns=[new RegExp('(?:^|\\n)\\s*(\\d{1,3})\\s*\\n\\s*'+escaped+'\\b','im'),new RegExp('(?:^|\\n)\\s*'+escaped+'\\s*[:\\-]?\\s*(?:Nv\\.?|Lv\\.?|Level)?\\s*(\\d{1,3})\\b','im')];
  for(const p of patterns){const m=text.match(p);if(m){const v=Number(m[1]);if(v>=1&&v<=100)updates[name]=v;break}}
 }
 return updates;
}
document.getElementById('import-lodestone').onclick=()=>{
 const updates=importLodestone(document.getElementById('lodestone-text').value);
 const status=document.getElementById('sync-status');
 if(!Object.keys(updates).length){status.textContent='Aucun niveau reconnu. Vérifie le texte copié depuis la page Classe/Job.';return}
 if(!confirm('Mettre à jour ces niveaux : '+Object.entries(updates).map(([n,l])=>n+' '+l).join(', ')+' ?'))return;
 Object.assign(levels,updates);localStorage.setItem('eorzea-levels',JSON.stringify(levels));render();
 status.textContent=Object.keys(updates).length+' métiers mis à jour depuis le texte du Lodestone.';
};
document.getElementById('sync-lodestone').onclick=async()=>{
 const status=document.getElementById('sync-status');
 status.textContent='Tentative de lecture de la page publique…';
 try{
  const response=await fetch('https://na.finalfantasyxiv.com/lodestone/character/61850504/class_job/',{mode:'cors'});
  if(!response.ok)throw Error('HTTP '+response.status);
  const html=await response.text();const doc=new DOMParser().parseFromString(html,'text/html');
  const updates=importLodestone(doc.body.innerText||doc.body.textContent||'');
  if(!Object.keys(updates).length)throw Error('format de la page non reconnu');
  if(confirm('Importer : '+Object.entries(updates).map(([n,l])=>n+' '+l).join(', ')+' ?')){
   Object.assign(levels,updates);localStorage.setItem('eorzea-levels',JSON.stringify(levels));render();
   status.textContent='Synchronisation terminée : '+Object.keys(updates).length+' métiers.';
  }else status.textContent='Import annulé.';
 }catch(e){status.textContent='Lecture automatique indisponible (restriction du navigateur ou format de page). Utilise l’import manuel ci-dessous. Tes données sont conservées.'}
};

const defaults=[["Menuisier", 100], ["Forgeron", 66], ["Armurier", 57], ["Orfèvre", 85], ["Tanneur", 96], ["Couturier", 91], ["Alchimiste", 81], ["Cuisinier", 92], ["Mineur", 100], ["Botaniste", 100], ["Pêcheur", 100]];let saved={};try{saved=JSON.parse(localStorage.getItem('eorzea-levels')||'{}')||{}}catch{};const levels=Object.fromEntries(defaults.map(([n,l])=>[n,saved[n]??l]));let characterName=localStorage.getItem('eorzea-character-name')||'Lenea Silveri';let tab='personnage',selected=null;const view=document.getElementById('view');const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));function render(){document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));if(tab==='personnage')view.innerHTML=`<section class="feature"><div><span class="eyebrow">✦ Guerrière de la Lumière ✦</span><h2>${escapeHTML(characterName)}</h2><p>Raiden · Carnet d'aventures</p></div></section><div class="tiles"><div class="tile illustrated craft-tile"><span class="eyebrow">Job principal</span><p><strong>100</strong></p>Faucheur</div><div class="tile illustrated gather-tile"><span class="eyebrow">Artisanat</span><p><strong>8</strong></p>Métiers suivis</div></div><section class="card"><h3>Bienvenue dans ton carnet</h3><p>Retrouve tes métiers, tes niveaux et tes collections dans un espace inspiré d'Éorzéa.</p><p class="muted">Tes modifications sont sauvegardées localement sur cet appareil.</p></section>${objectivesHTML()}`;if(tab==='collections')view.innerHTML=`<h2 class="section-title">Mes collections</h2><div class="tiles"><div class="card collection-card mounts-card"><h3>♞ Montures</h3></div><div class="card collection-card mascots-card"><h3>✦ Mascottes</h3></div><div class="card collection-card explore-card"><h3>✧ Apparences</h3></div></div><section class="card"><p class="muted">Le suivi détaillé des collections reste à développer. Aucun objet n'est déclaré obtenu automatiquement.</p></section>`;if(tab==='jobs'){if(selected){const l=levels[selected];const suggestions=selected==='Cuisinier'?['Livraisons de la Grande Compagnie','Commandes de collectionnables adaptées au niveau','Mandats d’artisanat disponibles']:['Livraisons de la Grande Compagnie','Commandes de collectionnables adaptées au niveau','Mandats d’artisanat disponibles'];view.innerHTML=`<button class="back" id="back">← Tous les métiers</button><section class="card"><h2>${escapeHTML(selected)}</h2><div class="row"><label>Niveau actuel</label><input id="level" type="number" min="1" max="100" value="${l}"></div><p>${l>=100?'Niveau maximal atteint !':'Objectif automatique : atteindre le niveau '+(l+1)}</p><progress max="100" value="${l}"></progress><p class="muted">Progression des niveaux : ${l}/100 (XP non renseignée)</p></section><section class="card"><h3>Comment progresser ?</h3>${l>=100?'<p>Ce métier a atteint le niveau 100.</p>':suggestions.map((s,i)=>`<p>${i+1}. ${s}</p>`).join('')}<p class="muted">Suggestions générales pour cette première version ; les prérequis et gains d’XP restent à vérifier en jeu.</p></section>`;document.getElementById('back').onclick=()=>{selected=null;render()};document.getElementById('level').onchange=e=>{levels[selected]=Math.max(1,Math.min(100,Number(e.target.value)||1));localStorage.setItem('eorzea-levels',JSON.stringify(levels));render()}}else{view.innerHTML='<section class="jobs-banner"><h2 class="section-title">⚒ Mes métiers d’artisanat</h2><p>Progression de tes artisans · Clique sur un métier pour modifier son niveau</p></section><div class="job-grid">'+defaults.map(([n],i)=>`<button class="card job-card" style="width:100%;text-align:left" data-job="${escapeHTML(n)}"><span class="job-icon">${['⚒','⚔','⛨','✦','◈','✂','⚗','♨'][i]}</span><span class="job-copy"><strong>${escapeHTML(n)}</strong><br><small>Niveau ${levels[n]} / 100</small><progress max="100" value="${levels[n]}"></progress></span><span>›</span></button>`).join('')+'</div>';document.querySelectorAll('[data-job]').forEach(b=>b.onclick=()=>{selected=b.dataset.job;render()})}}}document.querySelectorAll('[data-character-name]').forEach(el=>el.textContent=characterName);document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;selected=null;render()});render();if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});

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
async function synchronizeLodestone(){
 const status=document.getElementById('sync-status');
 status.textContent='Lecture des dernières données publiées…';
 try{
  const response=await fetch('./data/lodestone.json?t='+Date.now(),{cache:'no-store'});
  if(!response.ok)throw Error('HTTP '+response.status);
  const data=await response.json();
  if(String(data.character_id)!=='61850504')throw Error('Personnage inattendu');
  const updates=Object.fromEntries(Object.entries(data.levels||{}).filter(([name,value])=>Object.hasOwn(levels,name)&&Number.isInteger(value)&&value>=1&&value<=100));
  if(!data.updated_at||!Object.keys(updates).length){status.textContent='Aucune synchronisation publiée pour le moment. Lance le workflow GitHub « Actualiser le Lodestone » dans Actions, puis réessaie.';return}
  const when=new Date(data.updated_at).toLocaleString('fr-FR');
  if(!confirm('Personnage : '+(data.name||'inconnu')+' · Données du '+when+' : mettre à jour '+Object.entries(updates).map(([n,l])=>n+' '+l).join(', ')+' ?')){status.textContent='Import annulé.';return}
  Object.assign(levels,updates);localStorage.setItem('eorzea-levels',JSON.stringify(levels));if(data.name&&typeof data.name==='string'){characterName=data.name;localStorage.setItem('eorzea-character-name',characterName);document.querySelectorAll('[data-character-name]').forEach(el=>el.textContent=characterName)}render();
  status.textContent='Synchronisation réussie : '+Object.keys(updates).length+' niveaux mis à jour (données du '+when+').';localStorage.setItem('eorzea-last-sync',data.updated_at);
 }catch(e){status.textContent='Impossible de charger les données publiées : '+e.message+'. Tes niveaux restent inchangés.'}
}


// V8 — Objectifs personnalisables, persistants et indépendants du Lodestone.
const objectiveCatalog=[
 {id:'craft-blacksmith',group:'Artisanat',title:'Forgeron : atteindre le niveau 70',detail:'Passer du niveau 66 au niveau 70. Priorité aux livraisons de Grande Compagnie, puis aux mandats adaptés.',job:'Forgeron',target:70},
 {id:'craft-armorer',group:'Artisanat',title:'Armurier : atteindre le niveau 60',detail:'Passer du niveau 57 au niveau 60 avec des livraisons et recettes proches de ton niveau.',job:'Armurier',target:60},
 {id:'craft-goldsmith',group:'Artisanat',title:'Orfèvre : atteindre le niveau 90',detail:'Passer du niveau 85 au niveau 90, puis préparer les recettes de Dawntrail.',job:'Orfèvre',target:90},
 {id:'craft-leather',group:'Artisanat',title:'Tanneur : atteindre le niveau 100',detail:'Terminer les quatre derniers niveaux, notamment avec les commandes de collectionnables adaptées.',job:'Tanneur',target:100},
 {id:'craft-weaver',group:'Artisanat',title:'Couturier : atteindre le niveau 100',detail:'Passer du niveau 91 au niveau 100. Comparer mandats et livraisons selon les matériaux disponibles.',job:'Couturier',target:100},
 {id:'craft-alchemist',group:'Artisanat',title:'Alchimiste : atteindre le niveau 90',detail:'Passer du niveau 81 au niveau 90 en utilisant les recettes et livraisons de ta tranche de niveau.',job:'Alchimiste',target:90},
 {id:'craft-culinarian',group:'Artisanat',title:'Cuisinier : atteindre le niveau 100',detail:'Passer du niveau 90 au niveau 100 sans combats : privilégier récolte, mandats et livraisons.',job:'Cuisinier',target:100},
 {id:'relic-reaper',group:'Équipement',title:'Continuer la relique Manderville du Faucheur',detail:'Vérifier l’étape de la faux relique et réunir les monnaies requises avant tout nouvel achat.'},
 {id:'cosmic-tools',group:'Récolte',title:'Progresser sur les outils cosmiques',detail:'Poursuivre les missions d’exploration cosmique et vérifier les paliers d’amélioration des outils.'},
 {id:'mount-arr',group:'Collections',title:'Collectionner les montures des primordiaux ARR',detail:'Suivre les montures manquantes des défis extrêmes d’Ifrit, Garuda, Titan, Léviathan, Ramuh et Shiva.'},
 {id:'mount-regalia',group:'Collections',title:'Obtenir la Regalia',detail:'Vérifier les conditions de l’événement FFXV et réunir les PGS nécessaires si l’échange est disponible.'},
 {id:'housing',group:'Logement',title:'Aménager l’appartement style japonais zen',detail:'Préparer une liste de meubles, éclairages et cloisons pour l’appartement de Brumée.'},
 {id:'story',group:'Épopée',title:'Poursuivre l’épopée après Dawntrail',detail:'Reprendre la quête principale en cours et vérifier le niveau d’objet requis pour le prochain contenu.'}
];
let objectiveState={};try{objectiveState=JSON.parse(localStorage.getItem('eorzea-v8-objectives')||'{}')||{}}catch{}
let objectiveFilter='Tous';
function objectiveDone(o){return objectiveState[o.id]===true||(objectiveState[o.id]!==false&&o.job&&levels[o.job]>=o.target)}
function objectivesHTML(){
 const done=objectiveCatalog.filter(objectiveDone).length;
 const groups=['Tous',...new Set(objectiveCatalog.map(o=>o.group))];
 const visible=objectiveCatalog.filter(o=>objectiveFilter==='Tous'||o.group===objectiveFilter);
 return `<section class="card objectives-panel"><div class="objective-head"><div><span class="eyebrow">✦ Journal de progression · 0.0.9</span><h2>Mes objectifs d'aventure</h2><p>Des objectifs concrets pour ${escapeHTML(characterName)}, à cocher au fil de tes aventures.</p></div><div class="objective-count"><strong>${done}/${objectiveCatalog.length}</strong><small>terminés</small></div></div><progress value="${done}" max="${objectiveCatalog.length}"></progress><div class="objective-filters">${groups.map(g=>`<button class="objective-filter ${objectiveFilter===g?'chosen':''}" data-filter="${escapeHTML(g)}">${escapeHTML(g)}</button>`).join('')}</div><div class="objective-list">${visible.map(o=>{const complete=objectiveDone(o);return `<article class="objective-item ${complete?'completed':''}"><label class="objective-check"><input type="checkbox" data-objective="${o.id}" ${complete?'checked':''} aria-label="Marquer ${escapeHTML(o.title)} comme terminé"><span></span></label><div><small class="objective-group">${escapeHTML(o.group)}</small><h3>${escapeHTML(o.title)}</h3><p>${escapeHTML(o.detail)}</p>${o.job?`<small class="objective-job">Niveau actuel : ${levels[o.job]} / ${o.target}</small>`:''}</div></article>`}).join('')}</div><p class="muted">Les niveaux d'artisanat peuvent valider automatiquement certains objectifs. Les autres sont suivis manuellement sur cet appareil. Les étapes proposées sont des pistes de progression, pas des quêtes automatiquement vérifiées.</p></section>`
}
document.addEventListener('click',e=>{const btn=e.target.closest('[data-filter]');if(btn){objectiveFilter=btn.dataset.filter;render()}});
document.addEventListener('change',e=>{if(e.target.matches('[data-objective]')){objectiveState[e.target.dataset.objective]=e.target.checked;localStorage.setItem('eorzea-v8-objectives',JSON.stringify(objectiveState));render()}});

// v0.0.10: click handler and status visible even if the browser caches the previous page.
document.addEventListener('click',event=>{const btn=event.target.closest('#sync-lodestone');if(!btn)return;event.preventDefault();if(btn.disabled)return;btn.disabled=true;synchronizeLodestone().finally(()=>{btn.disabled=false;});});

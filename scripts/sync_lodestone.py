"""Fetch public Lodestone class/job levels for GitHub Pages; no credentials."""
import json, os, re, sys
from datetime import datetime, timezone
from pathlib import Path
import requests
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
CHARACTER_ID=os.getenv('LODESTONE_CHARACTER_ID','61850504')
if not re.fullmatch(r'\d{5,12}', CHARACTER_ID): raise ValueError('Invalid Lodestone character ID')
URL=f'https://na.finalfantasyxiv.com/lodestone/character/{CHARACTER_ID}/class_job/'
NAMES={'Carpenter':'Menuisier','Blacksmith':'Forgeron','Armorer':'Armurier','Goldsmith':'Orfèvre','Leatherworker':'Tanneur','Weaver':'Couturier','Alchemist':'Alchimiste','Culinarian':'Cuisinier','Miner':'Mineur','Botanist':'Botaniste','Fisher':'Pêcheur','Menuisier':'Menuisier','Forgeron':'Forgeron','Armurier':'Armurier','Orfèvre':'Orfèvre','Tanneur':'Tanneur','Couturier':'Couturier','Alchimiste':'Alchimiste','Cuisinier':'Cuisinier','Mineur':'Mineur','Botaniste':'Botaniste','Pêcheur':'Pêcheur'}
response=requests.get(URL,headers={'User-Agent':'Mozilla/5.0 (compatible; EorzeaCarnet/0.0.9; public-profile-sync)'},timeout=35)
response.raise_for_status()
soup=BeautifulSoup(response.text,'html.parser')
# Parse only job cards, never unrelated numbers (XP, achievements, etc.).
levels={}
for row in soup.select('.character__job__list li, .character__job__item, .character__job__list'):
    name_el=row.select_one('.character__job__name, .character__job__name--sub')
    level_el=row.select_one('.character__job__level')
    if not name_el or not level_el: continue
    name=name_el.get_text(' ',strip=True)
    level_text=level_el.get_text(' ',strip=True)
    match=re.fullmatch(r'(?:Lv\.?\s*)?(\d{1,3}|-)',level_text,re.I)
    if name in NAMES and match and match.group(1).isdigit():
        level=int(match.group(1))
        if 1<=level<=100: levels[NAMES[name]]=level
# Alternative markup: find job name/level inside one small, bounded row.
if len(levels)<8:
    for row in soup.select('li, tr'):
        if row.find(['li','tr']): continue
        text=row.get_text(' ',strip=True)
        if len(text)>110: continue
        for en,fr in NAMES.items():
            if fr in levels: continue
            match=re.search(r'(?<![\w])(?:Lv\.?\s*)?(\d{1,3})\s+'+re.escape(en)+r'(?!\w)',text,re.I)
            if match and 1<=int(match.group(1))<=100: levels[fr]=int(match.group(1))
# Page title is normally "Character Name | FINAL FANTASY XIV, The Lodestone".
title=soup.title.get_text(' ',strip=True) if soup.title else ''
name=title.split('|')[0].strip()
if not name or 'lodestone' in name.lower() or len(name)>70:
    name_node=soup.select_one('.frame__chara__name, .character__name, .character__profile__name')
    name=name_node.get_text(' ',strip=True) if name_node else ''
if len(levels)<8:
    raise RuntimeError(f'Only {len(levels)} crafting/gathering levels recognized: refusing to overwrite cached data')
if not name or len(name.split())<2:
    raise RuntimeError('Character name not recognized: refusing to publish incomplete data')
out={'character_id':CHARACTER_ID,'name':name,'world':'Raiden','source':URL,'updated_at':datetime.now(timezone.utc).isoformat(),'levels':levels}
path=ROOT/'data'/'lodestone.json';path.parent.mkdir(exist_ok=True)
path.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Synced',len(levels),'jobs:',', '.join(levels))

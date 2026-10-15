"""Fetch public Lodestone class/job levels for GitHub Pages; no credentials."""
import json, os, re, sys
from datetime import datetime, timezone
from pathlib import Path
import requests
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
CHARACTER_ID = os.getenv('LODESTONE_CHARACTER_ID', '61850504')
if not re.fullmatch(r'\d{5,12}', CHARACTER_ID):
    raise ValueError("Identifiant Lodestone invalide")
if not CHARACTER_ID: raise ValueError('Invalid Lodestone character ID')
URL=f'https://na.finalfantasyxiv.com/lodestone/character/{CHARACTER_ID}/class_job/'
NAMES={'Carpenter':'Menuisier','Blacksmith':'Forgeron','Armorer':'Armurier','Goldsmith':'Orfèvre','Leatherworker':'Tanneur','Weaver':'Couturier','Alchemist':'Alchimiste','Culinarian':'Cuisinier','Miner':'Mineur','Botanist':'Botaniste','Fisher':'Pêcheur','Menuisier':'Menuisier','Forgeron':'Forgeron','Armurier':'Armurier','Orfèvre':'Orfèvre','Tanneur':'Tanneur','Couturier':'Couturier','Alchimiste':'Alchimiste','Cuisinier':'Cuisinier','Mineur':'Mineur','Botaniste':'Botaniste','Pêcheur':'Pêcheur'}
response=requests.get(URL,headers={'User-Agent':'Mozilla/5.0 (compatible; EorzeaCarnet/7.0; public-profile-sync)'},timeout=35)
response.raise_for_status()
soup=BeautifulSoup(response.text,'html.parser')
levels={}
# The official page groups jobs in list rows. Read name and level from the SAME row.
for row in soup.select('li, .character__job__list, .character__job__item, tr'):
    text=row.get_text(' ',strip=True)
    if len(text)>180: continue
    for english,french in NAMES.items():
        if not re.search(r'(?<!\w)'+re.escape(english)+r'(?!\w)',text,re.I): continue
        numbers=re.findall(r'(?<!\d)(\d{1,3})(?!\d)',text)
        valid=[int(n) for n in numbers if 1<=int(n)<=100]
        if len(valid)==1: levels[french]=valid[0]
# Fallback: text line adjacency (some Lodestone layouts are not list-based).
lines=[x.strip() for x in soup.get_text('\n').splitlines() if x.strip()]
for i,line in enumerate(lines):
    for english,french in NAMES.items():
        if french in levels or line.lower()!=english.lower(): continue
        for adjacent in lines[max(0,i-2):i]+lines[i+1:i+3]:
            if re.fullmatch(r'(?:Lv\.?|Level\s*)?\s*\d{1,3}',adjacent,re.I):
                number=int(re.search(r'\d+',adjacent).group())
                if 1<=number<=100: levels[french]=number;break
if len(levels)<3:
    raise RuntimeError(f'Only {len(levels)} levels recognized: refusing to overwrite cached data')
out={'character_id':CHARACTER_ID,'source':URL,'updated_at':datetime.now(timezone.utc).isoformat(),'levels':levels}
path=ROOT/'data'/'lodestone.json';path.parent.mkdir(exist_ok=True)
path.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Synced',len(levels),'jobs:',', '.join(levels))

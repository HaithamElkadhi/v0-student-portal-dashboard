import json,urllib.request,re
from pathlib import Path
v={}
for line in Path('.env.local').read_text(encoding='utf-8-sig').splitlines():
 m=re.match(r'^([A-Z0-9_]+)\s*=\s*(.*)$',line)
 if m:v[m[1]]=m[2].strip().strip('"').strip("'")
base=v['AIRTABLE_BASE_ID'];headers={'Authorization':'Bearer '+v['AIRTABLE_API_KEY'],'Content-Type':'application/json'}
url='https://api.airtable.com/v0/meta/bases/'+base+'/tables'
def call(u,data=None):
 r=urllib.request.Request(u,headers=headers,data=json.dumps(data).encode() if data else None)
 try:return json.load(urllib.request.urlopen(r,timeout=30))
 except urllib.error.HTTPError as e:raise RuntimeError(str(e.code)+' '+e.read().decode())
tables=call(url)['tables'];name='Connexions portail étudiant';table=next((t for t in tables if t['name']==name),None)
if not table:
 prospect=next(t for t in tables if t['name']=='Prospects')
 table=call(url,{'name':name,'description':'Historique des accès réussis au portail étudiant. Une ligne par connexion explicite ; les rafraîchissements sont exclus. Enregistrement de l’accès au dossier, sans preuve d’identité supplémentaire.','fields':[{'name':'Connexion','type':'singleLineText'},{'name':'Étudiant','type':'multipleRecordLinks','options':{'linkedTableId':prospect['id']}},{'name':'Date de connexion','type':'dateTime','options':{'dateFormat':{'name':'iso'},'timeFormat':{'name':'24hour'},'timeZone':'Africa/Tunis'}},{'name':'Email','type':'email'},{'name':'Numéro de dossier','type':'singleLineText'},{'name':'Mode de connexion','type':'singleSelect','options':{'choices':[{'name':'Email','color':'blueLight2'},{'name':'Numéro de dossier','color':'cyanLight2'}]}}]})
result={'tableId':table['id'],'fields':{f['name']:f['id'] for f in table['fields']}}
Path('tmp/portal-login-schema.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(result,ensure_ascii=False))

import json,urllib.request,urllib.parse,re
from pathlib import Path
v={}
for line in Path('.env.local').read_text(encoding='utf-8-sig').splitlines():
 m=re.match(r'^([A-Z0-9_]+)\s*=\s*(.*)$',line)
 if m:v[m[1]]=m[2].strip().strip('"').strip("'")
s=json.loads(Path('tmp/portal-login-schema.json').read_text(encoding='utf-8')); table=s['tableId']; fields=s['fields']
def history():
 q=urllib.parse.urlencode({'filterByFormula':"{Email}='foulen@foilen.com'"})
 r=urllib.request.Request('https://api.airtable.com/v0/'+v['AIRTABLE_BASE_ID']+'/'+table+'?'+q,headers={'Authorization':'Bearer '+v['AIRTABLE_API_KEY']})
 return json.load(urllib.request.urlopen(r))['records']
def verify(body):
 r=urllib.request.Request('http://localhost:3001/api/verify-student',data=json.dumps(body).encode(),headers={'Content-Type':'application/json'})
 try:
  response=urllib.request.urlopen(r,timeout=90);return response.status,json.load(response).get('success')
 except urllib.error.HTTPError as e:return e.code,False
before=len(history())
assert verify({'email':'foulen@foilen.com','loginEvent':True})==(200,True)
assert len(history())==before+1
assert verify({'folderId':'TUNFB24','loginEvent':True})==(200,True)
rows=history();assert len(rows)==before+2
assert {r['fields'].get('Mode de connexion') for r in rows}>={'Email','Numéro de dossier'}
assert verify({'email':'foulen@foilen.com','folderId':'TUNFB24'})==(200,True)
assert len(history())==before+2
assert verify({'email':'no-such-login-demo@example.invalid','loginEvent':True})[0]==404
assert len(history())==before+2
print('PASS: email login, dossier login, refresh excluded, failed login excluded; 2 demo login events recorded.')

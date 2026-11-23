import json,urllib.request,urllib.parse,time,base64,io,re
from pathlib import Path
from reportlab.pdfgen import canvas
R=Path.cwd(); env={}
for l in (R/'.env.local').read_text(encoding='utf-8-sig').splitlines():
 m=re.match(r'^([A-Z0-9_]+)\s*=\s*(.*)$',l)
 if m:env[m[1]]=m[2].strip().strip('"').strip("'")
BASE='appkqvTuc8F0AhWPp';KEY=env['AIRTABLE_API_KEY']; S=json.loads((R/'tmp/pdfs/schema.json').read_text(encoding='utf-8-sig'))['tables']; tabs={t['name']:t for t in S}
manifest=R/'tmp/pdfs/foulen-records.json'; saved=json.loads(manifest.read_text()) if manifest.exists() else {}
def req(path,data=None,method=None,content=False):
 time.sleep(.24)
 u=('https://content.airtable.com/v0/' if content else 'https://api.airtable.com/v0/')+BASE+'/'+path
 r=urllib.request.Request(u,data=json.dumps(data).encode() if data is not None else None,headers={'Authorization':'Bearer '+KEY,'Content-Type':'application/json'},method=method)
 try:return json.load(urllib.request.urlopen(r,timeout=40))
 except urllib.error.HTTPError as e:raise RuntimeError(str(e.code)+' '+e.read().decode())
def fields(t,values):
 f={x['name']:x for x in tabs[t]['fields']};out={}
 for k,v in values.items():
  if k not in f:raise ValueError(k)
  spec=f[k]
  if spec['type'] in ['singleSelect','multipleSelects']:
   choices=[c['name'] for c in spec['options'].get('choices',[])]; normalize=lambda z: next((c for c in choices if c.strip()==z.strip()),z)
   v=[normalize(x) for x in v] if isinstance(v,list) else normalize(v)
  out[spec['id']]=v
 return out
def save(key,t,values):
 tid=tabs[t]['id'];data={'fields':fields(t,values)}
 if key in saved:r=req(tid+'/'+saved[key],data,'PATCH')
 else:r=req(tid,data,'POST');saved[key]=r['id'];manifest.write_text(json.dumps(saved,indent=2))
 return r
# Idempotent lookup, never overwrite a real student's dossier.
if 'prospect' not in saved:
 q=urllib.parse.urlencode({'filterByFormula':"LOWER({Email})='foulen@foilen.com'"})
 existing=req(tabs['Prospects']['id']+'?'+q)['records']
 if existing:raise RuntimeError('Email already exists; inspect before reusing.')
p=save('prospect','Prospects',{'Name':'Foulen','Surname':'Ben Foulen','Email':'foulen@foilen.com','Phone':'+21600000000','WhatsApp Number':'+21600000000','Gender':'Male','Birthday':'2002-04-12','Nationality':['Tunisia'],'Country of residence':'Tunisia','City of Birth':'Tunis - DEMO','Full Address':'12 rue de la Démonstration, Tunis - ADRESSE FICTIVE','Passport Number':'DEMO-NON-VALIDE','Date of Issue':'2024-01-01','Date of Expiry':'2030-01-01','Place of Issue':'DEMO','Prospect Situation':['Student'],'Admission_Status':['Admitted'],'Account Status':'Active','Target Country':'Italy','Current Status':'Student','Last Academic Level':'Bac +3 (Licence)','Last Diploma Obtained':'Licence informatique - DEMO','Obtained Diplomas':['Bac','Licence'],'Background':['Computer Science'],'Year of Graduation':2025,'Current Occupation':'Étudiant fictif pour manuel','Academic Record — Description':'DEMO : baccalauréat 2022, licence informatique 2025. Aucune qualification réelle.','Languages':['ENGLISH','FRENCH','ARABIC'],'Language Record — Description':'DEMO : anglais B2, français C1, arabe natif.','Entry Level':['Master'],'Target Degree Level':'master','Intended Intake':['27 - 28'],'Primary Field of Study':'Data Science - DEMO','Field of Previous Studies':'Computer Science','Alternative Field':'Artificial Intelligence - DEMO','Preferred Field of Study':'Data Science - DEMO','City Preference Type':'Student city','Preferred City / University':'Université Démonstration de Turin - établissement fictif','Program Languages':['English'],'Financing Plan':'Scholarship + personal funds','Financial Guarantor':'Parent','Available Budget (€)':8000,'Blocked Account':'Yes','Support from Abroad':'No','Abroad Support Details':'DEMO : aucun soutien extérieur','Selected Services':['Pack tout inclus (2 300 DT)'],'Services Note':'DEMO UNIQUEMENT - aucune prestation réelle ni engagement.','Note':'DEMO - Manuel utilisateur - ne pas contacter ni facturer','Note ( Write something about the student requesr : Field , City , University ) ':'DEMO : projet de master en informatique en Italie.','Proposal_Status':['Accepted & Signed'],'Proposal Date':'2026-10-14','Valid Until':'2026-12-31','Email For application':'foulen.candidature@example.com','Contrat_Signed':True,'Application University':['Accepted'],'Account_Universitaly':'Done','Universitaly Validation':'Yes','Account Pronotami':'Done','Admission Folder documents':'DEMO : documents reçus pour illustration','Documents demandés':'Identité :\nPasseport valide\nPhoto récente\n\nÉtudes :\nDiplôme du baccalauréat\nRelevés de notes\nDiplôme de licence\n\nLangue :\nJustificatif anglais B2\n\nDEMO - liste fictive pour le manuel','Scholarship Status':'Submitted','Scholarship Type':'Regional','Region/Authority':'EDISU Piemonte','Scholarship Document Status':'Complete','Scholarship ISEE':'Received','Scholarship Submission Date':'2026-10-14','Scholarship DDL':'2026-12-15','Scholarship Payment':'Not Applicable','Statut Visa':'Appointment Booked','Appointment Date':'2026-11-20','Notes (Visa)':'DEMO - rendez-vous fictif, aucune réservation consulaire.','Dernier contact':'2026-10-14','Motif dernier contact':'DEMO : vérification des pièces du manuel','Historique contacts':'14/10/2026 — DEMO : vérification des documents\n13/10/2026 — DEMO : orientation master\n12/10/2026 — DEMO : présentation du portail'})
pid=p['id']; folder=req(tabs['Prospects']['id']+'/'+pid)['fields']['Prospect ID'];saved['folderId']=folder;manifest.write_text(json.dumps(saved,indent=2))
for i,(univ,course,status,city) in enumerate([('Université Démonstration Turin - FICTIF','MSc Data Science - DEMO','Admitted','Turin'),('Université Démonstration Bologne - FICTIF','MSc Artificial Intelligence - DEMO','Submitted','Bologne')]):
 save('application'+str(i),'Prospects Applications',{'University':univ,'Students':[pid],'Course':course,'Course Language':'EN','Degree Level':'Laurea Magistrale','Campus City':city,'Application Status':status,'Date of Candidacy':'2026-10-10','Commentaire':'DEMO - candidature et décision inventées pour le manuel.'})
for i,(label,user) in enumerate([('Email Candidature','foulen.candidature@example.com'),('Universitaly','foulen.demo'),('University Plateform','foulen.demo.universite')]):save('account'+str(i),'Accounts',{'Mail / User Name':user,'Account label':[label],'Full  name':[pid]})
for i,(amt,currency,status,purpose,due) in enumerate([('650','TND','À payer','Frais dossier documents','2026-11-05'),('1300','TND','Payé','Acompte admission','2026-10-01'),('50','EUR','Exonéré','Application Fees','2026-11-10')]):
 save('payment'+str(i),'Paiements',{'Prospects':[pid],'Amount':amt,'Currency':currency,'Status':status,'Purpose':[purpose],'Due Date':due,'Comment':'DEMO - facture fictive, aucun règlement à effectuer','Billing Address':'Adresse fictive du manuel','Payment Method':'DEMO'})
lang=save('language','Justificatifs de langue',{'Justificatif':'DEMO - IELTS Foulen','Prospect':[pid],'Langue':'english','Type':'ielts','Score ou niveau':'6.5','Date du justificatif':'2026-09-01','Etablissement':'Centre fictif DEMO','Diplome ou precision':'DEMO - aucun certificat officiel'})
doc=save('documents','Documents',{'Name':'DEMO - Dossier traduit Foulen','Prospect':[pid],'Email':'foulen@foilen.com','Submission Date':'2026-10-14','Diploma Level':'Licence','Field of Study':'Computer Science','Score Format':'/20','Score Value':'15','Gap Years':0,'Passport Expiry':'2030-01-01','Language Cert Name':'IELTS Academic','Documents Status':'Complete','Dossier Submitted':True,'Total Documents Expected':3,'Documents Submitted Count':3,'Review Note':'DEMO - documents fictifs non recevables'})
original=save('original','Dossier original',{'Full Name':'Foulen Ben Foulen - DEMO','Prospect ID':folder,'Documents to Translate':'DEMO : diplôme et relevés','Statut de dossier':'Complet','Évaluation dossier':'Bon','Folder Contenant':'DEMO - scans pédagogiques'})
fol=save('folder','Prospect Folders',{'Name':'Foulen','Surname':'Ben Foulen','Prospect ID':folder,'Last Academic Level':'Bachelor','Documents Status':'Complete','Document Languages':['EN','FR'],'IELTS Score':'6.5','Description of other docs ':'DEMO - dossier fictif'})
save('ticket','Tasks',{'Type':'Ticket','Task Type':'Document Request','Prospect Name':'Foulen Ben Foulen - DEMO','Client Email':'foulen@foilen.com','Linked Prospect':[pid],'Objet':'DEMO : demande sur les documents','Description':'Ticket fictif pour manuel. Ne pas traiter ni contacter.','Task Status':'Done','Priority':'Low'})
save('booking','Booking',{'Name':'DEMO - consultation fictive Foulen','Student Name':'Foulen Ben Foulen - DEMO','Email':'foulen@foilen.com','Linked Prospect':[pid],'Date & Time':'2026-10-13T10:00:00Z','Duration (min)':30,'Meeting Type':'Follow up','Booking Status':'Completed','Notes':'DEMO - aucune réunion réelle, ne pas envoyer de message'})
bourse=save('bourse','Bourse-Documents',{'Prospect':[pid],'Date soumission':'2026-10-14','Membres du foyer':'DEMO : Foulen, parent 1, parent 2 - personnes fictives','Statut dossier bourse':'Reçu','Review Note':'DEMO - aucune demande réelle'})
for i,step in enumerate(['Welcome package','Codice fiscale','University enrollment','Kit permesso','ISEE / ISEEU','Revolut assistance','Housing','Health insurance']):
 save('integration'+str(i),'Student Integration',{'Name':'DEMO - '+step,'Student':[pid],'Student Record ID':pid,'Step':step,'Status':'Done' if i<2 else 'In progress','Due Date':'2026-11-30','Notes':'DEMO - suivi fictif pour manuel, aucune démarche effectuée.'})
def sample(title):
 b=io.BytesIO();c=canvas.Canvas(b);c.setFillColorRGB(.09,.23,.4);c.setFont('Helvetica-Bold',22);c.drawString(48,770,'DEMONSTRATION - DOCUMENT FICTIF');c.setFont('Helvetica',15);c.drawString(48,720,'Foulen Ben Foulen');c.drawString(48,685,title);c.setFont('Helvetica',11);c.drawString(48,640,'Sans valeur officielle. Ne pas utiliser pour une demarche reelle.');c.drawString(48,615,'Cree uniquement pour illustrer le manuel JEEXPERT.');c.save();return b.getvalue()
def upload(record,field,title,filename):
 key='upload:'+record+':'+field+':'+filename
 if key in saved:return
 req(record+'/'+field+'/uploadAttachment',{'contentType':'application/pdf','filename':filename,'file':base64.b64encode(sample(title)).decode()},'POST',True);saved[key]=True;manifest.write_text(json.dumps(saved,indent=2))
upload(pid,'fld6Uug1kJjZWeKJe','Fiche orientation','DEMO-Fiche-orientation.pdf')
for title in ['Diplome','Releve-notes']:
 upload(pid,'fld3E5UlY00NyNaDx',title,'DEMO-'+title+'-original.pdf')
 upload(doc['id'],'fldlw19MuDmTwg7iy',title,'DEMO-'+title+'-traduit.pdf')
upload(doc['id'],'fldlw19MuDmTwg7iy','Passeport fictif','DEMO-Passeport.pdf')
upload(lang['id'],'fldd3PmCebt4a3zSI','IELTS 6.5 fictif','DEMO-IELTS.pdf')
for i in range(3):upload(saved['payment'+str(i)],'fldy0JFBVkYmOmZTT','Facture fictive - NE PAS PAYER','DEMO-Facture.pdf')
upload(fol['id'],'fldmpld1M9EQWyADN','Passeport fictif','DEMO-Passeport.pdf')
upload(bourse['id'],'fldFEqqFT5aDClPVu','Acte fictif','DEMO-Acte.pdf')
print(json.dumps({'recordId':pid,'folderId':folder,'email':'foulen@foilen.com','linkedRecords':len([k for k in saved if not k.startswith('upload:')])}))

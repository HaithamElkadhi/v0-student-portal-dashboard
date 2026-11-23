from pathlib import Path
exec(Path('tmp/pdfs/seed_foulen.py').read_text().split('# Idempotent lookup')[0])
for label in ['PassportPhoto','Passport','CV','LanguageCert','DeclarationDeValeur','Recommendation1','Recommendation2','BacDiploma','BacTranscript','LicenceDiploma','LicenceTranscriptY1','LicenceTranscriptY2','LicenceTranscriptY3','StudyPlanLicence']:
 upload=None
 # Use the same attachment endpoint with visibly fictitious content.
 b=io.BytesIO(); c=canvas.Canvas(b);c.setFont('Helvetica-Bold',20);c.drawString(40,760,'DEMO - DOCUMENT FICTIF');c.setFont('Helvetica',13);c.drawString(40,710,'Foulen Ben Foulen - '+label);c.drawString(40,670,'Sans valeur officielle. Manuel utilisateur uniquement.');c.save()
 key='all-doc:'+label
 if key not in saved:
  req(saved['documents']+'/fldlw19MuDmTwg7iy/uploadAttachment',{'contentType':'application/pdf','filename':'DEMO_Foulen_'+label+'.pdf','file':base64.b64encode(b.getvalue()).decode()},'POST',True)
  saved[key]=True;manifest.write_text(json.dumps(saved,indent=2))
req(tabs['Documents']['id']+'/'+saved['documents'],{'fields':{'fldTT09a4RdZmRvOh':17,'fldjiRsKUUxt7Ra78':14}},'PATCH')
print('14 documents DEMO ajoutés au dossier traduit')

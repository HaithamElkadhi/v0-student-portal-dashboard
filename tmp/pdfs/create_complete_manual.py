from pathlib import Path
import json
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor,white
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from PIL import Image,ImageDraw
from pypdf import PdfReader
import subprocess,math
R=Path.cwd();T=R/'tmp/pdfs';O=R/'output/pdf/Manuel-utilisation-JEEXPERT.pdf'
for n,f in [('Poppins','Poppins-Regular.ttf'),('PoppinsBold','Poppins-SemiBold.ttf')]:pdfmetrics.registerFont(TTFont(n,str(T/f)))
B=HexColor('#173B65');A=HexColor('#80C4EA');I=HexColor('#172D43');M=HexColor('#526678');W,H=595.28,841.89
entries=[
('Démarrer','Connexion','connexion','Choisissez votre mode de connexion.', ['Choisissez Email et saisissez foulen@foilen.com, ou utilisez le dossier TUNFB24.','Validez Accéder à mon portail. En cas d’erreur, vérifiez la saisie puis contactez votre conseiller.']),
('Démarrer','Menu et navigation mobile','menu','Les modules restent accessibles depuis votre téléphone.', ['La barre du bas propose Accueil, Menu, Rendez-vous et Support.','Touchez une carte du menu pour ouvrir le module. Le profil est accessible par l’icône utilisateur en haut.']),
('Démarrer','Votre profil','profil','Retrouvez vos informations personnelles.', ['Vérifiez nom, coordonnées, date de naissance, nationalité, adresse et validité du passeport.','Les données de Foulen sont fictives. Pour un dossier réel, signalez toute erreur à votre conseiller.']),
('Démarrer','Accueil et activité','accueil','Vos informations essentielles au même endroit.', ['Admission : décision, université, formation et nombre de candidatures. La barre indique l’avancement des étapes.','Finances : paiements dus et échéances ; rouge si un paiement reste à régler, vert sinon.','Activité : contacts, tickets, rendez-vous et emails, sans les changements de statut. Les dates et objets viennent du suivi enregistré.']),
('Admission','Les dix étapes du parcours','parcours','Ouvrez Admission depuis le menu.', ['Le calendrier présente dix étapes, de la fiche d’orientation à Universitaly.','Sur téléphone, touchez la carte pour ouvrir ses détails. Sur ordinateur, utilisez les boutons lorsqu’ils sont proposés.','Le pourcentage reflète les étapes complétées et en cours. Il ne mesure pas vos chances d’admission.']),
('Admission / 01','Fiche d’orientation','orientation','Consultez votre projet en lecture seule.', ['Vérifiez votre profil, votre parcours académique et linguistique.','Faites défiler pour lire diplôme visé, rentrée, domaine, ville, financement et services.','Le taux de remplissage de la fiche est distinct de l’avancement global de l’admission.']),
('Admission / 01','Préférences et financement','orientation-suite','La suite de la fiche d’orientation.', ['Vérifiez le programme, les langues et les préférences géographiques.','Consultez le budget, le garant financier, les aides et les services sélectionnés.','Contactez votre conseiller pour faire corriger une information.']),
('Admission / 02','Lire le règlement','reglement','Le contrat est consultable directement dans le parcours.', ['Lisez toutes les clauses en faisant défiler la fenêtre.','Vérifiez votre identité et les prestations indiquées avant toute acceptation.','Aucune acceptation réelle n’a été effectuée pour produire ce guide.']),
('Admission / 02','Zone d’acceptation','reglement-fin','L’acceptation est une action personnelle.', ['Après lecture, le bouton J’accepte le contrat permet au véritable étudiant de confirmer son accord.','Ne cliquez que si vous comprenez et acceptez les conditions.','Le dossier du manuel est une démonstration et ne constitue pas un contrat réel.']),
('Admission / 03','Documents demandés','demandes','La liste du conseiller est organisée par thème.', ['Consultez les rubriques Identité, Études et Langue.','Préparez chaque document demandé ; la liste peut différer selon le dossier.','Une carte verte signifie que des consignes sont renseignées, pas que tous les documents sont déjà validés.']),
('Admission / 04','Comptes de candidature','comptes','Consultez les comptes créés à votre nom.', ['L’adresse e-mail de candidature apparaît en premier.','La liste peut inclure email, Universitaly et plateforme universitaire.','Les mots de passe et délégations ne sont pas affichés. Les identifiants de Foulen sont des exemples fictifs.']),
('Admission / 05','Justificatifs de langue','langues','Choisissez une langue et un justificatif.', ['Anglais : EF SET, IELTS Academic, TOEFL, Cambridge, attestation d’études en anglais (MOI), test interne ou autre justificatif.','Italien : CILS, CELI, PLIDA, CERT.IT, test interne, études en italien ou autre justificatif.','Renseignez le score ou niveau lorsqu’il est demandé, joignez le fichier puis enregistrez. Document déposé ne signifie pas accepté par l’université.']),
('Admission / 05','Les deux tests EF SET','ef','Les liens du test dépendent de la version choisie.', ['Choisissez EF SET puis 50 ou 90 minutes.','Le portail affiche les liens des deux tests. Les autres types de test disposent de liens d’information.','Après le test, revenez déposer le certificat et votre score. Vérifiez toujours les exigences de votre formation.']),
('Admission / 06','Dossier Original','originaux','Déposez les scans dans la langue d’origine.', ['Ajoutez tous les relevés de notes et diplômes obtenus. Plusieurs fichiers peuvent être sélectionnés.','Formats PDF, JPG ou PNG : 5 Mo maximum par fichier.','Utilisez Envoyer mes documents et attendez la confirmation. Les fichiers déjà déposés restent consultables.']),
('Admission / 07','Dossier Traduit : personnel','traduit-1','Le formulaire d’admission s’ouvre prérempli.', ['Vérifiez prénom, nom, email, téléphone et type de programme visé.','L’email est repris du dossier. Complétez les informations manquantes.','Touchez Continuer pour passer au parcours académique.']),
('Admission / 07','Dossier Traduit : académique','traduit-2','Précisez le diplôme et votre parcours.', ['Vérifiez le dernier diplôme, son intitulé et l’année d’obtention.','Sélectionnez les documents complémentaires que vous possédez : travail, stage, formation ou autre.','Les questions de langue d’enseignement souhaitée et d’années de gap ne sont pas affichées dans ce formulaire du portail.']),
('Admission / 07','Dossier Traduit : liste des pièces','traduit-3','La liste s’adapte au programme et au parcours.', ['Consultez les pièces générales et académiques. Pour une licence vers un master : diplôme et relevés de licence notamment.','Les pièces Moins urgent peuvent être ajoutées plus tard.','Télécharger le PDF conserve la liste ; Suivant ouvre les emplacements de dépôt.']),
('Admission / 07','Dossier Traduit : envoi','traduit-4','Ajoutez les fichiers dans les emplacements correspondants.', ['Chaque fichier doit faire moins de 5 Mo. Renseignez les champs associés, comme la validité du passeport.','Les fichiers déjà reconnus comme envoyés sont grisés ; complétez seulement les éléments manquants.','Utilisez le bouton d’envoi et attendez le résultat. Le dossier fictif contient les 14 pièces demandées, affichées comme déjà envoyées.']),
('Admission / 07','Reprendre un dossier existant','traduit-existant','Le formulaire détecte une soumission existante.', ['Compléter mon dossier permet d’ajouter les éléments manquants.','Nouveau dossier crée une nouvelle soumission : utilisez cette option seulement lorsque nécessaire.','Les documents de démonstration sont identifiables par DEMO et n’ont aucune valeur officielle.']),
('Admission / 08','Candidatures','candidatures','Visualisez les candidatures par université et formation.', ['Chaque ligne indique formation, langue, diplôme visé, ville, date et statut.','Submitted : candidature déposée. Admitted : admission enregistrée. Rejected : refus enregistré.','Foulen illustre deux candidatures : une admise, une déposée. Les établissements et décisions sont fictifs.']),
('Admission / 09','Décision d’admission','decision','Consultez la réponse enregistrée dans votre suivi.', ['Touchez la carte Décision d’admission pour lire son contenu.','L’accueil présente également l’université et le programme lorsqu’une candidature est admise.','Avec zéro candidature, l’accueil indique Aucune candidature envoyée ; sinon il distingue attente, admission et refus.']),
('Admission / 10','Validation Universitaly','universitaly','Dernière carte du parcours d’admission.', ['Touchez Validation Universitaly pour consulter la valeur enregistrée.','Le suivi est renseigné par l’équipe. Demandez une précision à votre conseiller si nécessaire.','La valeur Done de cette démonstration ne correspond à aucune validation officielle.']),
('Paiements','Paiements sur ordinateur','paiements-web','Consultez le détail des montants et des échéances.', ['Le tableau affiche référence, montant, devise, motif, statut, échéance, commentaire et facture.','Le motif provient du champ Purpose et la facture du champ Invoice.','Les montants de Foulen servent uniquement au manuel : aucun paiement n’est à effectuer.']),
('Paiements','Paiements sur téléphone','paiements-mobile','Chaque paiement est présenté dans une carte.', ['Lisez le montant et la devise avec le statut : À payer, Payé, Exonéré ou En retard.','Vérifiez le motif et la date d’échéance.','Télécharger la facture PDF récupère la pièce jointe disponible. Sans pièce jointe, le lien n’apparaît pas.']),
('Assistance','Envoyer un ticket support','support','Une page complète permet de décrire votre besoin.', ['Vérifiez les coordonnées préremplies puis choisissez le sujet de la demande.','Décrivez le problème et ajoutez, si utile, jusqu’à 5 fichiers de 5 Mo chacun : PDF, JPG, PNG, DOC ou DOCX.','Envoyez avec Submit ticket et attendez la confirmation. Le formulaire illustré n’a pas été soumis.']),
('Rendez-vous','Booking : choisir un jour','booking-1','Rendez-vous ouvre book.jeexpert.com.', ['Sélectionnez un jour avec des créneaux disponibles.','Les jours sans disponibilité sont désactivés.','Le calendrier est réel ; les données personnelles transmises ici sont celles du dossier fictif.']),
('Rendez-vous','Booking : choisir l’heure','booking-2','Comparez les horaires avant de choisir.', ['Les heures sont indiquées pour l’Italie et votre fuseau local.','Choisissez un créneau et vérifiez sa durée.','Le bouton de retour permet de choisir un autre jour.']),
('Rendez-vous','Booking : coordonnées et validation','booking-3','Vos coordonnées sont préremplies depuis le portail.', ['Vérifiez nom, email, téléphone et type de rendez-vous. Ajoutez une note si utile.','Confirm booking finalise la réservation pour un véritable étudiant. Si le créneau n’est plus libre, choisissez-en un autre.','Aucun créneau réel n’a été réservé pour ce manuel.']),
('Autres modules','Bourse','bourse','Le module est actuellement bloqué dans le portail.', ['L’écran invite à contacter votre conseiller pour débloquer l’étape.','Le bouton ouvre WhatsApp JEEXPERT.','Des données bourse DEMO existent dans Airtable, mais le portail ne les affiche pas actuellement.']),
('Autres modules','Visa','visa','Le module est actuellement bloqué dans le portail.', ['Utilisez Contacter mon conseiller pour demander la suite de la procédure.','Le rendez-vous visa stocké pour Foulen est purement fictif.','Aucune réservation consulaire réelle n’est associée au dossier du manuel.']),
('Autres modules','Intégration','integration','L’écran indique Bientôt disponible.', ['Ce module ne propose pas encore de démarche utilisable côté étudiant.','Les étapes de suivi DEMO créées dans Airtable ne sont pas présentées dans cet écran.','Contactez votre conseiller pour les informations d’arrivée et d’installation.']),
('Application','Installer et retrouver le portail','installation','Ajoutez le portail à votre écran d’accueil.', ['Android : Chrome, menu, Installer l’application ou Ajouter à l’écran d’accueil.','iPhone : Safari, Partager, Sur l’écran d’accueil. Ordinateur : icône d’installation de Chrome ou Edge.','Actualiser recharge le suivi ; Déconnexion ou Sortir quitte votre session. Internet reste nécessaire pour consulter les données.']),
]
N=len(entries)+3
c=canvas.Canvas(str(O),pagesize=(W,H));c.setTitle('JEEXPERT - Manuel complet illustré - Foulen Ben Foulen');c.setAuthor('JEEXPERT')
def para(s,x,y,width,size=10,bold=False,color=I):
 p=Paragraph(s,ParagraphStyle('p',fontName='PoppinsBold' if bold else 'Poppins',fontSize=size,leading=size*1.55,textColor=color));_,h=p.wrap(width,900);p.drawOn(c,x,y-h);return y-h

def frame(n,cat,title):
 c.setFillColor(white);c.rect(0,0,W,H,fill=1,stroke=0);c.drawImage(str(R/'public/jeexpert-logo-blue.png'),42,777,width=138,height=46,mask='auto')
 para('MANUEL ÉTUDIANT',391,804,164,8,color=M);c.setStrokeColor(A);c.line(42,763,553,763)
 para(cat.upper(),42,742,511,9,True,B);para(title,42,715,511,23,True,B)
 c.setStrokeColor(HexColor('#D9E2EC'));c.line(42,48,553,48)
 para('DÉMONSTRATION • Foulen Ben Foulen • 14 octobre 2026',42,37,450,7,color=M);para(f'{n:02d} / {N:02d}',503,37,60,8,color=B)
 c.bookmarkPage('p'+str(n));c.addOutlineEntry(title,'p'+str(n),0)
frame(1,'Le guide complet','Utiliser votre portail JEEXPERT')
para('Un parcours illustré, du premier accès au suivi de votre dossier.',42,659,511,12,color=M)
c.setFillColor(B);c.roundRect(42,414,511,186,14,fill=1,stroke=0)
para('Chaque écran.<br/>Chaque étape d’admission.',64,578,465,24,True,white)
para('Connexion • Admission • Documents • Paiements • Assistance',64,460,465,10,color=white)
y=375
for s in ['Dossier de démonstration : <b>Foulen Ben Foulen</b>','Email : <b>foulen@foilen.com</b>  |  Numéro de dossier : <b>TUNFB24</b>','Les noms, parcours, universités, décisions, coordonnées et pièces sont fictifs. Les documents DEMO n’ont aucune valeur officielle.','Ce guide montre la version examinée le 14 octobre 2026. Les pages Bourse et Visa restent bloquées ; Intégration est en attente de mise à disposition.']:
 y=para(s,42,y,511,11)-18
c.showPage()
frame(2,'Sommaire','Le parcours, page par page')
y=660
for i,(cat,title,*_) in enumerate(entries,3):
 y=para(f'<b>{i:02d}</b>  {title}',42,y,511,9)-5
c.showPage()
for n,(cat,title,file,intro,steps) in enumerate(entries,3):
 frame(n,cat,title);para(intro,42,659,511,10,color=M)
 path=T/('foulen-'+file+'.jpg');assert path.exists(),path
 im=Image.open(path);iw,ih=im.size
 if ih/iw>1.2:
  width=min(235,511);height=min(475,width*ih/iw);width=height*iw/ih
  c.drawImage(str(path),42,611-height,width=width,height=height)
  y=608
  for j,step in enumerate(steps,1):
   y=para(f'{j:02d}',307,y,245,17,True,B)-6;y=para(step,307,y,245,10)-22
 else:
  width=511;height=min(415,width*ih/iw);width=height*iw/ih
  c.drawImage(str(path),42+(511-width)/2,611-height,width=width,height=height)
  y=594-height
  for j,step in enumerate(steps,1):y=para(f'<b>{j:02d}</b>  {step}',42,y,511,10)-10
  assert y>55,(n,title,y)
 c.showPage()
frame(N,'Repères utiles','Si vous êtes bloqué')
y=655
for title,body in [('Une information est vide','Actualisez la page. Si elle reste vide, contactez le conseiller : cela ne signifie pas un refus.'),('Un fichier ne passe pas','Vérifiez son format, sa taille et sa lisibilité. Contrôlez les fichiers déjà reçus avant de réessayer.'),('Un statut semble incorrect','Précisez le module, la ligne concernée et le résultat attendu dans un ticket support.'),('Contacter JEEXPERT','Depuis l’accueil : Contacter JEEXPERT. WhatsApp : <link href="https://wa.me/393520880880">+39 352 088 0880</link>. Réservation : <link href="https://book.jeexpert.com">book.jeexpert.com</link>.'),('Ce qui a été testé','Connexion au dossier fictif, consultation des dix étapes, navigation dans les quatre écrans du dossier traduit, lecture des données et téléchargement d’une facture PDF DEMO. Aucune signature de contrat ni réservation réelle effectuée.')]:
 y=para(title,42,y,511,13,True,B)-8;y=para(body,42,y,511,11)-24
c.showPage();c.save()
doc=PdfReader(O);assert len(doc.pages)==N
for i,p in enumerate(doc.pages):assert p.extract_text().strip(),i
subprocess.run([r'C:/Users/LEGION/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe','-scale-to','1000','-png',str(O),str(T/'complete')],check=True)
thumbs=[]
for i in range(N):
 im=Image.open(T/f'complete-{i+1:02d}.png').convert('RGB');im.thumbnail((210,297));thumbs.append(im)
for group in range(math.ceil(N/12)):
 sheet=Image.new('RGB',(840,891),'#e4e8ec')
 for j,im in enumerate(thumbs[group*12:(group+1)*12]):sheet.paste(im,((j%4)*210,(j//4)*297))
 sheet.save(T/f'complete-review-{group+1}.png')
print(json.dumps({'pdf':str(O),'pages':N,'screenshots':len(entries)},ensure_ascii=False))

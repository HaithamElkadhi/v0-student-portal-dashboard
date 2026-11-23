from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from PIL import Image
from pypdf import PdfReader
import subprocess

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'output/pdf/Manuel-utilisation-JEEXPERT.pdf'
TMP = ROOT / 'tmp/pdfs'
for name, file in [('Poppins','Poppins-Regular.ttf'),('PoppinsBold','Poppins-SemiBold.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(TMP/file)))
BLUE, AZURE, INK, MUTED = map(HexColor, ['#173B65','#80C4EA','#172D43','#526678'])
W,H=595.28,841.89
c=canvas.Canvas(str(OUT),pagesize=(W,H))
c.setTitle('JEEXPERT - Manuel d’utilisation du portail étudiant')
c.setAuthor('JEEXPERT')
style=ParagraphStyle('body',fontName='Poppins',fontSize=10,leading=17,textColor=INK)
logo=ROOT/'public/jeexpert-logo-blue.png'

def text(value,x,y,width=499,size=10,color=INK,bold=False):
    st=ParagraphStyle('p',parent=style,fontSize=size,leading=size*1.6,textColor=color,fontName='PoppinsBold' if bold else 'Poppins')
    p=Paragraph(value,st); _,height=p.wrap(width,700); p.drawOn(c,x,y-height);return y-height

def start(number,tag,title,intro):
    c.setFillColor(white);c.rect(0,0,W,H,fill=1,stroke=0)
    c.drawImage(str(logo),48,773,width=136,height=45.33,mask='auto')
    text('GUIDE ÉTUDIANT',390,802,160,8,MUTED)
    c.setStrokeColor(AZURE);c.line(48,763,W-48,763)
    text(tag.upper(),48,736,499,9,BLUE,True)
    text(title,48,709,499,25,BLUE,True)
    text(intro,48,656,499,10,MUTED)
    c.setStrokeColor(HexColor('#D9E2EC'));c.line(48,53,W-48,53)
    text('JEEXPERT  /  Portail étudiant  /  14 octobre 2026',48,40,440,8,MUTED)
    text(f'{number:02d} / 14',492,40,70,8,BLUE)

def section(y,title,body):
    y=text(title,48,y,499,13,BLUE,True)-9
    return text(body,48,y)-25

def note(y,title,body):
    st=ParagraphStyle('note',parent=style,fontSize=9,leading=15)
    p=Paragraph(body,st);_,h=p.wrap(451,500)
    height=h+54
    c.setFillColor(HexColor('#F4F7FB'));c.roundRect(48,y-height,499,height,12,fill=1,stroke=0)
    text(title,64,y-13,460,10,BLUE,True);p.drawOn(c,72,y-height+16)

start(1,'Votre parcours, simplement','Manuel d’utilisation','Le guide pratique pour consulter votre dossier, transmettre vos documents et échanger avec JEEXPERT.')
c.setFillColor(BLUE);c.roundRect(48,402,499,187,16,fill=1,stroke=0)
text('Votre projet d’études<br/>en Italie, au même endroit.',72,564,450,23,white,True)
text('Admission • Documents • Paiements • Rendez-vous',72,451,450,10,white)
y=359
for title,body in [('02  Premiers pas','Connexion, navigation mobile, profil et installation.'),('03  Admission','Lire votre progression et consulter les étapes.'),('04  Documents','Déposer les originaux, traductions et justificatifs de langue.'),('05  Paiements et activité','Comprendre les échéances et retrouver vos échanges.'),('06  Assistance et rendez-vous','Contacter JEEXPERT et réserver une consultation.')]:
    y=text(title,48,y,499,11,BLUE,True)-3;y=text(body,48,y,499,9,MUTED)-14
c.showPage()

start(2,'01 / Prendre en main le portail','Premiers pas','Utilisez l’adresse du portail communiquée par votre conseiller. Le même espace s’adapte au téléphone et à l’ordinateur.')
y=603
y=section(y,'1. Accéder à votre dossier','Sur la page de connexion, choisissez <b>Email</b> ou <b>Numéro de dossier</b>. Saisissez l’information enregistrée chez JEEXPERT, puis validez. Si votre dossier est introuvable, vérifiez la saisie ou contactez votre conseiller.')
y=section(y,'2. Naviguer sur téléphone','La barre du bas donne accès à <b>Accueil</b>, <b>Menu</b>, <b>Rendez-vous</b> et <b>Support</b>. Ouvrez Menu pour accéder aux modules. Votre <b>Profil</b> est accessible par l’icône utilisateur en haut ; sur ordinateur, les modules se trouvent dans la barre latérale.')
y=section(y,'3. Lire l’accueil','Consultez la décision d’admission, le nombre de candidatures et la progression. La situation financière présente les paiements dus et leurs échéances. La section Activité rassemble vos contacts et échanges enregistrés.')
y=section(y,'4. Installer le raccourci de l’application','Dans Menu, touchez <b>Installer l’application</b>. Sur Android : Chrome, menu, puis Installer ou Ajouter à l’écran d’accueil. Sur iPhone : Safari, Partager, puis Sur l’écran d’accueil. Sur ordinateur : utilisez l’option d’installation de Chrome ou Edge lorsqu’elle est proposée.')
note(y,'Actualiser et quitter','Utilisez Actualiser en haut pour recharger les informations. Sur un appareil partagé, déconnectez-vous après consultation. L’installation ne remplace pas la connexion Internet nécessaire au suivi du dossier.')
c.showPage()

start(3,'02 / Comprendre votre parcours','Suivre l’admission','Ouvrez Admission depuis le menu. Sur téléphone, touchez une carte pour consulter les informations ou ouvrir le formulaire associé.')
y=601
for title,body in [
('Fiche d’orientation et règlement','Consultez votre fiche d’orientation en lecture seule. Ouvrez Règlement pour lire le contrat et, lorsque la fonction est disponible pour votre dossier, l’accepter et le signer.'),
('Documents demandés et comptes','Documents demandés affiche les consignes de votre conseiller. Comptes de candidature présente les comptes créés à votre nom, sans mots de passe ni délégations.'),
('Justificatifs et dossiers','Justificatifs de langue, Dossier Original et Dossier Traduit permettent de consulter ou transmettre les pièces nécessaires. Le dépôt des documents est expliqué à la page suivante.'),
('Candidature, décision et Universitaly','Consultez la liste des candidatures et leurs réponses. Si une admission est enregistrée, l’accueil affiche l’université et la formation renseignées. La carte Validation Universitaly donne accès aux informations enregistrées pour cette étape.')]:y=section(y,title,body)
note(y,'Bien lire les indicateurs','Le pourcentage reflète l’avancement des étapes : une étape complétée compte entièrement et une étape en cours compte pour moitié. Ce pourcentage n’est pas une probabilité d’admission. Avec zéro candidature, l’accueil indique « Aucune candidature envoyée ». Vert : admis ; orange : décision en attente ; rouge : toutes les candidatures refusées.')
c.showPage()

start(4,'03 / Transmettre vos pièces','Documents et langues','Préparez des fichiers lisibles et complets. Le dépôt d’une pièce ne vaut pas validation par le conseiller ou acceptation par l’université.')
y=603
y=section(y,'Dossier Original','Ouvrez la carte, puis ajoutez les scans de vos documents dans leur <b>langue originale</b> : tous les relevés de notes et les diplômes obtenus. Vous pouvez sélectionner plusieurs fichiers. Pour ce dépôt : PDF, JPG ou PNG, <b>5 Mo maximum par fichier</b>. Attendez la confirmation avant de quitter le formulaire.')
y=section(y,'Dossier Traduit','Touchez la carte pour ouvrir le formulaire du dossier d’admission. Les informations disponibles de votre profil sont préremplies. Vérifiez les champs, complétez les éléments manquants et ajoutez les pièces demandées pour votre situation. Les questions sur la langue d’enseignement souhaitée et les années de gap ne sont pas affichées dans ce formulaire du portail.')
y=section(y,'Justificatifs de langue','Choisissez Anglais ou Italien, puis le type de justificatif. Pour EF, choisissez la version 50 ou 90 minutes et utilisez le lien du test correspondant. D’autres choix comprennent notamment IELTS, TOEFL, Cambridge, attestations de scolarité en anglais et certificats ou tests d’italien. Des liens d’information accompagnent les tests.')
y=section(y,'Score et document','Indiquez le score ou niveau lorsqu’il est demandé, puis ajoutez le certificat. Le statut devient « Document déposé » lorsqu’un fichier est joint ; sinon il reste « À compléter ». Les exigences et la recevabilité dépendent de l’université et du programme.')
note(y,'En cas d’échec d’envoi','Lisez le message affiché, vérifiez le format et la taille du fichier, puis réessayez. Si certains fichiers ont déjà été envoyés, vérifiez la liste avant de les ajouter à nouveau. Contactez le support si le problème persiste.')
c.showPage()

start(5,'04 / Garder une vue claire','Paiements et activité','Retrouvez les éléments financiers de votre dossier et les échanges enregistrés par votre conseiller.')
y=603
y=section(y,'Voir ce qui reste à payer','Sur l’accueil, la situation financière affiche les montants dus, le motif et la date d’échéance. Un <b>point rouge</b> indique qu’un paiement reste à régler ; un <b>point vert</b> indique qu’aucun paiement n’est dû. Ouvrez Paiement pour consulter toutes les lignes.')
y=section(y,'Lire une ligne de paiement','Sur téléphone, chaque paiement apparaît dans une carte : montant et devise, statut, motif, référence, échéance et commentaire lorsqu’il existe. Les statuts distinguent À payer, Payé, En retard et Exonéré. Respectez la devise indiquée pour chaque ligne.')
y=section(y,'Télécharger une facture','Si une facture PDF est jointe au paiement, touchez <b>Télécharger la facture PDF</b> ou <b>Télécharger PDF</b> sur ordinateur. Le fichier est téléchargé directement. Si aucun lien n’apparaît, aucune facture téléchargeable n’est disponible sur cette ligne : demandez-la à votre conseiller.')
y=section(y,'Consulter votre activité','Sur l’accueil, Activité affiche, du plus récent au plus ancien : les contacts saisis, les tickets, les rendez-vous et les emails enregistrés. Chaque entrée présente son type, sa date et son objet ; les rendez-vous peuvent aussi afficher la date prévue. Les changements de statut du dossier sont exclus de cette timeline.')
note(y,'Une information manque ?','Un champ vide signifie qu’aucune information n’est encore disponible dans votre suivi. Actualisez la page. Si une source d’activité est temporairement indisponible, un message le signale. Pour une échéance ou un statut à corriger, contactez votre conseiller.')
c.showPage()

start(6,'05 / Rester accompagné','Assistance et rendez-vous','Utilisez le canal adapté à votre besoin : un ticket pour une demande suivie, WhatsApp pour contacter JEEXPERT, un rendez-vous pour échanger.')
y=603
y=section(y,'Envoyer une demande au support','Touchez <b>Support</b> dans la barre du bas. Une page normale ouvre le formulaire de ticket. Vérifiez vos informations, renseignez les champs demandés, décrivez précisément votre besoin et joignez les documents utiles si nécessaire. Envoyez puis attendez la confirmation.')
y=section(y,'Réserver un rendez-vous','Touchez <b>Rendez-vous</b> près de Support. Vous êtes dirigé vers <link href="https://book.jeexpert.com" color="#173B65"><b>book.jeexpert.com</b></link>. Choisissez un jour disponible puis un créneau. Vérifiez le nom, l’email et le téléphone préremplis ; complétez-les si nécessaire. Choisissez le type de rendez-vous, ajoutez une note si utile, puis confirmez. Comparez les horaires affichés pour l’Italie et votre fuseau local.')
y=section(y,'Contacter JEEXPERT sur WhatsApp','Depuis l’accueil, touchez <b>Contacter JEEXPERT</b>. Dans les étapes bloquées, utilisez Contacter mon conseiller. Le lien ouvre WhatsApp vers le <link href="https://wa.me/393520880880" color="#173B65"><b>+39 352 088 0880</b></link>. Le message reste à rédiger et à envoyer par vous.')
y=section(y,'Bourse, visa et modules à débloquer','Actuellement, les pages Bourse et Visa demandent de contacter votre conseiller pour débloquer l’étape. L’absence d’un formulaire sur ces pages ne signifie pas que votre dossier est refusé. Pour les autres modules, suivez les informations effectivement affichées dans votre espace.')
note(y,'Avant de contacter votre conseiller','Préparez le module concerné, le message affiché et, si utile, une capture d’écran. Pour une pièce manquante ou une facture, précisez le document attendu. Ce guide décrit la version du portail examinée le 14 octobre 2026 ; les libellés peuvent évoluer.')
c.showPage()
captures = [
 ('connexion','Se connecter',['Choisissez Email ou Numéro de dossier.','Saisissez votre identifiant puis validez.','Le lien d’aide ouvre WhatsApp JEEXPERT.']),
 ('accueil','Lire votre accueil',['Admission : décision, nombre de candidatures et progression.','Paiements : motif, montant et échéance ; point rouge si un paiement est dû.','Activité : contacts, tickets, rendez-vous et emails.']),
 ('menu-mobile','Naviguer sur téléphone',['Touchez Menu dans la barre du bas.','Choisissez une carte pour ouvrir le module.','Rendez-vous et Support restent accessibles dans la navigation.']),
 ('admission','Consulter les étapes',['Les cartes présentent les étapes du parcours.','Sur téléphone, touchez une carte pour ouvrir ses détails.','Le calendrier indique la progression du dossier.']),
 ('documents','Ajouter les originaux',['Ouvrez Dossier Original.','Sélectionnez les scans avec Ajouter mes scans.','Vérifiez les fichiers, puis utilisez Envoyer mes documents. PDF, JPG ou PNG : 5 Mo maximum par fichier.']),
 ('langues','Déposer un justificatif',['Choisissez la langue et le type de justificatif.','Pour un test, indiquez le score demandé et joignez le certificat.','Les justificatifs déjà déposés apparaissent dans la liste.']),
 ('paiements-mobile','Lire un paiement mobile',['Le montant et le statut sont visibles en haut de la carte.','Le motif et l’échéance permettent d’identifier le paiement.','Une facture PDF jointe ajoute un lien de téléchargement. Cet exemple n’en contient pas.']),
 ('support-mobile','Créer un ticket',['Vérifiez les coordonnées préremplies.','Choisissez le sujet et décrivez votre demande.','Ajoutez les pièces utiles, puis envoyez. Aucun ticket n’a été envoyé pour ces captures.']),
]
for n,(file,title,steps) in enumerate(captures,7):
    start(n,'En images / '+str(n-6).zfill(2),title,'Capture réelle du portail. Les données du dossier illustré ne décrivent pas votre situation personnelle.')
    path=TMP/(file+'.jpg')
    im=Image.open(path);iw,ih=im.size
    mobile=ih>iw
    if mobile:
        width=225;height=width*ih/iw
        c.drawImage(str(path),48,610-height,width=width,height=height)
        yy=605
        for i,step in enumerate(steps,1):
            yy=text(str(i).zfill(2),300,yy,240,17,BLUE,True)-8
            yy=text(step,300,yy,240,10,INK)-25
    else:
        width=499;height=width*ih/iw
        c.drawImage(str(path),48,610-height,width=width,height=height)
        yy=590-height
        for i,step in enumerate(steps,1):
            yy=text(str(i).zfill(2)+'  '+step,48,yy,499,10,INK)-15
    c.showPage()
c.save()
doc=PdfReader(OUT)
assert len(doc.pages)==14
subprocess.run([r"C:/Users/LEGION/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe", "-scale-to", "900", "-png", str(OUT), str(TMP / "manuel-page")],check=True)
thumbs=[]
for i,page in enumerate(doc.pages):
    path=TMP/f'manuel-page-{i+1:02d}.png'
    im=Image.open(path).convert('RGB');im.thumbnail((300,425));thumbs.append(im)
sheet=Image.new('RGB',(900,2125),'#e4e8ec')
for i,im in enumerate(thumbs):sheet.paste(im,((i%3)*300,(i//3)*425))
sheet.save(TMP/'manuel-contact-sheet.png')
print(str(OUT));print('14 pages rendered')

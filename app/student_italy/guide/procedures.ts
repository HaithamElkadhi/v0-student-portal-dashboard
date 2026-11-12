import { ClipboardList, FileCheck2, FolderOpen, Languages, Landmark, type LucideIcon } from "lucide-react"
import { swornTranslators } from "./sworn-translators"

const embassy = "https://ambtunisi.esteri.it/fr/servizi-consolari-e-visti/"
const declarationOfValue = embassy + "servizi-per-il-cittadino-straniero/traduzione-e-legalizzazione-dei-documenti/"
const translatorList = "https://ambtunisi.esteri.it/wp-content/uploads/2024/10/Lista-traduttori-25-10-2024.pdf"

export const guideWhatsApp = "https://wa.me/393520880880"

type Procedure = {
  slug: string
  title: string
  label: string
  description: string
  scope: string
  icon: LucideIcon
  directory?: typeof swornTranslators
  steps: { title: string; text: string; items?: string[] }[]
  links: { label: string; href: string }[]
  whatsappMessage: string
}

export const procedures: Procedure[] = [
  {
    slug: "declaration-de-valeur",
    title: "Déclaration de valeur",
    label: "Démarche consulaire",
    description: "Présenter un diplôme tunisien auprès d’un établissement italien.",
    scope: "Pour les diplômes délivrés en Tunisie",
    icon: Landmark,
    steps: [
      {
        title: "Rassemblez le dossier",
        text: "Préparez ces pièces si votre université demande une déclaration de valeur.",
        items: [
          "Formulaire de demande rempli, daté et signé, et copie du passeport valide.",
          "Diplômes, bulletins et relevés de notes de tout votre parcours.",
          "Preuve d’inscription à l’université italienne pour une demande liée aux études.",
          "Décision d’équivalence du ministère de l’Enseignement supérieur si votre diplôme vient d’un établissement privé.",
        ],
      },
      {
        title: "Faites authentifier vos diplômes",
        text: "Demandez une attestation d’authenticité auprès de l’autorité compétente.",
        items: [
          "Bac et certificats scolaires — ministère de l’Éducation.",
          "Licence, master ou doctorat — rectorat compétent.",
          "BTP, BTS et autres titres professionnels — ministère de l’Emploi et de la Formation professionnelle.",
          "Diplômes de santé — ministère de la Santé publique.",
        ],
      },
      { title: "Préparez les copies, traductions et apostilles", text: "Photocopiez les diplômes recto verso et faites certifier les copies à la municipalité. Faites traduire les pièces en italien par un traducteur assermenté et demandez l’apostille à un notaire. Vérifiez que vos noms correspondent au passeport." },
      { title: "Prenez rendez-vous et déposez le dossier", text: "Dans Prenot@Mi, sélectionnez le service Déclaration de valeur de l’Ambassade à Tunis. Apportez les pièces préparées, les diplômes originaux et le passeport. La démarche est gratuite pour poursuivre vos études si vous présentez votre preuve d’inscription. L’Ambassade vous contactera pour le retrait ou si une pièce manque." },
    ],
    links: [
      { label: "Télécharger le formulaire de demande (PDF)", href: "https://ambtunisi.esteri.it/wp-content/uploads/2023/11/modulo_dichiarazione_valore_it_fr.pdf" },
      { label: "Consignes et pièces à fournir", href: declarationOfValue },
      { label: "Traducteurs assermentés en Tunisie (PDF)", href: translatorList },
      { label: "Prendre rendez-vous sur Prenot@Mi", href: "https://prenotami.esteri.it/" },
    ],
    whatsappMessage: "Bonjour JEEXPERT, j’ai besoin d’aide pour ma déclaration de valeur.",
  },
  {
    slug: "cimea",
    title: "CIMEA",
    label: "Attestations de diplôme",
    description: "Demander l’attestation de comparabilité ou de vérification attendue par votre université.",
    scope: "Selon le pays et le niveau du diplôme",
    icon: FileCheck2,
    steps: [
      { title: "Choisissez l’attestation et le niveau", text: "La comparabilité indique le niveau du diplôme. La vérification confirme son authenticité. Demandez à votre université quelle attestation elle attend. Dans le sélecteur CIMEA-Diplome, choisissez Tunisie pour un diplôme tunisien, puis secondaire pour le bac ou supérieur pour un diplôme universitaire." },
      {
        title: "Préparez les fichiers",
        text: "Commencez par les documents officiels ci-dessous. Les pièces complémentaires varient selon le titre.",
        items: [
          "Diplôme obtenu, ou attestation provisoire officielle si le diplôme final n’a pas encore été délivré.",
          "Relevés de notes officiels. Scannez les pièces en couleur, en entier et dans la langue d’origine.",
          "Si une traduction est demandée, joignez-la en italien ou en anglais avec le document original.",
        ],
      },
      { title: "Déposez la demande sur DiploMe", text: "Créez un compte au nom du titulaire du diplôme, sélectionnez le service disponible et chargez les fichiers. Vérifiez les frais et le délai affichés avant de valider et de payer sur la plateforme." },
      { title: "Suivez la demande et récupérez l’attestation", text: "Consultez votre compte pour répondre aux demandes de pièces. Si CIMEA exige un envoi papier, déposez d’abord la demande en ligne et inscrivez son numéro sur l’enveloppe. Téléchargez l’attestation dans le Wallet de votre compte DiploMe." },
    ],
    links: [
      { label: "Trouver le service et déposer sur CIMEA-Diplome", href: "https://cimea-diplome.it/" },
      { label: "Vérifier les pièces pour votre diplôme", href: "https://cimea-diplome.it/page-require-documents" },
    ],
    whatsappMessage: "Bonjour JEEXPERT, j’ai besoin d’aide pour ma demande CIMEA.",
  },
  {
    slug: "traducteurs-assermentes",
    title: "Liste des traducteurs assermentés",
    label: "Traduction de documents",
    description: "Trouvez un traducteur vers l’italien et appelez-le directement depuis le guide.",
    scope: "Coordonnées publiées par l’Ambassade d’Italie à Tunis",
    icon: Languages,
    directory: swornTranslators,
    steps: [
      { title: "Confirmez les pièces et la langue", text: "Pour une déclaration de valeur, l’Ambassade demande des traductions en italien. Pour une candidature, vérifiez la langue acceptée et les pièces à traduire dans l’appel à candidatures." },
      { title: "Demandez un devis et un délai", text: "Indiquez le nombre de pages et la date limite. Demandez si le traducteur travaille à partir des originaux ou des copies conformes et sous quel format il remet les traductions." },
      { title: "Relisez avant le dépôt", text: "Vérifiez les noms, les dates et les notes. Pour la déclaration de valeur, suivez aussi la procédure d’apostille chez un notaire." },
    ],
    links: [
      { label: "Liste complète avec adresses et autres coordonnées (PDF)", href: translatorList },
      { label: "Consignes de traduction et d’apostille", href: declarationOfValue },
    ],
    whatsappMessage: "Bonjour JEEXPERT, j’ai besoin d’aide pour faire traduire mes documents.",
  },
  {
    slug: "documents-admission",
    title: "Documents d’admission",
    label: "Candidature en licence",
    description: "Préparez votre dossier de candidature et repérez les pièces à fournir après l’admission.",
    scope: "Pour une première année de licence en Italie avec un bac tunisien",
    icon: FolderOpen,
    steps: [
      {
        title: "Préparez les pièces de base",
        text: "Scannez les pièces en couleur et gardez les originaux pour l’inscription.",
        items: [
          "Page d’identité de votre passeport valide.",
          "Diplôme du bac et relevé officiel des notes du bac.",
          "Si vous êtes encore en terminale, préparez le certificat de scolarité et vos derniers bulletins. Vérifiez si la formation les accepte provisoirement et quand envoyer le bac définitif.",
        ],
      },
      {
        title: "Ajoutez les pièces propres à la licence",
        text: "Dans le bando, l’appel à candidatures de la formation, repérez ces trois éléments.",
        items: [
          "Justificatif d’italien ou d’anglais selon la langue du cursus, avec le niveau et les certificats acceptés.",
          "Résultat du test d’entrée ou preuve de réservation si la formation l’accepte à ce stade.",
          "CV, lettre de motivation ou autres pièces si elles sont demandées.",
        ],
      },
      { title: "Déposez la candidature", text: "Créez votre compte sur le portail de l’université, choisissez la licence et la session ouvertes aux candidats hors UE résidant à l’étranger si vous êtes dans ce cas. Joignez les pièces, validez avant la date limite et conservez le reçu de dépôt." },
      { title: "Préparez l’inscription et le visa", text: "Respectez les délais de l’université pour les traductions, l’authentification et le justificatif de valeur du diplôme qu’elle accepte, par exemple une déclaration de valeur ou une attestation CIMEA. Si vous avez besoin d’un visa étudiant, suivez les instructions de l’université pour la préinscription sur Universitaly." },
    ],
    links: [
      { label: "Exemple de liste de pièces pour une licence à Padoue", href: "https://www.unipd.it/en/studiare-italiano-come-fare-domanda" },
      { label: "Préinscription et visa sur Universitaly", href: "https://www.universitaly.it/it/first-steps" },
    ],
    whatsappMessage: "Bonjour JEEXPERT, pouvez-vous vérifier les documents requis pour ma candidature en licence ?",
  },
  {
    slug: "tests-admission",
    title: "Tests d’admission en licence",
    label: "TOLC, CEnT-S et autres tests",
    description: "Identifiez le test demandé, préparez-vous et réservez une session compatible avec votre candidature.",
    scope: "Pour les licences en italien ou en anglais",
    icon: ClipboardList,
    steps: [
      {
        title: "Identifiez le test de votre licence",
        text: "Dans le bando de l’année visée, notez le test accepté, le score demandé, le format autorisé et la date limite de réception du résultat.",
        items: [
          "TOLC en italien. Selon la licence, vous pouvez rencontrer le TOLC-I en ingénierie, le TOLC-E en économie, le TOLC-F en pharmacie ou le TOLC-SU en sciences humaines.",
          "CEnT-S en anglais. Il remplace les anciens English TOLC-I, E et F chez CISIA. Certaines licences en anglais acceptent le SAT ou utilisent leur propre sélection.",
          "Autres tests. Selon le cursus, l’université peut demander le TEST ARCHED en architecture ou l’English TEST HUMANITIES. Un justificatif de langue peut aussi être exigé.",
        ],
      },
      { title: "Réservez une session à temps", text: "Pour un TOLC ou le CEnT-S, créez votre compte CISIA, choisissez le type exact et réservez une session au format accepté par votre licence. Pour le CEnT-S, vérifiez la date de publication du score officiel, à la fin de la période de test, avant de payer." },
      { title: "Entraînez-vous sur le bon programme", text: "Faites une simulation chronométrée dans l’espace d’entraînement CISIA. Le CEnT-S couvre la compréhension écrite, les maths, le raisonnement sur des textes et des données, la biologie, la chimie et la physique. Pour un test à distance, vérifiez aussi le matériel demandé." },
      { title: "Finalisez votre candidature", text: "Récupérez le résultat dans votre espace candidat et suivez le bando pour le transmettre ou pour autoriser l’université à le récupérer. Pensez à valider aussi votre candidature sur le portail de l’université et à vérifier le classement ou la décision." },
    ],
    links: [
      { label: "Types de TOLC et calendrier", href: "https://www.cisiaonline.it/en/tolc/all-about-TOLC/what-is-the-TOLC" },
      { label: "CEnT-S et dates des sessions", href: "https://www.cisiaonline.it/en/cent/all-about-CEnT/all-about-CEnT" },
      { label: "Simulations et entraînement CISIA", href: "https://www.cisiaonline.it/en/practicing/tolc-practicing" },
      { label: "Autres tests CISIA", href: "https://www.cisiaonline.it/en/other-tests" },
    ],
    whatsappMessage: "Bonjour JEEXPERT, pouvez-vous m’aider à choisir le test d’admission pour ma licence ?",
  },
]

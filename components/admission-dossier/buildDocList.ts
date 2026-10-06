import type { DiplomaLevel, GapDocType, StudyLanguage } from "./types";

export interface DocDef {
  id: string;
  name: string;
  category: "general" | "academic" | "experience";
  lessUrgent?: boolean;
  extraField?: "expiryDate" | "certName";
}

const ALWAYS_DOCS: DocDef[] = [
  { id: "photo",    name: "Photo d'identité",          category: "general" },
  { id: "passport", name: "Passeport",                  category: "general", extraField: "expiryDate" },
  { id: "cv",       name: "CV",                         category: "general" },
  { id: "lang",     name: "Certificat de langue",       category: "general", lessUrgent: true, extraField: "certName" },
  { id: "ddv",      name: "Déclaration de valeur (ou CIMEA)", category: "general", lessUrgent: true },
  { id: "rec_1",    name: "Lettre de recommandation 1", category: "general", lessUrgent: true },
  { id: "rec_2",    name: "Lettre de recommandation 2", category: "general", lessUrgent: true },
];

const PLAN_LICENCE: DocDef  = { id: "plan_licence",  name: "Plan d'études — Licence",  category: "academic" };
const PLAN_MASTER: DocDef   = { id: "plan_master",   name: "Plan d'études — Master",   category: "academic" };
const PLAN_DOCTORAT: DocDef = { id: "plan_doctorat", name: "Plan d'études — Doctorat", category: "academic" };

const BAC_DOCS_BAC_ONLY: DocDef[] = [
  { id: "bac_dip", name: "Diplôme du Baccalauréat",                    category: "academic" },
  { id: "bac_tr",  name: "Relevé de notes Bac — 3ème année secondaire", category: "academic" },
];

const BAC_DOCS_HIGHER: DocDef[] = [
  { id: "bac_dip", name: "Diplôme du Baccalauréat", category: "academic" },
  { id: "bac_tr",  name: "Relevé de notes Bac",      category: "academic" },
];

const LICENCE_DOCS: DocDef[] = [
  { id: "lic_dip", name: "Diplôme de Licence",              category: "academic" },
  { id: "lic_tr1", name: "Relevé de notes Licence — année 1", category: "academic" },
  { id: "lic_tr2", name: "Relevé de notes Licence — année 2", category: "academic" },
  { id: "lic_tr3", name: "Relevé de notes Licence — année 3", category: "academic" },
];

const MASTER_DOCS: DocDef[] = [
  { id: "mas_dip", name: "Diplôme de Master / Ingénieur",       category: "academic" },
  { id: "mas_tr1", name: "Relevé de notes Master — année 1",    category: "academic" },
  { id: "mas_tr2", name: "Relevé de notes Master — année 2",    category: "academic" },
];

const PHD_DOCS: DocDef[] = [
  { id: "phd_dip", name: "Diplôme de Doctorat / PhD", category: "academic" },
];

const GAP_DOC_MAP: Record<Exclude<GapDocType, "No document">, DocDef> = {
  "Internship / Stage":   { id: "gap_stage",    name: "Attestation de stage",     category: "experience", lessUrgent: true },
  "Work certificate":     { id: "gap_work",     name: "Attestation de travail",    category: "experience", lessUrgent: true },
  "Training / Formation": { id: "gap_training", name: "Attestation de formation",  category: "experience", lessUrgent: true },
  "Other document":       { id: "gap_other",    name: "Document justificatif",     category: "experience", lessUrgent: true },
};

function diplomaDocs(diplomaLevel: DiplomaLevel): DocDef[] {
  switch (diplomaLevel) {
    case "Baccalauréat":
      return [...BAC_DOCS_BAC_ONLY];
    case "Licence (Bachelor's)":
      return [...BAC_DOCS_HIGHER, ...LICENCE_DOCS, PLAN_LICENCE];
    case "Master":
    case "Ingénieur":
      return [...BAC_DOCS_HIGHER, ...LICENCE_DOCS, PLAN_LICENCE, ...MASTER_DOCS, PLAN_MASTER];
    case "Doctorat":
    case "PhD":
      return [...BAC_DOCS_HIGHER, ...LICENCE_DOCS, PLAN_LICENCE, ...MASTER_DOCS, PLAN_MASTER, ...PHD_DOCS, PLAN_DOCTORAT];
    default:
      return [];
  }
}

function extraDocs(gapDocTypes: GapDocType[], otherDocLabel: string): DocDef[] {
  return gapDocTypes
    .filter((t): t is Exclude<GapDocType, "No document"> => t !== "No document")
    .map((t) => {
      if (t === "Other document" && otherDocLabel.trim()) {
        return { ...GAP_DOC_MAP[t], name: otherDocLabel.trim() };
      }
      return GAP_DOC_MAP[t];
    });
}

export function buildDocList(
  diplomaLevel: DiplomaLevel,
  _hasGap: boolean,
  gapDocTypes: GapDocType[],
  otherDocLabel = "",
  studyLanguage: StudyLanguage = ""
): DocDef[] {
  const langCertName =
    studyLanguage === "Anglais" ? "Certificat d'anglais" :
    studyLanguage === "Italien" ? "Certificat d'italien" :
    "Certificat de langue";

  const alwaysDocs = ALWAYS_DOCS.map((d) =>
    d.id === "lang" ? { ...d, name: langCertName } : d
  );

  return [
    ...alwaysDocs,
    ...diplomaDocs(diplomaLevel),
    ...extraDocs(gapDocTypes, otherDocLabel),
  ];
}

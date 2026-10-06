import type { DiplomaLevel, GapDocType, ProgramType } from "./types";

export const PROGRAM_TYPE_OPTIONS: ProgramType[] = [
  "Laurea Magistrale (Master's)",
  "Laurea Triennale (Bachelor's)",
  "Dottorato (PhD)",
];

export const DIPLOMA_LEVEL_OPTIONS: { value: DiplomaLevel; label: string }[] = [
  { value: "Baccalauréat", label: "Baccalauréat" },
  { value: "Licence (Bachelor's)", label: "Licence" },
  { value: "Master", label: "Master" },
  { value: "Ingénieur", label: "Ingénieur" },
  { value: "Doctorat", label: "Doctorat" },
  { value: "PhD", label: "PhD" },
];

export const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => String(2015 + i));

export const YEARS_EXPERIENCE_OPTIONS = [
  { value: "0", label: "0 (aucune)" },
  { value: "1", label: "1 an" },
  { value: "2", label: "2 ans" },
  { value: "3", label: "3 ans" },
  { value: "4", label: "4 ans ou plus" },
];

export const GAP_DOC_TYPE_OPTIONS: { value: GapDocType; label: string }[] = [
  { value: "Internship / Stage", label: "Stage" },
  { value: "Work certificate", label: "Attestation de travail" },
  { value: "Training / Formation", label: "Formation" },
  { value: "Other document", label: "Autre document" },
  { value: "No document", label: "Aucun document" },
];

export const CURRENT_YEAR = 2026;

export function computeGapYears(yearObtained: string, yearsExperience: string): number {
  const year = Number(yearObtained);
  const experience = Number(yearsExperience) || 0;
  if (!year) return 0;
  return CURRENT_YEAR - year - experience;
}

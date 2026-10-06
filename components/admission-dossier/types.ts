export type ProgramType =
  | "Laurea Magistrale (Master's)"
  | "Laurea Triennale (Bachelor's)"
  | "Dottorato (PhD)"
  | "";

export type DiplomaLevel =
  | "Baccalauréat"
  | "Licence (Bachelor's)"
  | "Master"
  | "Ingénieur"
  | "Doctorat"
  | "PhD"
  | "";

/** Always sent to Airtable as Score /20. */
export const FIXED_SCORE_FORMAT = "Score /20" as const;

export type GapDocType =
  | "Internship / Stage"
  | "Work certificate"
  | "Training / Formation"
  | "Other document"
  | "No document";

export interface ProfileData {
  folderId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  programType: ProgramType;
}

export type StudyLanguage = "Anglais" | "Italien" | "";

export interface AcademicData {
  diplomaLevel: DiplomaLevel;
  fieldOfStudy: string;
  scoreValue: string;
  yearObtained: string;
  studyLanguage: StudyLanguage;
  hasGap: boolean;
  gapYears: number;
  gapDocTypes: GapDocType[];
  gapOtherDocLabel: string;
}

export interface DocumentEntry {
  file: File | null;
  expiryDate?: string;
  certName?: string;
}

export type DocumentsState = Record<string, DocumentEntry>;

export interface AdmissionFormData {
  profile: ProfileData;
  academic: AcademicData;
  documents: DocumentsState;
}

export const initialAdmissionData: AdmissionFormData = {
  profile: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    programType: "",
  },
  academic: {
    diplomaLevel: "",
    fieldOfStudy: "",
    scoreValue: "",
    yearObtained: "",
    studyLanguage: "",
    hasGap: false,
    gapYears: 0,
    gapDocTypes: [],
    gapOtherDocLabel: "",
  },
  documents: {},
};

export type AdmissionStep = 1 | 2 | 3 | 4 | "success";

export interface ExistingSubmission {
  recordId: string;
  submittedDocIds: string[];
}

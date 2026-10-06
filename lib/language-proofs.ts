export type Language = "english" | "italian"
export const languageOptions: { id: string; language: Language; label: string; url: string; studies?: boolean }[] = [
  { id: "ef50", language: "english", label: "EF SET — 50 minutes", url: "https://www.efset.org/ef-set-50/" },
  { id: "ef90", language: "english", label: "EF SET — 90 minutes", url: "https://www.efset.org/4-skill/" },
  { id: "ielts", language: "english", label: "IELTS Academic", url: "https://ielts.org/take-a-test/test-types/ielts-academic-test" },
  { id: "toefl", language: "english", label: "TOEFL iBT", url: "https://www.ets.org/toefl.html" },
  { id: "cambridge", language: "english", label: "Cambridge English", url: "https://www.cambridgeenglish.org/exams-and-tests/" },
  { id: "moi", language: "english", label: "Attestation d’études en anglais (MOI)", url: "https://www.unipd.it/en/requisito-inglese-ammissione", studies: true },
  { id: "internal_en", language: "english", label: "Test interne de l’université", url: "https://www.unibo.it/en/study/enrolment-fees-and-other-procedures/language-requirement-for-programme-enrolment" },
  { id: "other_en", language: "english", label: "Autre justificatif", url: "https://www.unipd.it/en/requisito-inglese-ammissione" },
  { id: "cils", language: "italian", label: "CILS", url: "https://cils.unistrasi.it/" },
  { id: "celi", language: "italian", label: "CELI", url: "https://www.unistrapg.it/it/certificati-di-conoscenza-della-lingua-italiana" },
  { id: "plida", language: "italian", label: "PLIDA", url: "https://plida.dante.global/it" },
  { id: "certit", language: "italian", label: "CERT.IT — Roma Tre", url: "https://certificazioneitaliano.uniroma3.it/" },
  { id: "internal_it", language: "italian", label: "Test interne de l’université", url: "https://www.unibo.it/en/study/enrolment-fees-and-other-procedures/language-requirement-for-programme-enrolment" },
  { id: "studies_it", language: "italian", label: "Diplôme italien / études en italien", url: "https://www.unipd.it/en/requisito-linguistico-ammissione-corsi-studio-ateneo", studies: true },
  { id: "other_it", language: "italian", label: "Autre justificatif", url: "https://www.unipd.it/en/requisito-linguistico-ammissione-corsi-studio-ateneo" },
]
export type LanguageProof = { id: string; language: Language; type: string; score: string; date: string; institution: string; detail: string; documents: { name: string; url: string }[]; legacy?: boolean }
export const LANGUAGE_TABLE = "tblEOBgIsqegFtqdm"
export const LANGUAGE_FIELDS = { name: "fldjpE7HnkeqJLHAK", prospect: "fldXIkmzygYzzyNJk", language: "fldNg4IvmY2YerMFd", type: "fldGlEwrFmmoIsdkg", score: "fld3KFOJ5kJJEhaSb", date: "fldorzOji5oo6oub2", institution: "fldXjWuUp3PdLb51m", detail: "fldKHoiNMRy0aLGo8", documents: "fldd3PmCebt4a3zSI" } as const

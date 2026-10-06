"use client";

import { useState, type FormEvent } from "react";
import FamilyMembersSection from "./components/FamilyMembersSection";
import { useStudentPortal } from "@/components/student-portal-context";
import UploadZone from "./components/UploadZone";
import {
  btnPrimaryClass,
  btnSecondaryClass,
  errorClass,
  inputClass,
  labelClass,
  sectionTitleClass,
} from "./components/fieldStyles";
import { useSubmitBourseDocuments, type ExistingBourseTarget } from "./hooks/useSubmitBourseDocuments";
import {
  countAllFiles,
  createEmptyMember,
  initialFormData,
  type DocumentsBourseFormData,
  type IdentityData,
  type UploadZoneKey,
} from "./types";

type IdentityErrors = Partial<Record<keyof IdentityData, string>>;
type ExistingDossier = ExistingBourseTarget & {
  uploadedFilesByField: Record<UploadZoneKey, string[]>;
  submittedGroupKeys: string[];
  unmatchedAttachmentCount: number;
};

export default function DocumentsBourseForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const { studentInfo } = useStudentPortal();
  const [data, setData] = useState<DocumentsBourseFormData>(() => ({ ...initialFormData, identity: { firstName: studentInfo.name || "", lastName: studentInfo.surname || "", email: studentInfo.email || "" } }));
  const [identityErrors, setIdentityErrors] = useState<IdentityErrors>({});
  const [existingDossier, setExistingDossier] = useState<ExistingDossier | null>(null);
  const [lookupDone, setLookupDone] = useState(false);
  const [checkingDossier, setCheckingDossier] = useState(false);
  const [dossierChoice, setDossierChoice] = useState<"existing" | "new" | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [submitted, setSubmitted] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    filesUploaded: number;
  } | null>(null);

  const { submit, submitting, uploadedCount, totalToUpload, error, setError } =
    useSubmitBourseDocuments();

  function updateIdentity<K extends keyof IdentityData>(key: K, value: IdentityData[K]) {
    setData((d) => ({ ...d, identity: { ...d.identity, [key]: value } }));
    if (key === "email") {
      setLookupDone(false);
      setExistingDossier(null);
      setDossierChoice(null);
    }
    setIdentityErrors((errs) => {
      if (!errs[key]) return errs;
      const next = { ...errs };
      delete next[key];
      return next;
    });
  }

  function setFiles(key: UploadZoneKey, files: File[]) {
    setData((d) => ({ ...d, files: { ...d.files, [key]: files } }));
  }

  function validateIdentity(): boolean {
    const errs: IdentityErrors = {};
    if (!data.identity.firstName.trim()) errs.firstName = "Le prénom est obligatoire.";
    if (!data.identity.lastName.trim()) errs.lastName = "Le nom est obligatoire.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.identity.email.trim())) errs.email = "Un e-mail valide est obligatoire.";
    setIdentityErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function sendForm(target?: ExistingDossier) {
    setError(null);
    const result = await submit(data, target);
    if (result.success) {
      onSubmitted?.();
      setSubmitted({
        firstName: data.identity.firstName.trim(),
        lastName: data.identity.lastName.trim(),
        email: data.identity.email.trim(),
        filesUploaded: result.filesUploaded,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function checkExistingDossier(): Promise<boolean> {
    const email = data.identity.email.trim();
    if (!email) return false;
    if (checkingDossier) return false;
    if (lookupDone) return true;
    setCheckingDossier(true);
    setError(null);
    try {
      const res = await fetch(`/api/submit-bourse-documents?email=${encodeURIComponent(email)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Impossible de vérifier le dossier existant.");
      if (data.identity.email.trim() !== email) return false;
      setLookupDone(true);
      setExistingDossier(json.found ? (json as ExistingDossier) : null);
      setDossierChoice(json.found ? "existing" : null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de vérifier le dossier existant.");
      return false;
    } finally {
      setCheckingDossier(false);
    }
  }

  async function continueToDocuments() {
    setError(null);
    if (!validateIdentity()) return;
    if (!lookupDone && !(await checkExistingDossier())) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validateIdentity()) {
      document.getElementById("section-identity")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (existingDossier && !dossierChoice) {
      setError("Choisissez si vous souhaitez compléter le dossier existant ou en créer un nouveau.");
      return;
    }
    await sendForm(existingDossier && dossierChoice === "existing" ? existingDossier : undefined);
  }

  if (submitted) {
    return (
      <div className="w-full">
        <div className="mx-auto w-full max-w-7xl">

          <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-[#D9E2EC] bg-white p-8 shadow-sm sm:p-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF8F2] text-[#217A50]">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
                  <path
                    d="M7 17L13 23L25 9"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-[#173B65]">Dossier envoyé</h2>
              <p className="max-w-md text-gray-600">
                Merci {submitted.firstName} {submitted.lastName}. Votre dossier de documents
                bourse a bien été reçu
                {submitted.filesUploaded > 0
                  ? ` avec ${submitted.filesUploaded} fichier${submitted.filesUploaded > 1 ? "s" : ""}`
                  : ""}
                .
              </p>
              <p className="text-sm text-gray-500">
                Un e-mail de suivi pourra être envoyé à{" "}
                <span className="font-medium text-gray-700">{submitted.email}</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-7xl">


        <div className="w-full">
          <div className="min-w-0">
        <header className="mb-5 px-1 sm:mb-6 sm:px-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#51708F]">Formulaire de dépôt</p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-900">Documents bourse</h2>
          <p className="mt-2 text-sm leading-6 text-[#536579]">
            {step === 1 ? "Commencez par vos informations personnelles et familiales." : "Ajoutez les pièces justificatives pour votre dossier de bourse."}
          </p>
          <div className="mt-5 flex items-center gap-3" aria-label={`Étape ${step} sur 2`}>
            <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${step === 1 ? "bg-[#173B65] text-white" : "bg-[#E3F3FC] text-[#173B65]"}`}>1</span>
            <span className={`text-sm ${step === 1 ? "font-semibold text-[#173B65]" : "text-[#687B8E]"}`}>Informations</span>
            <span className="h-px flex-1 bg-[#D9E2EC]" />
            <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${step === 2 ? "bg-[#173B65] text-white" : "bg-white text-[#687B8E] ring-1 ring-[#D9E2EC]"}`}>2</span>
            <span className={`text-sm ${step === 2 ? "font-semibold text-[#173B65]" : "text-[#687B8E]"}`}>Documents</span>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-[#D9E2EC] bg-white shadow-sm"
          noValidate
        >
          <fieldset disabled={submitting} className="flex min-w-0 flex-col gap-8 p-5 sm:gap-9 sm:p-8 lg:p-9">
            {step === 1 && <>
            {/* 1. Identity */}
            <section id="section-identity" className="flex flex-col gap-5">
              <h2 className={sectionTitleClass}>Vos informations</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass} htmlFor="firstName">
                    Prénom
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    className={inputClass}
                    value={data.identity.firstName}
                    onChange={(e) => updateIdentity("firstName", e.target.value)}
                    autoComplete="given-name"
                  />
                  {identityErrors.firstName && (
                    <p className={errorClass}>{identityErrors.firstName}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass} htmlFor="lastName">
                    Nom
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    className={inputClass}
                    value={data.identity.lastName}
                    onChange={(e) => updateIdentity("lastName", e.target.value)}
                    autoComplete="family-name"
                  />
                  {identityErrors.lastName && (
                    <p className={errorClass}>{identityErrors.lastName}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className={labelClass} htmlFor="email">
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={inputClass}
                    value={data.identity.email}
                    onChange={(e) => updateIdentity("email", e.target.value)}
                    onBlur={() => void checkExistingDossier()}
                    autoComplete="email"
                  />
                  {identityErrors.email && <p className={errorClass}>{identityErrors.email}</p>}
                  {checkingDossier && <p className="text-xs text-gray-500">Vérification du dossier existant…</p>}
                  {lookupDone && !existingDossier && data.identity.email.trim() && !checkingDossier && (
                    <p className="text-xs text-[#217A50]">Aucun dossier bourse existant trouvé pour cet e-mail.</p>
                  )}
                </div>
              </div>
            </section>

            {existingDossier && (
              <section className="rounded-xl border border-[#B7D8EC] bg-[#F0F8FC] p-4 sm:p-5" aria-live="polite">
                <h2 className="text-base font-semibold text-[#173B65]">Dossier bourse existant trouvé</h2>
                <p className="mt-1 text-sm text-gray-600">Les pièces déjà reçues sont indiquées dans chaque rubrique ci-dessous. Vérifiez-les avant de choisir où envoyer vos nouveaux documents.</p>
                {existingDossier.unmatchedAttachmentCount > 0 && (
                  <p className="mt-2 text-xs text-gray-600">{existingDossier.unmatchedAttachmentCount} fichier(s) existant(s) ont un nom qui ne permet pas de les classer automatiquement.</p>
                )}
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <button type="button" aria-pressed={dossierChoice === "existing"} className={`${dossierChoice === "existing" ? "border-[#173B65] ring-2 ring-[#80C4EA]" : "border-[#D9E2EC]"} rounded-lg border bg-white px-4 py-3 text-left text-sm font-medium text-[#173B65] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80C4EA]`} onClick={() => setDossierChoice("existing")}>
                    Ajouter les nouveaux documents au dossier existant
                  </button>
                  <button type="button" aria-pressed={dossierChoice === "new"} className={`${dossierChoice === "new" ? "border-[#173B65] ring-2 ring-[#80C4EA]" : "border-[#D9E2EC]"} rounded-lg border bg-white px-4 py-3 text-left text-sm font-medium text-[#173B65] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80C4EA]`} onClick={() => setDossierChoice("new")}>
                    Créer un nouveau dossier séparé
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-600">Les nouveaux fichiers sont ajoutés aux pièces existantes. Ils ne les remplacent pas.</p>
              </section>
            )}

            <FamilyMembersSection
              members={data.familyMembers}
              onChange={(familyMembers) => setData((d) => ({ ...d, familyMembers }))}
              onAdd={() => setData((d) => ({ ...d, familyMembers: [...d.familyMembers, createEmptyMember()] }))}
            />
            </>}

            {step === 2 && <>
            {/* 3. Vie collective */}
            <section className="flex flex-col gap-5">
              <h2 className={sectionTitleClass}>Vie collective &amp; personnes du foyer</h2>
              <UploadZone
                label="Actes de naissance"
                description="Acte de naissance de chaque membre du foyer — traduit et apostillé."
                files={data.files.birthCertificates}
                alreadyUploadedFiles={existingDossier?.uploadedFilesByField.birthCertificates}
                onChange={(files) => setFiles("birthCertificates", files)}
              />
              <UploadZone
                label="Livret de famille / Attestation vie collective"
                files={data.files.familyBooklet}
                alreadyUploadedFiles={existingDossier?.uploadedFilesByField.familyBooklet}
                onChange={(files) => setFiles("familyBooklet", files)}
              />
            </section>

            <hr className="border-gray-100" />

            {/* 4. Propriété */}
            <section className="flex flex-col gap-5">
              <h2 className={sectionTitleClass}>Propriété immobilière</h2>
              <UploadZone
                label="Documents de propriété"
                description="Titre de propriété, acte notarié ou extrait cadastral. Un document par bien."
                files={data.files.propertyDocs}
                alreadyUploadedFiles={existingDossier?.uploadedFilesByField.propertyDocs}
                onChange={(files) => setFiles("propertyDocs", files)}
              />
            </section>

            <hr className="border-gray-100" />

            {/* 5. Non-propriété */}
            <section className="flex flex-col gap-5">
              <h2 className={sectionTitleClass}>Non-propriété</h2>
              <UploadZone
                label="Attestations de non-propriété"
                description="Une attestation par membre de la famille, délivrée par les autorités locales ou le notaire."
                files={data.files.nonPropertyDocs}
                alreadyUploadedFiles={existingDossier?.uploadedFilesByField.nonPropertyDocs}
                onChange={(files) => setFiles("nonPropertyDocs", files)}
              />
            </section>

            <hr className="border-gray-100" />

            {/* 6. Bank */}
            <section className="flex flex-col gap-5">
              <h2 className={sectionTitleClass}>
                Relevés bancaires &amp; solde au 31/12/2025
              </h2>
              <UploadZone
                label="Attestation de solde au 31/12/2025"
                description="Document officiel signé et cacheté par la banque — un par compte."
                files={data.files.balanceAttestation}
                alreadyUploadedFiles={existingDossier?.uploadedFilesByField.balanceAttestation}
                onChange={(files) => setFiles("balanceAttestation", files)}
              />
              <UploadZone
                label="Déclarations fiscales"
                files={data.files.taxDeclarations}
                alreadyUploadedFiles={existingDossier?.uploadedFilesByField.taxDeclarations}
                onChange={(files) => setFiles("taxDeclarations", files)}
              />
            </section>

            <hr className="border-gray-100" />

            {/* 7. Other */}
            <section className="flex flex-col gap-5">
              <h2 className={sectionTitleClass}>Autres documents demandés</h2>
              <p className="text-sm leading-relaxed text-gray-600">
                Certaines bourses demandent des documents supplémentaires selon votre situation :
                certificat de scolarité, attestation de résidence, justificatif de situation
                particulière, attestation de bourse nationale, relevé de notes récent, lettre de
                motivation, ou tout autre document demandé par votre conseiller JEExpert.
              </p>
              <UploadZone
                files={data.files.otherDocuments}
                alreadyUploadedFiles={existingDossier?.uploadedFilesByField.otherDocuments}
                onChange={(files) => setFiles("otherDocuments", files)}
              />
            </section>
            </>}

            {error && (
              <div className="rounded-lg border border-[#E9B7B7] bg-[#FFF5F5] px-4 py-3 text-sm text-[#B83232]" role="alert">
                {error}
              </div>
            )}

            {step === 1 ? (
              <div className="flex justify-end border-t border-gray-100 pt-6">
                <button type="button" className={btnPrimaryClass} onClick={() => void continueToDocuments()} disabled={checkingDossier}>
                  {checkingDossier ? "Vérification…" : "Continuer vers les documents"}
                </button>
              </div>
            ) : <div className="flex flex-col gap-3 border-t border-gray-100 pt-6">
              {submitting && totalToUpload > 0 && (
                <p className="text-sm text-gray-500">
                  Envoi des fichiers… {uploadedCount}/{totalToUpload}
                </p>
              )}
              {submitting && totalToUpload === 0 && (
                <p className="text-sm text-gray-500">Création du dossier…</p>
              )}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button type="button" className={btnSecondaryClass} disabled={submitting} onClick={() => { setStep(1); setError(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                Retour aux informations
              </button>
              <button type="submit" className={btnPrimaryClass} disabled={submitting || checkingDossier}>
                {(() => {
                  if (submitting) return "Envoi en cours…";
                  const n = countAllFiles(data.files);
                  if (n === 0) return "Envoyer le dossier";
                  return `Envoyer le dossier (${n} fichier${n > 1 ? "s" : ""})`;
                })()}
              </button>
              </div>
            </div>}
          </fieldset>
        </form>
        </div>
        </div>
      </div>
    </div>
  );
}

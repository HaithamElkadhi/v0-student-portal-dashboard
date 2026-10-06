"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildDocList, type DocDef } from "../buildDocList";
import type { AcademicData, AdmissionFormData, DocumentEntry, ExistingSubmission } from "../types";
import DocItem from "./DocItem";
import DocProgressBar from "./DocProgressBar";
import { btnPrimaryClass, btnSecondaryClass, sectionTitleClass } from "./fieldStyles";

interface Props {
  existing: ExistingSubmission | null;
  data: AdmissionFormData;
  onDocumentChange: (id: string, entry: DocumentEntry) => void;
  onBack: () => void;
  onSubmit: (existingRecordId?: string) => void;
  submitting: boolean;
  uploadedCount: number;
  totalToUpload: number;
  error: string | null;
}

type CheckState =
  | { status: "checking" }
  | { status: "choice"; existing: ExistingSubmission }
  | { status: "add"; existing: ExistingSubmission }
  | { status: "new" };

const SECTIONS: { key: DocDef["category"]; label: string }[] = [
  { key: "general",    label: "Général" },
  { key: "academic",   label: "Académique" },
  { key: "experience", label: "Expérience" },
];

const EMPTY_ENTRY: DocumentEntry = { file: null };

export default function Step4Upload({
  data,
  existing,
  onDocumentChange,
  onBack,
  onSubmit,
  submitting,
  uploadedCount,
  totalToUpload,
  error,
}: Props) {
  const academic: AcademicData = data.academic;
  const hasGap = academic.hasGap && academic.gapYears > 0;
  const docList = useMemo(
    () => buildDocList(academic.diplomaLevel, hasGap, academic.gapDocTypes, academic.gapOtherDocLabel, academic.studyLanguage),
    [academic.diplomaLevel, academic.gapDocTypes, academic.gapOtherDocLabel, academic.studyLanguage, hasGap]
  );

  const [checkState, setCheckState] = useState<CheckState>(existing ? { status: "add", existing } : { status: "new" });
  const checkedEmail = useRef<string>("");

  // Derive the submitted doc ids depending on mode
  const submittedDocIds: string[] =
    checkState.status === "add" ? checkState.existing.submittedDocIds : [];

  // Count only docs not yet submitted that have a file
  const uploadableCount = docList.filter(
    (d) => !submittedDocIds.includes(d.id) && data.documents[d.id]?.file
  ).length;

  const submitLabel = submitting
    ? totalToUpload > 0
      ? `Envoi… (${uploadedCount}/${totalToUpload})`
      : "Envoi…"
    : checkState.status === "add"
      ? "Compléter le dossier"
      : "Soumettre le dossier";

  // ── Checking spinner ───────────────────────────────────────────────────────
  if (checkState.status === "checking") {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <svg className="h-8 w-8 animate-spin text-[#173B65]" viewBox="0 0 24 24" fill="none" aria-label="Vérification en cours">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3 3 3v-4a8 8 0 01-8-8z" />
        </svg>
        <p className="text-sm text-gray-500">Vérification de votre dossier…</p>
      </div>
    );
  }

  // ── Choice screen ──────────────────────────────────────────────────────────
  if (checkState.status === "choice") {
    const { existing } = checkState;
    const submittedNames = docList
      .filter((d) => existing.submittedDocIds.includes(d.id))
      .map((d) => d.name);
    const missingCount = docList.filter(
      (d) => !existing.submittedDocIds.includes(d.id)
    ).length;

    return (
      <div className="flex flex-col gap-5">
        <h2 className={sectionTitleClass}>Dossier existant</h2>

        {/* Existing submission banner */}
        <div className="rounded-xl border border-[#173B65]/20 bg-[#173B65]/5 p-5">
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 shrink-0 text-[#173B65]" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="font-semibold text-[#173B65]">
                Un dossier existe déjà pour{" "}
                <span className="font-bold">{data.profile.email}</span>
              </p>
              {submittedNames.length > 0 && (
                <div className="mt-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Documents déjà envoyés ({submittedNames.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {submittedNames.map((name) => (
                      <span
                        key={name}
                        className="flex items-center gap-1 rounded-full bg-[#217A50]/10 px-2.5 py-0.5 text-xs font-medium text-[#217A50]"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                          <path d="M2 5.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm font-medium text-gray-700">Que souhaitez-vous faire ?</p>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* Add docs */}
          <button
            type="button"
            onClick={() => setCheckState({ status: "add", existing })}
            className="flex flex-col gap-2 rounded-xl border-2 border-[#173B65] bg-white p-5 text-left transition-colors hover:bg-[#173B65]/5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#173B65]/10">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M10 4v12M4 10h12" stroke="#173B65" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="font-semibold text-[#173B65]">Compléter mon dossier</p>
            <p className="text-xs text-gray-500">
              {missingCount > 0
                ? `Ajouter les ${missingCount} document${missingCount > 1 ? "s" : ""} manquant${missingCount > 1 ? "s" : ""}`
                : "Ajouter ou remplacer des documents"}
            </p>
          </button>

          {/* New submission */}
          <button
            type="button"
            onClick={() => setCheckState({ status: "new" })}
            className="flex flex-col gap-2 rounded-xl border-2 border-gray-200 bg-white p-5 text-left transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M6 2.5h5.5L16 7v10.5a1 1 0 01-1 1H6a1 1 0 01-1-1V3.5a1 1 0 011-1z" stroke="#64748b" strokeWidth="1.5" />
                <path d="M11.5 2.5V7H16" stroke="#64748b" strokeWidth="1.5" />
              </svg>
            </div>
            <p className="font-semibold text-gray-900">Nouveau dossier</p>
            <p className="text-xs text-gray-500">
              Créer une nouvelle soumission complète
            </p>
          </button>
        </div>

        <button type="button" onClick={onBack} className={btnSecondaryClass + " self-start"}>
          ← Retour
        </button>
      </div>
    );
  }

  // ── Upload screen (new or add mode) ───────────────────────────────────────
  const isAddMode = checkState.status === "add";
  const totalVisible = isAddMode
    ? docList.filter((d) => !submittedDocIds.includes(d.id)).length
    : docList.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className={sectionTitleClass}>
          {isAddMode ? "Compléter le dossier" : "Téléversement des documents"}
        </h2>
        {isAddMode && (
          <button
            type="button"
            onClick={() => { if (checkState.status === "add") setCheckState({ status: "choice", existing: checkState.existing }); }}
            className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Voir mon dossier existant
          </button>
        )}
      </div>

      {isAddMode ? (
        <p className="text-sm text-[#173B65] font-medium bg-[#173B65]/5 rounded-lg px-3 py-2 border border-[#173B65]/20">
          Les documents déjà envoyés sont grisés. Téléversez uniquement les documents manquants.
        </p>
      ) : (
        <DocProgressBar uploaded={uploadableCount} total={totalVisible} />
      )}

      <p className="text-xs text-gray-500">
        Chaque fichier doit faire moins de 5 Mo. Compressez les PDF volumineux avant de les envoyer.
      </p>

      <div className="flex flex-col gap-5">
        {SECTIONS.map(({ key, label }) => {
          const docs = docList.filter((d) => d.category === key);
          if (docs.length === 0) return null;
          return (
            <div key={key} className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</p>
              {docs.map((def) => (
                <DocItem
                  key={def.id}
                  def={def}
                  entry={data.documents[def.id] ?? EMPTY_ENTRY}
                  onChange={(entry) => onDocumentChange(def.id, entry)}
                  alreadySubmitted={isAddMode && submittedDocIds.includes(def.id)}
                />
              ))}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex gap-3">
          <svg className="mt-0.5 shrink-0 text-red-500" width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className={`${btnSecondaryClass} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          Retour
        </button>
        <button
          type="button"
          onClick={() =>
            onSubmit(isAddMode ? checkState.existing.recordId : undefined)
          }
          disabled={submitting}
          className={`${btnPrimaryClass} disabled:cursor-not-allowed disabled:opacity-70`}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

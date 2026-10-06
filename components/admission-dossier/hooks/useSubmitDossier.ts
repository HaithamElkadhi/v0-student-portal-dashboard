"use client";

import { useRef, useState } from "react";
import { buildDocList } from "../buildDocList";
import { FIXED_SCORE_FORMAT, type AdmissionFormData } from "../types";

/** Must match Airtable content upload limit (see admission-airtable.ts). */
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

export interface SubmitResult {
  success: true;
  recordId: string;
  prospectFound: boolean;
  docsUploaded: number;
  totalDocsExpected: number;
}

export interface SubmitError {
  success: false;
  error: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatMb(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1);
}

/**
 * Detects whether a thrown error is a browser-level network failure
 * (no internet, DNS failure, connection refused, SSL error, etc.)
 * and replaces the raw technical message with a clear French explanation.
 */
function toUserError(err: unknown, context: string, timeoutMs: number): string {
  if (!(err instanceof Error)) {
    return `Une erreur inattendue s'est produite ${context}. Réessayez ou contactez-nous sur WhatsApp.`;
  }

  const name = err.name;
  const msg  = err.message.toLowerCase();

  // AbortController fired — our own timeout
  if (name === "AbortError") {
    const secs = Math.round(timeoutMs / 1000);
    return (
      `La requête a expiré (>${secs}s) ${context}. ` +
      `Votre connexion internet est peut-être lente ou instable — réessayez dans quelques secondes.`
    );
  }

  // Browser network errors: "Failed to fetch", "NetworkError when attempting to fetch resource", etc.
  const isNetworkError =
    name === "TypeError" &&
    (msg.includes("failed to fetch") ||
      msg.includes("networkerror") ||
      msg.includes("network request failed") ||
      msg.includes("load failed") ||        // Safari
      msg.includes("fetch is aborted") ||
      msg.includes("the internet connection appears to be offline"));

  if (isNetworkError) {
    const online = typeof navigator !== "undefined" ? navigator.onLine : true;
    if (!online) {
      return `Vous n'êtes pas connecté à internet. Vérifiez votre connexion Wi-Fi ou données mobiles et réessayez.`;
    }
    return (
      `Impossible de joindre le serveur ${context}. ` +
      `Vérifiez votre connexion internet et réessayez. Si le problème persiste, contactez-nous sur WhatsApp.`
    );
  }

  // The error is already a readable message we threw ourselves — pass it through.
  return err.message;
}

/**
 * fetch() with a timeout and friendly network-error translation.
 * @param timeoutMs  Request timeout in milliseconds (default 30s).
 * @param context    Plain-language description shown in the error ("lors de la création du dossier").
 */
async function safeFetch(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  context: string,
  timeoutMs = 30_000
): Promise<Response> {
  // Fail immediately if the device is offline — no need to wait for a timeout.
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new Error(
      `Vous n'êtes pas connecté à internet. Vérifiez votre connexion Wi-Fi ou données mobiles et réessayez.`
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (err) {
    throw new Error(toUserError(err, context, timeoutMs));
  } finally {
    clearTimeout(timer);
  }
}

export function useSubmitDossier() {
  const pendingRecord = useRef<string | undefined>(undefined);
  const completedFiles = useRef(new Set<File>());
  const [submitting, setSubmitting]       = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [totalToUpload, setTotalToUpload] = useState(0);
  const [error, setError]                 = useState<string | null>(null);

  async function submitDossier(
    formState: AdmissionFormData,
    /** When provided, skip record creation and upload to this existing record. */
    existingRecordId?: string
  ): Promise<SubmitResult | SubmitError> {
    setSubmitting(true);
    setError(null);
    setUploadedCount(0);

    const { profile, academic, documents } = formState;
    const hasGap = academic.hasGap && academic.gapYears > 0;
    const docList = buildDocList(
      academic.diplomaLevel,
      hasGap,
      academic.gapDocTypes,
      academic.gapOtherDocLabel,
      academic.studyLanguage
    );
    const filesToUpload = docList.filter((d) => documents[d.id]?.file && !completedFiles.current.has(documents[d.id].file!));
    setTotalToUpload(filesToUpload.length);

    try {
      // ── Pre-flight: reject oversized files immediately ─────────────────────
      for (const def of filesToUpload) {
        const file = documents[def.id]?.file;
        if (file && file.size > MAX_ATTACHMENT_BYTES) {
          throw new Error(
            `Le fichier « ${def.name} » fait ${formatMb(file.size)} Mo. ` +
            `La limite est de 5 Mo par fichier — compressez-le et réessayez.`
          );
        }
        // Reject obviously-corrupt zero-byte files
        if (file && file.size === 0) {
          throw new Error(
            `Le fichier « ${def.name} » est vide (0 octet). Sélectionnez un fichier valide.`
          );
        }
      }

      // ── Step 1: Create the Airtable record (or reuse existing) ───────────
      let recordId: string;
      let createJson: Record<string, unknown> = {};

      if (pendingRecord.current) {
        recordId = pendingRecord.current;
      } else {
        const createRes = await safeFetch(
          "/api/student-admission-dossier",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recordId: existingRecordId,
              folderId: profile.folderId,
              profile: {
                firstName: profile.firstName,
                lastName:  profile.lastName,
                email:     profile.email,
                phone: profile.phone,
                programType: profile.programType,
              },
              academic: {
                diplomaLevel:  academic.diplomaLevel,
                fieldOfStudy:  academic.fieldOfStudy,
                scoreFormat:   FIXED_SCORE_FORMAT,
                scoreValue:    academic.scoreValue,
                gapYears:      academic.gapYears,
                gapDocTypes:   academic.gapDocTypes,
                yearObtained: academic.yearObtained,
                studyLanguage: academic.studyLanguage,
                gapDescription: academic.gapOtherDocLabel,
              },
              passportExpiry:    documents.passport?.expiryDate || null,
              languageCertName:  documents.lang?.certName || "",
              docsUploadedCount: filesToUpload.length,
            }),
          },
          "lors de la création de votre dossier",
          30_000
        );

        try {
          createJson = await createRes.json();
        } catch {
          throw new Error(
            "Le serveur a renvoyé une réponse invalide lors de la création du dossier. " +
            "Réessayez dans quelques secondes."
          );
        }

        if (!createRes.ok || !createJson.success || !createJson.recordId) {
          const apiError = typeof createJson.error === "string" ? createJson.error : "";
          throw new Error(
            apiError ||
            `Erreur serveur (code ${createRes.status}) lors de la création du dossier. ` +
            `Réessayez ou contactez-nous sur WhatsApp.`
          );
        }

        recordId = createJson.recordId as string;
        pendingRecord.current = recordId;
      }

      let docsUploaded = 0;

      // ── Step 2: Upload files one by one ───────────────────────────────────
      for (const def of filesToUpload) {
        const entry = documents[def.id];
        if (!entry?.file) continue;

        // Respect Airtable's 5 req/s rate limit
        if (docsUploaded > 0) await sleep(250);

        const fd = new FormData();
        fd.append("recordId",  recordId);
        fd.append("email", profile.email);
        fd.append("folderId", profile.folderId || "");
        fd.append("docId",     def.id);
        fd.append("firstName", profile.firstName);
        fd.append("lastName",  profile.lastName);
        fd.append("file",      entry.file);
        if (entry.certName) fd.append("certName", entry.certName);

        // Allow up to 2 min per file (5 MB on a slow connection)
        const uploadRes = await safeFetch(
          "/api/student-admission-dossier/upload",
          { method: "POST", body: fd },
          `lors de l'envoi de « ${def.name} »`,
          120_000
        );

        let uploadJson: Record<string, unknown> = {};
        try {
          uploadJson = await uploadRes.json();
        } catch {
          throw new Error(
            `Le serveur a renvoyé une réponse invalide lors de l'envoi de « ${def.name} ». ` +
            `Réessayez ou contactez-nous sur WhatsApp.`
          );
        }

        if (!uploadRes.ok || !uploadJson.success) {
          const detail = typeof uploadJson.error === "string" ? uploadJson.error : "";
          throw new Error(
            detail ||
            `Échec de l'envoi de « ${def.name} » ` +
            `(${docsUploaded}/${filesToUpload.length} envoyés, code ${uploadRes.status}). ` +
            `Réessayez ou contactez-nous sur WhatsApp.`
          );
        }

        completedFiles.current.add(entry.file);
        docsUploaded += 1;
        setUploadedCount(docsUploaded);
      }

      const result: SubmitResult = {
        success: true,
        recordId,
        prospectFound:     Boolean(createJson.prospectFound),
        docsUploaded,
        totalDocsExpected: Number(createJson.totalDocsExpected) || docList.length,
      };
      return result;

    } catch (err) {
      // At this point `err` is always an Error with a human-readable French message
      // because safeFetch and our own throws guarantee it.
      const message =
        err instanceof Error
          ? err.message
          : "Une erreur inattendue s'est produite. Réessayez ou contactez-nous sur WhatsApp.";
      console.error("[submitDossier]", message);
      setError(message);
      return { success: false, error: message };
    } finally {
      setSubmitting(false);
    }
  }

  return {
    submitDossier,
    submitting,
    uploadedCount,
    totalToUpload,
    error,
    setError,
  };
}

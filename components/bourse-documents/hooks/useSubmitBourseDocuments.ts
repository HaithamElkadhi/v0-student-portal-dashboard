"use client";

import { useRef, useState } from "react";
import {
  countAllFiles,
  formatHouseholdMembersText,
  type DocumentsBourseFormData,
  type UploadZoneKey,
} from "../types";

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

export interface SubmitSuccess {
  success: true;
  recordId: string;
  prospectFound: boolean;
  filesUploaded: number;
}

export interface SubmitFailure {
  success: false;
  error: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatMb(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1);
}

type UploadJob = { fieldKey: UploadZoneKey; file: File };
export type ExistingBourseTarget = { recordId: string };

function collectJobs(files: DocumentsBourseFormData["files"]): UploadJob[] {
  const keys = Object.keys(files) as UploadZoneKey[];
  const jobs: UploadJob[] = [];
  for (const key of keys) {
    for (const file of files[key]) {
      jobs.push({ fieldKey: key, file });
    }
  }
  return jobs;
}

export function useSubmitBourseDocuments() {
  const pending = useRef<{ data: DocumentsBourseFormData; recordId: string; completed: Set<File> } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [totalToUpload, setTotalToUpload] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function submit(
    data: DocumentsBourseFormData,
    existingTarget?: ExistingBourseTarget
  ): Promise<SubmitSuccess | SubmitFailure> {
    setSubmitting(true);
    setError(null);
    setUploadedCount(0);

    const jobs = collectJobs(data.files);
    setTotalToUpload(jobs.length);

    try {
      for (const job of jobs) {
        if (job.file.size > MAX_ATTACHMENT_BYTES) {
          throw new Error(
            `"${job.file.name}" fait ${formatMb(job.file.size)} Mo. Airtable n'accepte que les fichiers jusqu'à 5 Mo — merci de le compresser et de réessayer.`
          );
        }
      }

      const resume = pending.current?.data.identity.email === data.identity.email && (!existingTarget || existingTarget.recordId === pending.current.recordId) ? pending.current : null;
      const createRes = resume ? null : await fetch("/api/submit-bourse-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.identity.firstName,
          lastName: data.identity.lastName,
          email: data.identity.email,
          householdMembersText: formatHouseholdMembersText(
            data.familyMembers,
            data.identity
          ),
          existingRecordId: existingTarget?.recordId,
        }),
      });

      const createJson = resume ? { success: true, recordId: resume.recordId, prospectFound: true } : await createRes!.json().catch(() => ({}));
      if ((!resume && !createRes!.ok) || !createJson.success || !createJson.recordId) {
        throw new Error(
          createJson.error ||
            "Une erreur s'est produite. Réessayez ou contactez-nous sur WhatsApp."
        );
      }

      const recordId = createJson.recordId as string;
      const progress = resume || { data, recordId, completed: new Set<File>() };
      pending.current = progress;
      let filesUploaded = progress.completed.size;
      setUploadedCount(filesUploaded);

      for (const job of jobs) {
        if (progress.completed.has(job.file)) continue;
        if (filesUploaded > 0) await sleep(250);

        const fd = new FormData();
        fd.append("recordId", recordId);
        fd.append("email", data.identity.email);
        fd.append("fieldKey", job.fieldKey);
        fd.append("groupKey", `${job.fieldKey}__file`);
        fd.append("file", job.file);

        const uploadRes = await fetch("/api/submit-bourse-documents/upload", {
          method: "POST",
          body: fd,
        });
        const uploadJson = await uploadRes.json().catch(() => ({}));
        if (!uploadRes.ok || !uploadJson.success) {
          const detail =
            typeof uploadJson.error === "string" ? uploadJson.error : "";
          throw new Error(
            detail ||
              `Échec lors de l'envoi de « ${job.file.name} » (${filesUploaded}/${jobs.length} terminés). Réessayez ou contactez-nous sur WhatsApp.`
          );
        }

        progress.completed.add(job.file);
        filesUploaded += 1;
        setUploadedCount(filesUploaded);
      }

      return {
        success: true,
        recordId,
        prospectFound: Boolean(createJson.prospectFound),
        filesUploaded: filesUploaded || countAllFiles(data.files),
      };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Une erreur s'est produite. Réessayez ou contactez-nous sur WhatsApp.";
      console.error("[submitBourseDocuments]", message);
      setError(message);
      return { success: false, error: message };
    } finally {
      setSubmitting(false);
    }
  }

  return {
    submit,
    submitting,
    uploadedCount,
    totalToUpload,
    error,
    setError,
  };
}

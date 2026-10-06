"use client";

import { useRef, useState } from "react";
import { btnDangerClass, hintClass, labelClass } from "./fieldStyles";

const ACCEPTED = ".pdf,.jpg,.jpeg,.png";
const ACCEPTED_MIME = new Set(["application/pdf", "image/jpeg", "image/png"]);
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

interface Props {
  label?: string;
  description?: string;
  files: File[];
  alreadyUploadedFiles?: string[];
  onChange: (files: File[]) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function isAcceptedFile(file: File): boolean {
  if (ACCEPTED_MIME.has(file.type)) return true;
  const lower = file.name.toLowerCase();
  return lower.endsWith(".pdf") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png");
}

export default function UploadZone({ label, description, files, onChange, alreadyUploadedFiles = [] }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  function addFiles(incoming: FileList | File[]) {
    const next = [...files];
    const errors: string[] = [];

    for (const file of Array.from(incoming)) {
      if (!isAcceptedFile(file)) {
        errors.push(`« ${file.name} » : format non accepté (PDF, JPG, PNG).`);
        continue;
      }
      if (file.size > MAX_ATTACHMENT_BYTES) {
        errors.push(
          `« ${file.name} » fait ${formatSize(file.size)} — max 5 Mo.`
        );
        continue;
      }
      const duplicate = next.some(
        (f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified
      );
      if (!duplicate) next.push(file);
    }

    setLocalError(errors.length > 0 ? errors[0] : null);
    onChange(next);
  }

  function removeAt(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      {(label || description) && (
        <div className="flex flex-col gap-1">
          {label && <p className={labelClass}>{label}</p>}
          {description && <p className={hintClass}>{description}</p>}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
        }}
        className={`flex min-h-36 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80C4EA] focus-visible:ring-offset-2 ${
          dragging
            ? "border-[#173B65] bg-[#80C4EA]/10"
            : "border-[#B8C7D8] bg-[#F8FAFC] hover:border-[#173B65] hover:bg-[#F4F7FB]"
        }`}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#173B65]" aria-hidden>
          <path
            d="M12 16V4M12 4l-4 4M12 4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-sm text-gray-700">
          Cliquez pour choisir ou glissez-déposez vos fichiers
        </p>
        <p className={hintClass}>PDF, JPG, PNG — plusieurs fichiers autorisés (max 5 Mo chacun)</p>
      </button>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={ACCEPTED}
        multiple
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {localError && <p className="text-xs text-italy-terracotta-dark">{localError}</p>}

      {alreadyUploadedFiles.length > 0 && (
        <div className="rounded-lg border border-[#B6DCC8] bg-[#EFF8F2] px-3 py-2.5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#217A50]">Déjà envoyés dans ce dossier</p>
          <ul className="flex flex-col gap-1">
            {alreadyUploadedFiles.map((name, index) => (
              <li key={`${name}-${index}`} className="truncate text-sm text-[#172D43]">{name}</li>
            ))}
          </ul>
        </div>
      )}

      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{file.name}</p>
                <p className={hintClass}>{formatSize(file.size)}</p>
              </div>
              <button
                type="button"
                className={btnDangerClass}
                onClick={() => removeAt(index)}
              >
                Retirer
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

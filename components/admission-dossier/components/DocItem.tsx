"use client";

import { useRef } from "react";
import type { DocDef } from "../buildDocList";
import type { DocumentEntry } from "../types";
import { inputClass, labelClass } from "./fieldStyles";

interface Props {
  def: DocDef;
  entry: DocumentEntry;
  onChange: (entry: DocumentEntry) => void;
  /** Doc was already uploaded in a previous submission — show as grayed/done. */
  alreadySubmitted?: boolean;
}

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

function DocIcon({ uploaded }: { uploaded: boolean }) {
  if (uploaded) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#217A50]/15 text-[#217A50]">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M4 10.5L8 14.5L16 5.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path
          d="M6 2.5h5.5L16 7v10.5a1 1 0 01-1 1H6a1 1 0 01-1-1V3.5a1 1 0 011-1z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M11.5 2.5V7H16" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

export default function DocItem({ def, entry, onChange, alreadySubmitted }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploaded = Boolean(entry.file);
  const tooLarge = Boolean(entry.file && entry.file.size > MAX_ATTACHMENT_BYTES);

  // Already submitted in a prior session — render as a read-only "done" row
  if (alreadySubmitted) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 opacity-60">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#217A50]/15 text-[#217A50]">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M4 10.5L8 14.5L16 5.5" stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="flex-1 text-sm font-medium text-gray-500">{def.name}</p>
        <span className="rounded-full bg-[#217A50]/10 px-2.5 py-0.5 text-xs font-semibold text-[#217A50]">
          Déjà envoyé
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-4 transition-colors ${
        tooLarge
          ? "border-red-200 bg-red-50"
          : uploaded
            ? "border-[#217A50]/40 bg-[#217A50]/5"
            : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <DocIcon uploaded={uploaded} />

        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-900">{def.name}</p>
          {tooLarge && entry.file && (
            <p className="mt-1 text-xs text-red-700">
              Le fichier fait {(entry.file.size / (1024 * 1024)).toFixed(1)} Mo — max 5 Mo.
              Merci de le compresser et de le renvoyer.
            </p>
          )}
        </div>

        {uploaded ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#217A50] text-white"
            aria-label={`${def.name} téléversé — remplacer`}
            title="Remplacer le fichier"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M3 8.5L6.5 12L13 4.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Téléverser
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            onChange({ ...entry, file });
            e.target.value = "";
          }}
        />
      </div>

      {def.extraField === "expiryDate" && (
        <div className="flex max-w-xs flex-col gap-1.5 pl-[3.25rem]">
          <label className={labelClass} htmlFor={`${def.id}-expiry`}>
            Date d&apos;expiration
          </label>
          <input
            id={`${def.id}-expiry`}
            type="date"
            className={inputClass}
            value={entry.expiryDate ?? ""}
            onChange={(e) => onChange({ ...entry, expiryDate: e.target.value })}
          />
        </div>
      )}

      {def.extraField === "certName" && (
        <div className="flex flex-col gap-1.5 pl-[3.25rem]">
          <label className={labelClass} htmlFor={`${def.id}-cert`}>
            Nom du certificat
          </label>
          <input
            id={`${def.id}-cert`}
            type="text"
            className={inputClass}
            placeholder="IELTS, TOEFL, DALF, EF SET, CILS…"
            value={entry.certName ?? ""}
            onChange={(e) => onChange({ ...entry, certName: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}

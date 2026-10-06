"use client";

import { FormEvent, useEffect, useState } from "react";
import { useStudentPortal } from "@/components/student-portal-context";
const inputClass = "min-h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jx-terracotta)]/25 disabled:opacity-60";
const labelClass = "text-sm font-medium text-zinc-700";


type Phase = "form" | "success";
const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const ACCEPTED_ATTACHMENT_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"];

export default function TicketForm() {
  const { studentInfo } = useStudentPortal();
  const [phase, setPhase] = useState<Phase>("form");
  const [fullName, setFullName] = useState([studentInfo.name, studentInfo.surname].filter(Boolean).join(" "));
  const [email, setEmail] = useState(studentInfo.email || "");
  const [phone, setPhone] = useState(studentInfo.phone || studentInfo.whatsapp || "");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentInputError, setAttachmentInputError] = useState<string | null>(null);
  const [attachmentNotice, setAttachmentNotice] = useState<string | null>(null);
  const [attachmentsUploaded, setAttachmentsUploaded] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketRef, setTicketRef] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      setCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const res = await fetch("/api/ticket-categories");
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json.error || "Could not load categories.");
        }
        const list = Array.isArray(json.categories)
          ? json.categories.filter((c: unknown): c is string => typeof c === "string")
          : [];
        if (!cancelled) setCategories(list);
      } catch (err) {
        if (!cancelled) {
          setCategoriesError(
            err instanceof Error ? err.message : "Could not load categories."
          );
        }
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    }

    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!subject) return;

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("fullName", fullName.trim());
      formData.append("email", email.trim());
      formData.append("phone", phone.trim());
      formData.append("subject", subject);
      formData.append("description", description.trim());
      attachments.forEach((file) => formData.append("attachments", file));
      const res = await fetch("/api/submit-ticket", { method: "POST", body: formData });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Something went wrong. Please try again.");
      }

      setTicketRef(typeof json.ticketRef === "string" ? json.ticketRef : null);
      setAttachmentsUploaded(Number(json.attachmentsUploaded) || 0);
      setAttachmentNotice(typeof json.attachmentError === "string" ? json.attachmentError : null);
      setPhase("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function addAttachments(incoming: FileList | File[]) {
    const next = [...attachments];
    let nextError: string | null = null;
    for (const file of Array.from(incoming)) {
      const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (!ACCEPTED_ATTACHMENT_EXTENSIONS.includes(extension)) {
        nextError = `“${file.name}” has an unsupported format. Use PDF, JPG, PNG, DOC, or DOCX.`;
        continue;
      }
      if (file.size > MAX_ATTACHMENT_BYTES) {
        nextError = `“${file.name}” exceeds the 5 MB limit.`;
        continue;
      }
      const duplicate = next.some(
        (current) => current.name === file.name && current.size === file.size && current.lastModified === file.lastModified
      );
      if (duplicate) continue;
      if (next.length >= MAX_ATTACHMENTS) {
        nextError = `Attach up to ${MAX_ATTACHMENTS} files.`;
        break;
      }
      next.push(file);
    }
    setAttachments(next);
    setAttachmentInputError(nextError);
  }

  function formatFileSize(bytes: number): string {
    return bytes < 1024 * 1024
      ? `${Math.ceil(bytes / 1024)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="text-zinc-900">
      <div className="mx-auto w-full max-w-4xl">

      <div className="w-full">
        {phase === "success" ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <svg width="80" height="80" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
              <circle
                className="checkmark-circle"
                cx="26"
                cy="26"
                r="25"
                fill="none"
                stroke="#217A50"
                strokeWidth="2"
              />
              <path
                className="checkmark-check"
                fill="none"
                stroke="#217A50"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.1 27.2l7.1 7.2 16.7-16.8"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900">Ticket submitted</h2>
            <p className="max-w-xs text-gray-600">
              Our team has received your request and will follow up soon.
            </p>
            {ticketRef ? (
              <p className="mt-2 rounded-lg bg-gray-50 px-4 py-3 font-mono text-sm text-gray-900">
                Reference: <span className="font-semibold">{ticketRef}</span>
              </p>
            ) : (
              <p className="mt-2 text-sm text-gray-500">
                Keep an eye on your email for updates from our team.
              </p>
            )}
            {attachmentsUploaded > 0 && (
              <p className="text-sm text-[#217A50]">
                {attachmentsUploaded} attachment{attachmentsUploaded > 1 ? "s" : ""} uploaded.
              </p>
            )}
            {attachmentNotice && (
              <p className="max-w-lg rounded-lg border border-[#E9B7B7] bg-[#FFF5F5] px-4 py-3 text-left text-sm text-[#B83232]" role="alert">
                {attachmentNotice}
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                setPhase("form");
                setFullName([studentInfo.name, studentInfo.surname].filter(Boolean).join(" "));
                setEmail(studentInfo.email || "");
                setPhone(studentInfo.phone || studentInfo.whatsapp || "");
                setSubject("");
                setDescription("");
                setAttachments([]);
                setAttachmentInputError(null);
                setAttachmentNotice(null);
                setAttachmentsUploaded(0);
                setTicketRef(null);
                setError(null);
              }}
              className="mt-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Submit another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold text-gray-900">Ticket support</h1>
              <p className="text-sm text-gray-600">
                Tell us what you need help with. We&apos;ll create a task for our team.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="fullName">
                Full name
              </label>
              <input
                id="fullName"
                required
                className={inputClass}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="phone">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                required
                className={inputClass}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="subject">
                Request subject
              </label>
              <select
                id="subject"
                required
                className={inputClass}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={categoriesLoading || Boolean(categoriesError) || categories.length === 0}
              >
                <option value="" disabled>
                  {categoriesLoading
                    ? "Loading categories…"
                    : categoriesError
                      ? "Categories unavailable"
                  : "Select a request subject"}
                </option>
                {categories.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {categoriesError && (
                <p className="text-sm text-red-600" role="alert">
                  {categoriesError}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                required
                rows={5}
                className={`${inputClass} resize-y`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your request…"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <label className={labelClass} htmlFor="attachments">
                  Attachments <span className="font-normal text-gray-500">(optional)</span>
                </label>
                <p className="text-xs text-gray-500">PDF, JPG, PNG, DOC, or DOCX — up to {MAX_ATTACHMENTS} files, 5 MB each.</p>
              </div>
              <input
                id="attachments"
                type="file"
                multiple
                accept={ACCEPTED_ATTACHMENT_EXTENSIONS.join(",")}
                className="block min-h-11 w-full rounded-lg border border-[#D9E2EC] bg-white text-sm text-[#172D43] file:mr-4 file:min-h-11 file:border-0 file:bg-[#F4F7FB] file:px-4 file:font-medium file:text-[#173B65] hover:file:bg-[#EAF0F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80C4EA]"
                onChange={(e) => {
                  if (e.target.files?.length) addAttachments(e.target.files);
                  e.target.value = "";
                }}
              />
              {attachmentInputError && <p className="text-sm text-[#B83232]" role="alert">{attachmentInputError}</p>}
              {attachments.length > 0 && (
                <ul className="flex flex-col gap-2" aria-label="Selected attachments">
                  {attachments.map((file, index) => (
                    <li key={`${file.name}-${file.size}-${file.lastModified}`} className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-[#D9E2EC] bg-[#F8FAFC] px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#172D43]">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                      <button type="button" className="min-h-11 shrink-0 rounded-lg px-3 text-sm font-medium text-[#B83232] hover:bg-[#FFF5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80C4EA]" onClick={() => setAttachments((current) => current.filter((_, i) => i !== index))}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={
                submitting ||
                categoriesLoading ||
                Boolean(categoriesError) ||
                categories.length === 0
              }
              className="mt-1 rounded-lg bg-[var(--jx-terracotta)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting…" : attachments.length > 0 ? "Submit ticket and attachments" : "Submit ticket"}
            </button>
          </form>
        )}
      </div>
      </div>
    </div>
  );
}

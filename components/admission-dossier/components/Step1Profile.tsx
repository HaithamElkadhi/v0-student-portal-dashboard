"use client";

import { FormEvent } from "react";
import type { ProfileData, ProgramType } from "../types";
import { PROGRAM_TYPE_OPTIONS } from "../options";
import {
  btnPrimaryClass,
  inputClass,
  labelClass,
  sectionTitleClass,
} from "./fieldStyles";

interface Props {
  data: ProfileData;
  update: <K extends keyof ProfileData>(key: K, value: ProfileData[K]) => void;
  onNext: () => void;
}

export default function Step1Profile({ data, update, onNext }: Props) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onNext();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <h2 className={sectionTitleClass}>Informations personnelles</h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="firstName">
            Prénom
          </label>
          <input
            id="firstName"
            className={inputClass}
            value={data.firstName}
            onChange={(e) => update("firstName", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="lastName">
            Nom
          </label>
          <input
            id="lastName"
            className={inputClass}
            value={data.lastName}
            onChange={(e) => update("lastName", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="email">
            Adresse e-mail
          </label>
          <input
            id="email"
            type="email"
            readOnly
            className={inputClass}
            value={data.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="phone">
            Téléphone (WhatsApp)
          </label>
          <input
            id="phone"
            type="tel"
            className={inputClass}
            placeholder="+216 XX XXX XXX"
            value={data.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="programType">
          Type de programme visé
        </label>
        <select
          id="programType"
          className={inputClass}
          value={data.programType}
          onChange={(e) => update("programType", e.target.value as ProgramType)}
        >
          <option value="" disabled>
            Sélectionner…
          </option>
          {PROGRAM_TYPE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-2 flex justify-end">
        <button type="submit" className={btnPrimaryClass}>
          Continuer
        </button>
      </div>
    </form>
  );
}

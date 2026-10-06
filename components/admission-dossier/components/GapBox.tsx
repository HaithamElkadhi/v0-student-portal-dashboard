"use client";

import type { GapDocType } from "../types";
import { GAP_DOC_TYPE_OPTIONS } from "../options";
import {
  hintClass,
  inputClass,
  labelClass,
  pillActiveClass,
  pillClass,
  pillIdleClass,
  warningBoxClass,
} from "./fieldStyles";

interface Props {
  gapYears: number;
  gapDescription: string;
  gapDocTypes: GapDocType[];
  onDescriptionChange: (value: string) => void;
  onDocTypesChange: (types: GapDocType[]) => void;
}

export default function GapBox({
  gapDescription,
  gapDocTypes,
  onDescriptionChange,
  onDocTypesChange,
}: Props) {
  function toggleType(type: GapDocType) {
    if (type === "No document") {
      onDocTypesChange(gapDocTypes.includes("No document") ? [] : ["No document"]);
      return;
    }

    const withoutNo = gapDocTypes.filter((t) => t !== "No document");
    if (withoutNo.includes(type)) {
      onDocTypesChange(withoutNo.filter((t) => t !== type));
    } else {
      onDocTypesChange([...withoutNo, type]);
    }
  }

  return (
    <div className={warningBoxClass}>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="gapDescription">
          Qu&apos;avez-vous fait pendant cette période ?
        </label>
        <textarea
          id="gapDescription"
          rows={4}
          className={inputClass}
          placeholder="Décrivez vos activités : projets personnels, bénévolat, voyages, raisons familiales, recherche d'emploi…"
          value={gapDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className={labelClass}>
          Documents justifiant cette période (sélectionnez tout ce qui s&apos;applique)
        </p>
        <div className="flex flex-wrap gap-2">
          {GAP_DOC_TYPE_OPTIONS.map((opt) => {
            const selected = gapDocTypes.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleType(opt.value)}
                className={`${pillClass} ${selected ? pillActiveClass : pillIdleClass}`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <p className={hintClass}>
          Sélectionner « Aucun document » efface les autres choix. Chaque type sélectionné ajoute
          un emplacement d&apos;upload à l&apos;étape 3.
        </p>
      </div>
    </div>
  );
}

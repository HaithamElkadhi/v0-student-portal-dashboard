"use client";

import type { FamilyMember, Relationship, Situation } from "../types";
import { RELATIONSHIP_OPTIONS, SITUATION_OPTIONS } from "../types";
import {
  btnDangerClass,
  btnSecondaryClass,
  cardClass,
  inputClass,
  labelClass,
  sectionTitleClass,
} from "./fieldStyles";

interface Props {
  members: FamilyMember[];
  onChange: (members: FamilyMember[]) => void;
  onAdd: () => void;
}

export default function FamilyMembersSection({ members, onChange, onAdd }: Props) {
  function updateMember<K extends keyof FamilyMember>(
    id: string,
    key: K,
    value: FamilyMember[K]
  ) {
    onChange(members.map((m) => (m.id === id ? { ...m, [key]: value } : m)));
  }

  function removeMember(id: string) {
    onChange(members.filter((m) => m.id !== id));
  }

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className={sectionTitleClass}>Composition de la famille au foyer</h2>
        <p className="mt-1 text-sm text-gray-500">
          Ajoutez chaque membre du foyer. Aucun document n&apos;est demandé dans cette section.
        </p>
      </div>

      {members.length === 0 && (
        <p className="text-sm text-gray-500">Aucun membre ajouté pour le moment.</p>
      )}

      <div className="flex flex-col gap-4">
        {members.map((member, index) => (
          <div key={member.id} className={`${cardClass} flex flex-col gap-4`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#173B65]">Membre {index + 1}</p>
              <button
                type="button"
                className={btnDangerClass}
                onClick={() => removeMember(member.id)}
              >
                Retirer
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor={`member-${member.id}-first`}>
                  Prénom
                </label>
                <input
                  id={`member-${member.id}-first`}
                  type="text"
                  className={inputClass}
                  value={member.firstName}
                  onChange={(e) => updateMember(member.id, "firstName", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor={`member-${member.id}-last`}>
                  Nom
                </label>
                <input
                  id={`member-${member.id}-last`}
                  type="text"
                  className={inputClass}
                  value={member.lastName}
                  onChange={(e) => updateMember(member.id, "lastName", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor={`member-${member.id}-dob`}>
                  Date de naissance
                </label>
                <input
                  id={`member-${member.id}-dob`}
                  type="date"
                  className={inputClass}
                  value={member.dateOfBirth}
                  onChange={(e) => updateMember(member.id, "dateOfBirth", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor={`member-${member.id}-rel`}>
                  Lien avec l&apos;étudiant(e)
                </label>
                <select
                  id={`member-${member.id}-rel`}
                  className={inputClass}
                  value={member.relationship}
                  onChange={(e) =>
                    updateMember(member.id, "relationship", e.target.value as Relationship | "")
                  }
                >
                  <option value="">Sélectionner…</option>
                  {RELATIONSHIP_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className={labelClass} htmlFor={`member-${member.id}-sit`}>
                  Situation
                </label>
                <select
                  id={`member-${member.id}-sit`}
                  className={inputClass}
                  value={member.situation}
                  onChange={(e) =>
                    updateMember(member.id, "situation", e.target.value as Situation | "")
                  }
                >
                  <option value="">Sélectionner…</option>
                  {SITUATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className={`${btnSecondaryClass} self-start`} onClick={onAdd}>
        Ajouter un membre
      </button>
    </section>
  );
}

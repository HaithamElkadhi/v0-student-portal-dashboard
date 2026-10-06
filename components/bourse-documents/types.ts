export const RELATIONSHIP_OPTIONS = [
  "Étudiant(e)",
  "Père",
  "Mère",
  "Frère",
  "Sœur",
  "Tuteur légal",
  "Autre",
] as const;

export const SITUATION_OPTIONS = [
  "Salarié(e)",
  "Fonctionnaire",
  "Indépendant",
  "Retraité(e)",
  "Sans emploi",
  "Étudiant(e)",
  "Autre",
] as const;

export type Relationship = (typeof RELATIONSHIP_OPTIONS)[number];
export type Situation = (typeof SITUATION_OPTIONS)[number];

export type UploadZoneKey =
  | "birthCertificates"
  | "familyBooklet"
  | "propertyDocs"
  | "nonPropertyDocs"
  | "balanceAttestation"
  | "taxDeclarations"
  | "otherDocuments";

export interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  relationship: Relationship | "";
  situation: Situation | "";
}

export interface IdentityData {
  firstName: string;
  lastName: string;
  email: string;
}

export interface DocumentsBourseFormData {
  identity: IdentityData;
  familyMembers: FamilyMember[];
  files: Record<UploadZoneKey, File[]>;
}

export function createEmptyMember(): FamilyMember {
  return {
    id: crypto.randomUUID(),
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    relationship: "",
    situation: "",
  };
}

export const initialFormData: DocumentsBourseFormData = {
  identity: {
    firstName: "",
    lastName: "",
    email: "",
  },
  familyMembers: [],
  files: {
    birthCertificates: [],
    familyBooklet: [],
    propertyDocs: [],
    nonPropertyDocs: [],
    balanceAttestation: [],
    taxDeclarations: [],
    otherDocuments: [],
  },
};

export function formatHouseholdMembersText(
  members: FamilyMember[],
  identity?: { firstName: string; lastName: string; email: string }
): string {
  const blocks: string[] = [];

  if (identity) {
    const name = `${identity.firstName.trim()} ${identity.lastName.trim()}`.trim();
    const email = identity.email.trim();
    if (name || email) {
      blocks.push(
        `Étudiant(e) : ${name || "—"}${email ? `\nE-mail : ${email}` : ""}`
      );
    }
  }

  if (members.length > 0) {
    blocks.push(
      members
        .map((m, index) => {
          const name = `${m.firstName.trim()} ${m.lastName.trim()}`.trim() || "—";
          const dob = m.dateOfBirth || "—";
          const relationship = m.relationship || "—";
          const situation = m.situation || "—";
          return `${index + 1}. ${name}\n   Date de naissance : ${dob}\n   Lien : ${relationship}\n   Situation : ${situation}`;
        })
        .join("\n\n")
    );
  }

  return blocks.join("\n\n");
}

export function countAllFiles(files: Record<UploadZoneKey, File[]>): number {
  return (Object.keys(files) as UploadZoneKey[]).reduce(
    (sum, key) => sum + files[key].length,
    0
  );
}

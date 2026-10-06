import jsPDF from "jspdf";
import { buildDocList, type DocDef } from "./buildDocList";
import { DIPLOMA_LEVEL_OPTIONS } from "./options";
import type { AdmissionFormData, DiplomaLevel } from "./types";

const LEFT = 16;
const RIGHT = 194;
const CONTENT_W = RIGHT - LEFT;
const COLORS = {
  ink: [24, 39, 58] as [number, number, number],
  muted: [103, 117, 135] as [number, number, number],
  faint: [145, 158, 174] as [number, number, number],
  line: [222, 229, 236] as [number, number, number],
  pale: [246, 248, 251] as [number, number, number],
  blue: [37, 99, 235] as [number, number, number],
  bluePale: [239, 246, 255] as [number, number, number],
  green: [21, 128, 61] as [number, number, number],
  greenPale: [240, 253, 244] as [number, number, number],
  purple: [126, 34, 206] as [number, number, number],
  purplePale: [250, 245, 255] as [number, number, number],
  amber: [180, 83, 9] as [number, number, number],
  amberPale: [255, 251, 235] as [number, number, number],
};

type DocCategory = "general" | "academic" | "experience";

function diplomaLabel(level: DiplomaLevel): string {
  return DIPLOMA_LEVEL_OPTIONS.find((option) => option.value === level)?.label || level || "—";
}

function orDash(value: string): string {
  return value?.trim() || "—";
}

function setText(doc: jsPDF, color: [number, number, number], size: number, bold = false) {
  doc.setTextColor(...color);
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setFontSize(size);
}

function wrapped(doc: jsPDF, text: string, width: number, size: number): string[] {
  doc.setFontSize(size);
  return doc.splitTextToSize(text, width) as string[];
}

function drawHeader(doc: jsPDF, title: string, subtitle: string) {
  setText(doc, COLORS.ink, 18, true);
  doc.text("Jee", LEFT, 19);
  const jeeWidth = doc.getTextWidth("Jee");
  setText(doc, COLORS.blue, 18, true);
  doc.text("expert", LEFT + jeeWidth, 19);

  setText(doc, COLORS.muted, 8.5);
  doc.text("Votre avenir, notre expertise", LEFT, 25);
  setText(doc, COLORS.ink, 12, true);
  doc.text(title, RIGHT, 18, { align: "right" });
  setText(doc, COLORS.muted, 8);
  doc.text(subtitle, RIGHT, 24, { align: "right" });
  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.5);
  doc.line(LEFT, 31, RIGHT, 31);
}

function drawFooter(doc: jsPDF, page: number, total: number) {
  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.4);
  doc.line(LEFT, 282, RIGHT, 282);
  setText(doc, COLORS.muted, 8, true);
  doc.text("Jeeexpert  •  Dossier d'admission Italie", LEFT, 288);
  setText(doc, COLORS.muted, 8);
  doc.text(`Page ${page} / ${total}`, RIGHT, 288, { align: "right" });
}

function drawSectionTitle(doc: jsPDF, title: string, y: number): number {
  setText(doc, COLORS.muted, 8, true);
  doc.text(title.toLocaleUpperCase("fr-FR"), LEFT, y);
  const labelW = doc.getTextWidth(title.toLocaleUpperCase("fr-FR")) + 4;
  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.4);
  doc.line(LEFT + labelW, y - 1, RIGHT, y - 1);
  return y + 6;
}

function drawProfile(doc: jsPDF, data: AdmissionFormData, y: number): number {
  const { profile, academic } = data;
  const fields: [string, string][] = [
    ["Prénom", orDash(profile.firstName)],
    ["Nom", orDash(profile.lastName)],
    ["E-mail", orDash(profile.email)],
    ["Téléphone", orDash(profile.phone)],
    ["Programme visé", orDash(profile.programType)],
    ["Dernier diplôme", diplomaLabel(academic.diplomaLevel)],
  ];
  if (academic.fieldOfStudy) fields.push(["Nom du diplôme", academic.fieldOfStudy]);
  if (academic.scoreValue) fields.push(["Moyenne / 20", academic.scoreValue]);
  if (academic.yearObtained) fields.push(["Année d'obtention", academic.yearObtained]);

  const cols = 3;
  const gap = 5;
  const cellW = (CONTENT_W - gap * (cols - 1)) / cols;
  const rows = Math.ceil(fields.length / cols);
  const rowH = 15;
  const boxH = rows * rowH + 8;
  doc.setFillColor(...COLORS.pale);
  doc.setDrawColor(...COLORS.line);
  doc.roundedRect(LEFT, y, CONTENT_W, boxH, 2, 2, "FD");

  fields.forEach(([label, value], index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = LEFT + 5 + col * (cellW + gap);
    const top = y + 7 + row * rowH;
    setText(doc, COLORS.faint, 6.5, true);
    doc.text(label.toLocaleUpperCase("fr-FR"), x, top);
    setText(doc, COLORS.ink, 8.5, true);
    const lines = wrapped(doc, value, cellW - 2, 8.5).slice(0, 2);
    doc.text(lines, x, top + 5);
  });
  return y + boxH + 7;
}

function categoryStyle(category: DocCategory) {
  if (category === "academic") return { label: "Académique", color: COLORS.green, pale: COLORS.greenPale };
  if (category === "experience") return { label: "Expérience / Gap", color: COLORS.purple, pale: COLORS.purplePale };
  return { label: "Général", color: COLORS.blue, pale: COLORS.bluePale };
}

function drawCategory(doc: jsPDF, title: string, docs: DocDef[], y: number): number {
  if (!docs.length) return y;
  const style = categoryStyle(title as DocCategory);
  setText(doc, style.color, 8, true);
  const pillW = doc.getTextWidth(style.label) + 8;
  doc.setFillColor(...style.pale);
  doc.roundedRect(LEFT, y - 4.5, pillW, 7, 3.5, 3.5, "F");
  doc.text(style.label, LEFT + 4, y);
  y += 5;

  const gap = 4;
  const colW = (CONTENT_W - gap) / 2;
  const rowH = 9.5;
  for (let i = 0; i < docs.length; i += 2) {
    const rowDocs = [docs[i], docs[i + 1]].filter(Boolean);
    const heights = rowDocs.map((item) => Math.max(1, wrapped(doc, item.name, colW - (item.lessUrgent ? 36 : 13), 8.2).length));
    const height = Math.max(rowH, ...heights.map((n) => Math.max(n * 4 + 5, itemChipHeight(rowDocs[0], rowDocs[1]))));
    rowDocs.forEach((item, column) => {
      const x = LEFT + column * (colW + gap);
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...COLORS.line);
      doc.roundedRect(x, y, colW, height - 1, 1.5, 1.5, "FD");
      doc.setDrawColor(...COLORS.faint);
      doc.setLineWidth(0.4);
      doc.roundedRect(x + 2.5, y + 2.1, 3.2, 3.2, 0.5, 0.5, "S");
      setText(doc, COLORS.ink, 8.2);
      doc.text(wrapped(doc, item.name, colW - (item.lessUrgent ? 36 : 13), 8.2), x + 8, y + 5.5);
      if (item.lessUrgent) {
        doc.setFillColor(...COLORS.amberPale);
        doc.setDrawColor(253, 230, 138);
        doc.roundedRect(x + colW - 25, y + 1.3, 23, 5, 2.5, 2.5, "FD");
        setText(doc, COLORS.amber, 5.2, true);
        doc.text("Moins urgent", x + colW - 13.5, y + 4.7, { align: "center" });
      }
    });
    y += height + 1.5;
  }
  return y + 2;
}

function itemChipHeight(first: DocDef, second?: DocDef): number {
  return first.lessUrgent || second?.lessUrgent ? 8 : 0;
}

function drawNotes(doc: jsPDF, y: number): number {
  const notes = [
    "Documents académiques (sauf Plan d'études) : authentification, apostille et traduction assermentée en italien requises.",
    "Plan d'études : traduction libre suffisante ; ni apostille ni légalisation nécessaire.",
    "Les documents marqués « Moins urgent » peuvent être envoyés séparément plus tard.",
  ];
  const textX = LEFT + 8;
  const textW = CONTENT_W - 14;
  const lines = notes.flatMap((note) => wrapped(doc, note, textW, 8));
  const boxH = 10 + lines.length * 4.2;
  doc.setFillColor(...COLORS.amberPale);
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(LEFT, y, CONTENT_W, boxH, 2, 2, "FD");
  doc.setFillColor(...COLORS.amber);
  doc.roundedRect(LEFT, y, 1.5, boxH, 0.7, 0.7, "F");
  setText(doc, COLORS.amber, 8, true);
  doc.text("À RETENIR", textX, y + 5.5);
  let lineY = y + 10;
  notes.forEach((note) => {
    const noteLines = wrapped(doc, note, textW - 4, 8);
    doc.setFillColor(...COLORS.amber);
    doc.circle(textX + 0.8, lineY - 0.8, 0.55, "F");
    setText(doc, [120, 53, 15], 8);
    doc.text(noteLines, textX + 3, lineY);
    lineY += noteLines.length * 4.2 + 1.2;
  });
  return y + boxH;
}

function drawChecklistPages(doc: jsPDF, data: AdmissionFormData, generatedDate: string): void {
  const { profile, academic } = data;
  const docList = buildDocList(
    academic.diplomaLevel,
    academic.hasGap && academic.gapYears > 0,
    academic.gapDocTypes,
    academic.gapOtherDocLabel,
    academic.studyLanguage,
  );
  const groups: [DocCategory, DocDef[]][] = [
    ["general", docList.filter((item) => item.category === "general")],
    ["academic", docList.filter((item) => item.category === "academic")],
    ["experience", docList.filter((item) => item.category === "experience")],
  ];
  let page = 1;
  const startPage = () => {
    if (page > 1) doc.addPage();
    drawHeader(doc, "Dossier d'admission — Italie", `Généré le ${generatedDate}`);
    let y = drawSectionTitle(doc, "Profil candidat", 40);
    y = drawProfile(doc, { ...data, profile }, y);
    return y;
  };
  let y = startPage();
  y = drawSectionTitle(doc, "Documents à préparer", y + 1);

  for (const [category, items] of groups) {
    if (!items.length) continue;
    const estimated = 11 + Math.ceil(items.length / 2) * 12;
    if (y + estimated > 260) {
      page += 1;
      doc.addPage();
      drawHeader(doc, "Dossier d'admission — Italie", `${profile.firstName} ${profile.lastName}`.trim());
      y = 43;
      setText(doc, COLORS.muted, 8, true);
      doc.text("SUITE — DOCUMENTS À PRÉPARER", LEFT, y);
      y += 7;
    }
    y = drawCategory(doc, category, items, y);
  }

  if (y + 42 > 274) {
    page += 1;
    doc.addPage();
    drawHeader(doc, "Dossier d'admission — Italie", `${profile.firstName} ${profile.lastName}`.trim());
    y = 43;
  }
  drawNotes(doc, y + 1);
}

function drawGuide(doc: jsPDF, generatedDate: string) {
  doc.addPage();
  drawHeader(doc, "Guide de légalisation", `Généré le ${generatedDate} · Procédure en Tunisie`);

  setText(doc, COLORS.ink, 16, true);
  doc.text("Préparez vos documents", LEFT, 46);
  setText(doc, COLORS.muted, 9);
  doc.text("Suivez ces étapes dans l'ordre. Les exigences peuvent varier selon l'établissement.", LEFT, 53);

  const steps = [
    {
      title: "Authentifier le diplôme",
      body: "Présentez chaque document à l'autorité compétente :",
      bullets: [
        "Baccalauréat : Ministère de l'Éducation",
        "Licence, Master, Doctorat : Ministère de l'Enseignement Supérieur (Rectorat)",
        "BTP, BTS : Ministère de l'Emploi et de la Formation Professionnelle",
        "Diplômes de santé : Ministère de la Santé",
        "Université privée : décision d'équivalence du Ministère de l'Enseignement Supérieur",
      ],
    },
    {
      title: "Faire des copies conformes (Moussad9a)",
      bullets: ["Photocopiez chaque document original, recto et verso.", "Faites certifier chaque copie conforme auprès de la municipalité locale."],
    },
    {
      title: "Faire apostiller les documents",
      bullets: ["Déposez les originaux et les copies conformes chez un notaire.", "Demandez l'apostille sur les documents originaux et les copies conformes."],
    },
    {
      title: "Faire traduire en italien",
      bullets: ["Confiez les documents à un traducteur assermenté agréé par l'Ambassade d'Italie.", "Vérifiez que le nom et le prénom correspondent exactement au passeport."],
      tip: "La liste des traducteurs agréés est disponible auprès de l'Ambassade d'Italie.",
    },
    {
      title: "Faire apostiller la traduction",
      bullets: ["Retournez chez le notaire avec la traduction signée.", "Demandez l'apostille de la signature du traducteur assermenté."],
    },
  ];

  let y = 62;
  for (let index = 0; index < steps.length; index += 1) {
    const step = steps[index];
    const xText = LEFT + 13;
    const textW = CONTENT_W - 15;
    const content: { text: string; color: [number, number, number]; bold?: boolean }[] = [];
    if (step.body) content.push({ text: step.body, color: COLORS.muted });
    for (const bullet of step.bullets) content.push({ text: `•  ${bullet}`, color: COLORS.ink });
    if (step.tip) content.push({ text: `Conseil : ${step.tip}`, color: COLORS.blue });
    const contentLines = content.reduce((sum, item) => sum + wrapped(doc, item.text, textW, 8.5).length, 0);
    const cardH = 13 + contentLines * 4.4 + (step.tip ? 1 : 0);

    doc.setFillColor(...(index % 2 === 0 ? COLORS.ink : COLORS.blue));
    doc.circle(LEFT + 4, y + 2, 4, "F");
    setText(doc, [255, 255, 255], 9, true);
    doc.text(String(index + 1), LEFT + 4, y + 3, { align: "center" });
    setText(doc, COLORS.ink, 10, true);
    doc.text(step.title, xText, y + 3);
    doc.setFillColor(...COLORS.pale);
    doc.setDrawColor(...COLORS.line);
    doc.roundedRect(xText, y + 6, textW, cardH, 2, 2, "FD");

    let textY = y + 12;
    for (const item of content) {
      const lines = wrapped(doc, item.text, textW - 10, 8.5);
      setText(doc, item.color, 8.5, item.bold ?? false);
      doc.text(lines, xText + 5, textY);
      textY += lines.length * 4.4 + 1;
    }
    y += cardH + 12;
  }
}

export async function downloadAdmissionPdf(data: AdmissionFormData): Promise<void> {
  const date = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
  drawChecklistPages(pdf, data, date);
  drawGuide(pdf, date);

  const totalPages = pdf.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    pdf.setPage(page);
    drawFooter(pdf, page, totalPages);
  }
  pdf.save("dossier-admission-italie.pdf");
}

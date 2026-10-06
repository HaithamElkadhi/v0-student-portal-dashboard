interface Props {
  docsUploaded: number;
  totalDocsExpected: number;
}

export default function SuccessScreen({ docsUploaded, totalDocsExpected }: Props) {
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600/15 text-emerald-600">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
          <path
            d="M7 17L13 23L25 9"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900">Dossier envoyé</h2>
      <p className="max-w-sm text-gray-600">
        {docsUploaded}/{totalDocsExpected} documents téléversés.
        <br />
        Notre équipe examinera votre dossier.
      </p>
    </div>
  );
}

"use client";

const STEPS = [
  { n: 1, label: "Personnel" },
  { n: 2, label: "Académique" },
  { n: 3, label: "Documents" },
  { n: 4, label: "Envoi" },
] as const;

export default function StepBar({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <nav aria-label="Étapes du formulaire" className="flex items-center gap-2">
      {STEPS.map((s, i) => {
        const done   = current > s.n;
        const active = current === s.n;
        return (
          <div key={s.n} className="flex flex-1 items-center gap-2">
            <div className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  done
                    ? "bg-[#217A50] text-white"
                    : active
                      ? "bg-[var(--jx-night)] text-white"
                      : "bg-gray-200 text-gray-400"
                }`}
              >
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeWidth="2.2"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : s.n}
              </div>
              <span className={`text-xs font-medium ${
                active ? "text-[var(--jx-night)]" : done ? "text-[#217A50]" : "text-gray-400"
              }`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mb-5 h-0.5 flex-1 rounded-full transition-colors ${
                  done ? "bg-[#217A50]" : "bg-gray-200"
                }`}
                aria-hidden
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

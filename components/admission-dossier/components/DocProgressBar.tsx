"use client";

export default function DocProgressBar({ uploaded, total }: { uploaded: number; total: number }) {
  const percent = total === 0 ? 0 : (uploaded / total) * 100;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-2xl font-semibold text-gray-900">
        {uploaded}{" "}
        <span className="text-gray-400">/ {total} documents</span>
      </p>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-emerald-600 transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

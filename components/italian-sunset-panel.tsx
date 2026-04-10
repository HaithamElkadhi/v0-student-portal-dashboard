"use client"

import type { ReactNode } from "react"

type Variant = "full" | "banner"

function Star({ cx, cy, r, dur, begin }: { cx: number; cy: number; r: number; dur: string; begin: string }) {
  return (
    <circle cx={cx} cy={cy} r={r} fill="#ffffff">
      <animate attributeName="opacity" values="0.2;1;0.2" dur={dur} begin={begin} repeatCount="indefinite" />
    </circle>
  )
}

function BuildingWindows({
  x,
  y,
  cols,
  rows,
  cellW,
  cellH,
  gap,
}: {
  x: number
  y: number
  cols: number
  rows: number
  cellW: number
  cellH: number
  gap: number
}) {
  const els: ReactNode[] = []
  let i = 0
  const opacities = [0.35, 0.55, 0.45, 0.65, 0.4, 0.5, 0.7, 0.32]
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const fill = i % 3 === 0 ? "#f5c87a" : "#e8893a"
      els.push(
        <rect
          key={i}
          x={x + col * (cellW + gap)}
          y={y + row * (cellH + gap)}
          width={cellW}
          height={cellH}
          fill={fill}
          opacity={opacities[i % opacities.length]}
        />,
      )
      i++
    }
  }
  return <g>{els}</g>
}

export function ItalianSunsetPanel({ variant }: { variant: Variant }) {
  if (variant === "banner") {
    return (
      <div
        className="jx-left-panel-enter relative h-[100px] w-full shrink-0 overflow-hidden md:hidden"
        style={{
          background:
            "linear-gradient(180deg, #0d0520 0%, #1c1240 28%, #3d1f6b 52%, #c4612f 78%, #e8893a 88%, #f5c87a 100%)",
        }}
      >
        <div
          className="jx-shimmer-sun pointer-events-none absolute left-1/2 top-[42%] size-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f5c87a]"
          aria-hidden
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 pt-1">
          <p className="text-xl font-medium tracking-[0.06em] text-white">JEEXPERT</p>
          <div className="flex gap-1">
            <span className="h-1 w-7 rounded-sm bg-[#009246]" />
            <span className="h-1 w-7 rounded-sm bg-white" />
            <span className="h-1 w-7 rounded-sm bg-[#ce2b37]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="jx-left-panel-enter relative hidden min-h-0 w-full flex-1 overflow-hidden md:flex"
      style={{
        background:
          "linear-gradient(180deg, #0d0520 0%, #1c1240 30%, #3d1f6b 55%, #c4612f 75%, #e8893a 88%, #f5c87a 100%)",
      }}
    >
      <svg
        className="pointer-events-none absolute inset-x-0 top-0 h-[25%] w-full"
        viewBox="0 0 520 120"
        preserveAspectRatio="xMidYMin slice"
      >
        <Star cx={40} cy={24} r={1.5} dur="2.4s" begin="0s" />
        <Star cx={120} cy={18} r={1} dur="3.1s" begin="0.3s" />
        <Star cx={200} cy={32} r={2} dur="2.1s" begin="0.8s" />
        <Star cx={280} cy={14} r={1} dur="3.8s" begin="0.1s" />
        <Star cx={360} cy={28} r={1.5} dur="2.7s" begin="1.1s" />
        <Star cx={440} cy={20} r={1} dur="4s" begin="0.5s" />
        <Star cx={480} cy={36} r={2} dur="2.9s" begin="1.4s" />
        <Star cx={90} cy={44} r={1} dur="3.3s" begin="0.2s" />
        <Star cx={320} cy={48} r={1.5} dur="2.5s" begin="0.9s" />
      </svg>

      <div
        className="jx-shimmer-sun pointer-events-none absolute left-1/2 top-[38%] size-[130px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(245,200,122,0.18)]"
        aria-hidden
      />
      <div
        className="jx-shimmer-sun pointer-events-none absolute left-1/2 top-[38%] size-[70px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f5c87a]"
        aria-hidden
      />

      <div
        className="jx-float-cloud pointer-events-none absolute left-[8%] top-[18%] h-[22px] w-[90px] rounded-[40px] bg-[rgba(255,220,160,0.18)]"
        style={{ animationDelay: "0s" }}
        aria-hidden
      />
      <div
        className="jx-float-cloud pointer-events-none absolute left-[52%] top-[22%] h-4 w-[60px] rounded-[40px] bg-[rgba(255,220,160,0.18)]"
        style={{ animationDelay: "0.6s" }}
        aria-hidden
      />
      <div
        className="jx-float-cloud pointer-events-none absolute left-[32%] top-[28%] h-3 w-11 rounded-[40px] bg-[rgba(255,220,160,0.18)]"
        style={{ animationDelay: "1.2s" }}
        aria-hidden
      />

      <svg
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-[min(52%,320px)] w-full"
        viewBox="0 0 520 280"
        preserveAspectRatio="xMidYMax meet"
      >
        <g>
          <rect x="4" y="118" width="36" height="64" fill="#1e1540" />
          <rect x="14" y="132" width="8" height="18" fill="#0d0520" opacity="0.65" />
          <BuildingWindows x={10} y={124} cols={2} rows={2} cellW={6} cellH={5} gap={4} />

          <rect x="38" y="92" width="42" height="90" fill="#241848" />
          <rect x="52" y="108" width="10" height="28" fill="#0d0520" opacity="0.6" />
          <BuildingWindows x={44} y={98} cols={3} rows={3} cellW={5} cellH={5} gap={3} />
          <polygon points="59,92 59,78 72,86 85,78 85,92" fill="#3d2a6e" />

          <rect x="78" y="104" width="34" height="78" fill="#2d1f55" />
          <rect x="88" y="124" width="8" height="22" fill="#0d0520" opacity="0.55" />
          <BuildingWindows x={82} y={110} cols={2} rows={3} cellW={6} cellH={5} gap={4} />

          <rect x="110" y="72" width="28" height="110" fill="#1e1540" />
          <rect x="120" y="96" width="6" height="86" fill="#0d0520" opacity="0.5" />
          <BuildingWindows x={114} y={78} cols={2} rows={5} cellW={5} cellH={6} gap={3} />
          <rect x="123" y="66" width="4" height="8" fill="#c4612f" />

          <rect x="136" y="100" width="48" height="82" fill="#3d2a6e" />
          <rect x="152" y="118" width="12" height="32" fill="#0d0520" opacity="0.55" />
          <BuildingWindows x={142} y={106} cols={4} rows={3} cellW={5} cellH={5} gap={3} />

          <rect x="182" y="88" width="38" height="94" fill="#241848" />
          <polygon points="201,88 201,70 212,78 223,70 223,88" fill="#554090" />
          <rect x="196" y="108" width="8" height="24" fill="#0d0520" opacity="0.6" />
          <BuildingWindows x={188} y={94} cols={3} rows={4} cellW={5} cellH={5} gap={3} />

          <rect x="218" y="62" width="32" height="120" fill="#2d1f55" />
          <rect x="228" y="82" width="8" height="100" fill="#0d0520" opacity="0.45" />
          <BuildingWindows x={222} y={68} cols={2} rows={6} cellW={6} cellH={6} gap={4} />

          <rect x="248" y="96" width="44" height="86" fill="#4a3480" />
          <rect x="262" y="118" width="12" height="30" fill="#0d0520" opacity="0.55" />
          <BuildingWindows x={254} y={102} cols={3} rows={3} cellW={6} cellH={6} gap={4} />

          <rect x="288" y="110" width="36" height="72" fill="#1e1540" />
          <rect x="300" y="128" width="8" height="20" fill="#0d0520" opacity="0.6" />
          <BuildingWindows x={294} y={116} cols={2} rows={2} cellW={7} cellH={6} gap={4} />

          <rect x="322" y="84" width="40" height="98" fill="#3d2a6e" />
          <rect x="334" y="104" width="10" height="36" fill="#0d0520" opacity="0.55" />
          <BuildingWindows x={328} y={90} cols={3} rows={4} cellW={5} cellH={5} gap={3} />
          <polygon points="342,84 342,72 352,78 362,72 362,84" fill="#554090" />

          <rect x="360" y="100" width="50" height="82" fill="#241848" />
          <rect x="376" y="122" width="12" height="28" fill="#0d0520" opacity="0.55" />
          <BuildingWindows x={368} y={108} cols={4} rows={3} cellW={5} cellH={5} gap={2} />

          <rect x="408" y="76" width="36" height="106" fill="#2d1f55" />
          <rect x="418" y="96" width="10" height="86" fill="#0d0520" opacity="0.5" />
          <BuildingWindows x={412} y={82} cols={2} rows={5} cellW={6} cellH={6} gap={4} />

          <rect x="442" y="112" width="74" height="70" fill="#1e1540" />
          <rect x="468" y="132" width="14" height="24" fill="#0d0520" opacity="0.55" />
          <BuildingWindows x={450} y={118} cols={5} rows={2} cellW={5} cellH={5} gap={3} />
        </g>

        <rect x="0" y="218" width="520" height="62" fill="#1a3a6b" opacity="0.85" />
        <ellipse cx="140" cy="222" rx="48" ry="10" fill="#f5c87a" opacity="0.12" />
        <ellipse cx="268" cy="224" rx="72" ry="12" fill="#e8893a" opacity="0.1" />
        <ellipse cx="400" cy="223" rx="56" ry="9" fill="#f5c87a" opacity="0.11" />
        <rect x="0" y="228" width="520" height="2.5" fill="#f5c87a" className="jx-water-shimmer" />
      </svg>

      <div className="pointer-events-none absolute bottom-[72px] left-1/2 z-10 w-full max-w-md -translate-x-1/2 px-6 text-center md:bottom-20">
        <p className="text-[28px] font-medium tracking-[0.06em] text-white">JEEXPERT</p>
        <p className="mt-2 text-[13px] font-normal tracking-[0.04em] text-white/60">La tua porta verso l&apos;Italia</p>
        <div className="mt-3 flex justify-center gap-1">
          <span className="h-1 w-7 rounded-sm bg-[#009246]" />
          <span className="h-1 w-7 rounded-sm bg-white" />
          <span className="h-1 w-7 rounded-sm bg-[#ce2b37]" />
        </div>
      </div>
    </div>
  )
}

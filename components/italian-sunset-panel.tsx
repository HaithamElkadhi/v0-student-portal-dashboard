"use client"

import { useState } from "react"
import { Pause, Play } from "lucide-react"
import styles from "./italian-sunset-panel.module.css"

function Rome() {
  return <svg viewBox="0 0 560 620" preserveAspectRatio="xMidYMid slice" className={styles.landscape}>
    <defs><linearGradient id="rome-sky" x2="0" y2="1"><stop stopColor="#20133d" /><stop offset=".48" stopColor="#875166" /><stop offset="1" stopColor="#ecad6c" /></linearGradient></defs>
    <rect width="560" height="620" fill="url(#rome-sky)" />
    <circle cx="401" cy="264" r="65" fill="#f9bd78" opacity=".22" />
    <circle cx="401" cy="264" r="45" fill="#ffcf8a" />
    <path d="M0 365Q90 328 180 371T355 362T560 360V620H0Z" fill="#623b58" />
    <path d="M0 440h76v-38h29v-18h33v88h266v-58h28v-18h55v26h73v198H0Z" fill="#4a304c" />
    <path d="M92 461v-97q0-24 24-29l225-31 46 10v38l51 9v100Z" fill="#4a2d46" />
    <path d="M92 461v-97q0-24 24-29l225-31v157Z" fill="#a36357" />
    <path d="M101 347l239-35M94 374l247-24M93 411l247-17" stroke="#e59c6b" strokeWidth="4" opacity=".75" />
    {[0, 1, 2].map(row => <g key={row} fill={row === 2 ? "#2d2039" : "#633b4c"}>
      {Array.from({ length: 9 }, (_, col) => {
        const x = 110 + col * 25
        const y = 380 + row * 33 - col * (row === 2 ? 0 : 2)
        return <path key={col} d={`M${x} ${y}v-11a7 7 0 0 1 14 0v11Z`} />
      })}
    </g>)}
    <path d="M341 304l46 10v38l51 9v100h-97Z" fill="#724353" />
    <path d="M358 446v-27a9 9 0 0 1 18 0v27m15 0v-25a9 9 0 0 1 18 0v25" fill="#36243d" />
    <path d="M0 468Q160 450 292 467T560 466V620H0Z" fill="#2d243e" />
  </svg>
}

function Tuscany() {
  return <svg viewBox="0 0 560 620" preserveAspectRatio="xMidYMid slice" className={styles.landscape}>
    <defs><linearGradient id="tuscany-sky" x2="0" y2="1"><stop stopColor="#223f55" /><stop offset=".52" stopColor="#819584" /><stop offset="1" stopColor="#f5c781" /></linearGradient></defs>
    <rect width="560" height="620" fill="url(#tuscany-sky)" />
    <circle cx="375" cy="250" r="48" fill="#ffe1a4" />
    <path className={styles.cloud} d="M54 225c17-8 23-2 35-8 15-8 25-3 36 8h27a5 5 0 0 1 0 10H58a6 6 0 0 1-4-10Z" fill="#fff2cb" opacity=".44" />
    <path d="M0 353Q90 306 209 345T418 327T560 338V620H0Z" fill="#647867" />
    <path d="M0 394Q104 337 220 383T424 363T560 383V620H0Z" fill="#818956" />
    <path d="M0 437Q143 368 282 419T560 415V620H0Z" fill="#b5a66a" />
    <path d="M0 468Q124 413 283 460T560 445V620H0Z" fill="#556346" />
    <path d="M0 495q126-70 258-34t302 10v149H0Z" fill="#354c40" />
    <path d="M164 500q123-82 268-69-135 6-226 69Z" fill="#e8c183" opacity=".68" />
    <path d="M350 379h57v36h-57Z" fill="#e7bb84" /><path d="m343 380 36-24 37 24Z" fill="#8d4c3d" />
    <path d="M367 390h8v10h-8zm16 0h8v10h-8zm-7 16h11v10h-11Z" fill="#694938" />
    {[{ x: 321, y: 416, s: 1 }, { x: 338, y: 417, s: .82 }, { x: 422, y: 421, s: 1.1 }, { x: 442, y: 426, s: .85 }, { x: 153, y: 455, s: 1.3 }, { x: 131, y: 460, s: .95 }].map(({ x, y, s }) => (
      <g key={x} transform={`translate(${x} ${y}) scale(${s})`} fill="#2d493d">
        <path d="M-2 0v-16C-13-20-8-52 0-61c9 10 14 42 2 45V0Z" />
      </g>
    ))}
  </svg>
}

function Venice() {
  return <svg viewBox="0 0 560 620" preserveAspectRatio="xMidYMid slice" className={styles.landscape}>
    <defs><linearGradient id="venice-sky" x2="0" y2="1"><stop stopColor="#132d50" /><stop offset=".56" stopColor="#6e849a" /><stop offset="1" stopColor="#e3b392" /></linearGradient></defs>
    <rect width="560" height="620" fill="url(#venice-sky)" />
    <circle cx="122" cy="236" r="37" fill="#f8deb1" />
    <path d="M0 414h560v206H0Z" fill="#30596e" />
    {[{ x: 0, y: 329, w: 76, color: "#bd826e" }, { x: 76, y: 307, w: 63, color: "#d1a784" }, { x: 139, y: 345, w: 68, color: "#996d6d" }, { x: 384, y: 336, w: 62, color: "#bc8e7c" }, { x: 446, y: 307, w: 71, color: "#cfab87" }, { x: 517, y: 328, w: 43, color: "#a86f66" }].map(({ x, y, w, color }) => <g key={x}>
      <path d={`M${x} ${y}h${w}V424H${x}Z`} fill={color} />
      <path d={`M${x - 3} ${y}l${w / 2 + 3} -15 ${w / 2 + 3} 15Z`} fill="#654c61" />
      {[0, 1].map(row => <g key={row}>{[0, 1].map(col => <path key={col} className={styles.window} d={`M${x + 12 + col * 18} ${y + 34 + row * 29}v-10a5 5 0 0 1 10 0v10Z`} fill="#ffe1a3" />)}</g>)}
    </g>)}
    <path d="M203 402l37-40h102l47 40v23h-38c-18-56-92-56-111 0h-37Z" fill="#ead4ac" />
    <path d="M206 402l35-38h100l45 38M220 397h150" fill="none" stroke="#b99480" strokeWidth="4" />
    <path className={styles.reflections} d="M25 438h68m14 15h58m267-14h68m-151 30h103M30 479h102m40 19h60m143 9h90" fill="none" stroke="#f6c491" strokeWidth="3" strokeLinecap="round" />
    <g className={styles.gondola} fill="#182f49">
      <path d="M166 476q21 9 93 2l18-13-8 18q-8 12-65 8-22 0-38-15Z" />
      <circle cx="244" cy="452" r="5" /><path d="m238 460 10-1 3 20h-16Z" />
      <path d="m248 464 35 29" fill="none" stroke="#182f49" strokeWidth="3" strokeLinecap="round" />
    </g>
  </svg>
}

const stops = [
  { name: "Roma", detail: "Le Colisée", scene: Rome, className: styles.rome },
  { name: "Toscana", detail: "Les collines et les cyprès", scene: Tuscany, className: styles.tuscany },
  { name: "Venezia", detail: "Le Grand Canal", scene: Venice, className: styles.venice },
]

export function ItalianSunsetPanel({ variant }: { variant: "full" | "banner" }) {
  const [paused, setPaused] = useState(false)

  if (variant === "banner") {
    return <div className={styles.banner + " relative h-[100px] w-full shrink-0 overflow-hidden md:hidden"} aria-hidden="true">
      <span className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f5c87a]" />
      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1">
        <span className="h-1 w-7 rounded-sm bg-[#009246]" /><span className="h-1 w-7 rounded-sm bg-white" /><span className="h-1 w-7 rounded-sm bg-[#ce2b37]" />
      </div>
    </div>
  }

  return <aside className={styles.journey + " relative hidden min-w-0 flex-1 overflow-hidden md:block"} data-paused={paused} aria-label="Voyage illustré en Italie">
    <div aria-hidden="true">
      {stops.map(({ name, detail, scene: Scene, className }) => <div key={name} className={styles.scene + " " + className}>
        <Scene />
        <div className="absolute left-7 top-8 text-white lg:left-10">
          <p className="text-3xl font-semibold tracking-tight" lang="it">{name}</p>
          <p className="mt-1 text-sm text-white/90">{detail}</p>
        </div>
      </div>)}
      <div className={styles.rail}>
        <svg className={styles.train} viewBox="0 0 260 40">
          <path d="M4 27V12a7 7 0 0 1 7-7h175c24 0 46 7 64 20a4 4 0 0 1-2 7H9a5 5 0 0 1-5-5Z" fill="#f7eadc" />
          <path d="M5 25h243l3 4-3 3H9a5 5 0 0 1-4-3Z" fill="#cb6258" />
          <path d="M10 12h27v9H10zm34 0h27v9H44zm35 0h27v9H79zm34 0h27v9h-27zm35 0h27v9h-27zm35 0h12q18 2 33 9h-45Z" fill="#466781" />
          <path d="M76 6v25m71-25v25" stroke="#b8aead" strokeWidth="2" />
          <path d="M17 33h20v4H17zm54 0h20v4H71zm96 0h20v4h-20zm49 0h20v4h-20Z" fill="#14223b" />
        </svg>
      </div>
    </div>

    <button type="button" onClick={() => setPaused(value => !value)} aria-label={paused ? "Reprendre l’animation" : "Mettre l’animation en pause"} className={styles.pause + " absolute right-5 top-5 z-10 flex size-11 items-center justify-center rounded-full border border-white/25 bg-slate-950/35 text-white hover:bg-slate-950/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"}>
      {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
    </button>

    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#12182f] via-[#12182f]/95 to-transparent px-6 pb-6 pt-10 text-center text-white">
      <p className="text-lg font-semibold" lang="it">La tua porta verso l&apos;Italia</p>
      <p className="mt-1 text-xs text-white/75">De Rome à Venise, en passant par la Toscane</p>
      <div className="mt-3 flex justify-center gap-1" aria-hidden="true"><span className="h-1 w-6 rounded-sm bg-[#009246]" /><span className="h-1 w-6 rounded-sm bg-white" /><span className="h-1 w-6 rounded-sm bg-[#ce2b37]" /></div>
    </div>
  </aside>
}

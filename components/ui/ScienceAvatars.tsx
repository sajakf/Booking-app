"use client"

import Image from "next/image"

// ── ScientistBoy — real PNG avatar ────────────────────────────────────────────
export function ScientistBoy({ className }: { className?: string }) {
  return (
    <Image
      src="/avatars/scientist-boy.png"
      alt="Scientist Boy"
      width={160}
      height={200}
      className={className}
      style={{ objectFit: "contain" }}
      priority
    />
  )
}

// ── ScientistBoy SVG fallback (kept for internal use) ─────────────────────────
function ScientistBoySVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 100" fill="none" className={className} aria-hidden>
      {/* Body - lab coat */}
      <rect x="18" y="52" width="44" height="40" rx="6" fill="#ffffff" stroke="#32246b" strokeWidth="1.5" />
      {/* Coat collar/lapels */}
      <path d="M36 52 L40 62 L44 52" fill="#32246b" />
      {/* Coat pocket */}
      <rect x="22" y="62" width="12" height="8" rx="2" fill="#e8e4ff" stroke="#32246b" strokeWidth="1" />
      {/* Beaker in pocket */}
      <path d="M25 64 h6 v2 l2 3 a3 3 0 0 1-10 0 l2-3 z" fill="#b3f82d" stroke="#32246b" strokeWidth="0.8" />
      {/* Shirt under coat */}
      <rect x="30" y="52" width="20" height="20" fill="#5356df" />
      {/* Arms */}
      <rect x="8" y="54" width="12" height="28" rx="6" fill="#ffffff" stroke="#32246b" strokeWidth="1.5" />
      <rect x="60" y="54" width="12" height="28" rx="6" fill="#ffffff" stroke="#32246b" strokeWidth="1.5" />
      {/* Hands */}
      <ellipse cx="14" cy="83" rx="5" ry="4" fill="#f4c89a" />
      <ellipse cx="66" cy="83" rx="5" ry="4" fill="#f4c89a" />
      {/* Holding beaker */}
      <path d="M62 74 h6 v3 l3 5 a4 4 0 0 1-12 0 l3-5 z" fill="#b3f82d" stroke="#32246b" strokeWidth="1" />
      <ellipse cx="68" cy="79" rx="1.5" ry="1.5" fill="white" />
      <ellipse cx="65" cy="81" rx="1" ry="1" fill="white" />
      {/* Neck */}
      <rect x="35" y="44" width="10" height="10" rx="3" fill="#f4c89a" />
      {/* Head */}
      <ellipse cx="40" cy="30" rx="16" ry="18" fill="#f4c89a" />
      {/* Hair - short dark */}
      <path d="M24 26 Q26 12 40 12 Q54 12 56 26 Q52 18 40 18 Q28 18 24 26z" fill="#2d1b00" />
      {/* Goggles */}
      <rect x="26" y="24" width="11" height="8" rx="3" fill="#32246b" opacity="0.85" />
      <rect x="43" y="24" width="11" height="8" rx="3" fill="#32246b" opacity="0.85" />
      <line x1="37" y1="28" x2="43" y2="28" stroke="#32246b" strokeWidth="1.5" />
      {/* Goggle lenses */}
      <rect x="27.5" y="25.5" width="8" height="5" rx="2" fill="#b3f82d" opacity="0.5" />
      <rect x="44.5" y="25.5" width="8" height="5" rx="2" fill="#b3f82d" opacity="0.5" />
      {/* Goggle strap */}
      <path d="M26 27 Q22 26 22 30" stroke="#32246b" strokeWidth="1.5" fill="none" />
      <path d="M54 27 Q58 26 58 30" stroke="#32246b" strokeWidth="1.5" fill="none" />
      {/* Smile */}
      <path d="M33 36 Q40 42 47 36" stroke="#2d1b00" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Eyes */}
      <circle cx="32" cy="29" r="1.5" fill="#2d1b00" />
      <circle cx="48" cy="29" r="1.5" fill="#2d1b00" />
      {/* Legs */}
      <rect x="22" y="88" width="14" height="10" rx="4" fill="#32246b" />
      <rect x="44" y="88" width="14" height="10" rx="4" fill="#32246b" />
      {/* Shoes */}
      <ellipse cx="29" cy="97" rx="7" ry="3" fill="#1a0f3c" />
      <ellipse cx="51" cy="97" rx="7" ry="3" fill="#1a0f3c" />
    </svg>
  )
}

// ── ScientistGirl — real PNG avatar ──────────────────────────────────────────
export function ScientistGirl({ className }: { className?: string }) {
  return (
    <Image
      src="/avatars/scientist-girl.png"
      alt="Scientist Girl"
      width={160}
      height={200}
      className={className}
      style={{ objectFit: "contain" }}
      priority
    />
  )
}

// ── ScientistGirl SVG fallback (kept for internal use) ────────────────────────
function ScientistGirlSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 100" fill="none" className={className} aria-hidden>
      {/* Body - lab coat */}
      <rect x="18" y="52" width="44" height="40" rx="6" fill="#ffffff" stroke="#f51553" strokeWidth="1.5" />
      {/* Coat collar/lapels */}
      <path d="M36 52 L40 62 L44 52" fill="#f51553" />
      {/* Coat pocket */}
      <rect x="46" y="62" width="12" height="8" rx="2" fill="#ffe4ef" stroke="#f51553" strokeWidth="1" />
      {/* Pencil in pocket */}
      <rect x="50" y="62" width="2" height="7" rx="1" fill="#b3f82d" />
      <rect x="53" y="62" width="2" height="7" rx="1" fill="#f51553" />
      {/* Shirt under coat */}
      <rect x="30" y="52" width="20" height="20" fill="#f51553" opacity="0.7" />
      {/* Arms */}
      <rect x="8" y="54" width="12" height="28" rx="6" fill="#ffffff" stroke="#f51553" strokeWidth="1.5" />
      <rect x="60" y="54" width="12" height="28" rx="6" fill="#ffffff" stroke="#f51553" strokeWidth="1.5" />
      {/* Hands */}
      <ellipse cx="14" cy="83" rx="5" ry="4" fill="#f4c89a" />
      <ellipse cx="66" cy="83" rx="5" ry="4" fill="#f4c89a" />
      {/* Holding microscope */}
      <rect x="60" y="68" width="8" height="14" rx="2" fill="#5356df" stroke="#32246b" strokeWidth="0.8" />
      <circle cx="64" cy="66" r="3.5" fill="#32246b" stroke="#5356df" strokeWidth="0.8" />
      <rect x="61" y="80" width="6" height="3" rx="1" fill="#32246b" />
      {/* Neck */}
      <rect x="35" y="44" width="10" height="10" rx="3" fill="#f4c89a" />
      {/* Head */}
      <ellipse cx="40" cy="30" rx="16" ry="18" fill="#f4c89a" />
      {/* Hair - longer */}
      <path d="M24 22 Q24 8 40 8 Q56 8 56 22" fill="#3d1a00" />
      <path d="M24 22 Q20 30 22 42 Q24 40 25 38" fill="#3d1a00" />
      <path d="M56 22 Q60 30 58 42 Q56 40 55 38" fill="#3d1a00" />
      <path d="M24 22 Q26 35 28 40" stroke="#3d1a00" strokeWidth="2" fill="none" />
      <path d="M56 22 Q54 35 52 40" stroke="#3d1a00" strokeWidth="2" fill="none" />
      {/* Hair tie / bow */}
      <circle cx="52" cy="14" r="3" fill="#f51553" />
      <ellipse cx="49" cy="13" rx="2.5" ry="1.5" fill="#f51553" transform="rotate(-20 49 13)" />
      <ellipse cx="55" cy="13" rx="2.5" ry="1.5" fill="#f51553" transform="rotate(20 55 13)" />
      {/* Goggles */}
      <rect x="26" y="24" width="11" height="8" rx="3" fill="#f51553" opacity="0.85" />
      <rect x="43" y="24" width="11" height="8" rx="3" fill="#f51553" opacity="0.85" />
      <line x1="37" y1="28" x2="43" y2="28" stroke="#f51553" strokeWidth="1.5" />
      {/* Goggle lenses */}
      <rect x="27.5" y="25.5" width="8" height="5" rx="2" fill="#b3f82d" opacity="0.5" />
      <rect x="44.5" y="25.5" width="8" height="5" rx="2" fill="#b3f82d" opacity="0.5" />
      {/* Goggle strap */}
      <path d="M26 27 Q22 26 22 30" stroke="#f51553" strokeWidth="1.5" fill="none" />
      <path d="M54 27 Q58 26 58 30" stroke="#f51553" strokeWidth="1.5" fill="none" />
      {/* Smile */}
      <path d="M33 36 Q40 43 47 36" stroke="#2d1b00" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Eyes */}
      <circle cx="32" cy="29" r="1.5" fill="#2d1b00" />
      <circle cx="48" cy="29" r="1.5" fill="#2d1b00" />
      {/* Lashes */}
      <line x1="30" y1="27" x2="29" y2="25.5" stroke="#2d1b00" strokeWidth="1" />
      <line x1="32" y1="27" x2="32" y2="25.5" stroke="#2d1b00" strokeWidth="1" />
      <line x1="34" y1="27" x2="35" y2="25.5" stroke="#2d1b00" strokeWidth="1" />
      {/* Legs */}
      <rect x="22" y="88" width="14" height="10" rx="4" fill="#f51553" />
      <rect x="44" y="88" width="14" height="10" rx="4" fill="#f51553" />
      {/* Shoes */}
      <ellipse cx="29" cy="97" rx="7" ry="3" fill="#3d0020" />
      <ellipse cx="51" cy="97" rx="7" ry="3" fill="#3d0020" />
    </svg>
  )
}

// ── FlaskAvatar ───────────────────────────────────────────────────────────────
export function FlaskAvatar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 70" fill="none" className={className} aria-hidden>
      {/* Flask body */}
      <path d="M22 10 h16 v2 l8 20 a16 16 0 1 1-32 0 l8-20 z" fill="#32246b" stroke="#b3f82d" strokeWidth="2" />
      {/* Flask neck highlight */}
      <rect x="22" y="10" width="16" height="4" rx="2" fill="#5356df" />
      {/* Liquid */}
      <path d="M17 38 a16 16 0 0 0 26 0 z" fill="#b3f82d" opacity="0.9" />
      {/* Bubbles */}
      <circle cx="24" cy="44" r="2.5" fill="white" opacity="0.8" />
      <circle cx="32" cy="42" r="1.8" fill="white" opacity="0.7" />
      <circle cx="38" cy="46" r="1.5" fill="white" opacity="0.6" />
      {/* Flask rim */}
      <rect x="20" y="8" width="20" height="4" rx="2" fill="#5356df" stroke="#b3f82d" strokeWidth="1" />
      {/* Happy face */}
      <circle cx="26" cy="34" r="2" fill="white" opacity="0.9" />
      <circle cx="34" cy="34" r="2" fill="white" opacity="0.9" />
      <path d="M24 39 Q30 44 36 39" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Stars around */}
      <path d="M10 15 l1 3 l3 1 l-3 1 l-1 3 l-1-3 l-3-1 l3-1 z" fill="#b3f82d" />
      <path d="M52 20 l1 2 l2 1 l-2 1 l-1 2 l-1-2 l-2-1 l2-1 z" fill="#f51553" />
    </svg>
  )
}

// ── RobotAvatar ───────────────────────────────────────────────────────────────
export function RobotAvatar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 70" fill="none" className={className} aria-hidden>
      {/* Antenna */}
      <line x1="30" y1="5" x2="30" y2="14" stroke="#5356df" strokeWidth="2" />
      <circle cx="30" cy="4" r="3" fill="#b3f82d" />
      {/* Head */}
      <rect x="10" y="14" width="40" height="30" rx="6" fill="#5356df" stroke="#32246b" strokeWidth="1.5" />
      {/* Eyes */}
      <rect x="14" y="20" width="12" height="10" rx="3" fill="#b3f82d" />
      <rect x="34" y="20" width="12" height="10" rx="3" fill="#b3f82d" />
      {/* Pupils */}
      <circle cx="20" cy="25" r="3" fill="#32246b" />
      <circle cx="40" cy="25" r="3" fill="#32246b" />
      {/* Pupil shine */}
      <circle cx="21.5" cy="23.5" r="1" fill="white" />
      <circle cx="41.5" cy="23.5" r="1" fill="white" />
      {/* Mouth panel */}
      <rect x="14" y="34" width="32" height="6" rx="3" fill="#32246b" />
      {/* Teeth */}
      <rect x="17" y="35" width="5" height="4" rx="1" fill="#b3f82d" />
      <rect x="24" y="35" width="5" height="4" rx="1" fill="#b3f82d" />
      <rect x="31" y="35" width="5" height="4" rx="1" fill="#b3f82d" />
      <rect x="38" y="35" width="5" height="4" rx="1" fill="#b3f82d" />
      {/* Body */}
      <rect x="14" y="46" width="32" height="20" rx="4" fill="#32246b" stroke="#5356df" strokeWidth="1.5" />
      {/* Chest panel */}
      <rect x="20" y="50" width="20" height="12" rx="3" fill="#5356df" />
      {/* Buttons */}
      <circle cx="25" cy="55" r="2.5" fill="#f51553" />
      <circle cx="30" cy="55" r="2.5" fill="#b3f82d" />
      <circle cx="35" cy="55" r="2.5" fill="#5356df" stroke="white" strokeWidth="1" />
      {/* Arms */}
      <rect x="4" y="47" width="10" height="18" rx="5" fill="#5356df" stroke="#32246b" strokeWidth="1.5" />
      <rect x="46" y="47" width="10" height="18" rx="5" fill="#5356df" stroke="#32246b" strokeWidth="1.5" />
    </svg>
  )
}

// ── MicroscopeAvatar ──────────────────────────────────────────────────────────
export function MicroscopeAvatar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 70" fill="none" className={className} aria-hidden>
      {/* Base */}
      <rect x="12" y="58" width="36" height="6" rx="3" fill="#32246b" />
      {/* Stage arm */}
      <rect x="28" y="44" width="6" height="16" rx="2" fill="#5356df" />
      {/* Stage platform */}
      <rect x="16" y="48" width="28" height="5" rx="2" fill="#32246b" stroke="#5356df" strokeWidth="1" />
      {/* Pillar/arm */}
      <rect x="26" y="14" width="8" height="34" rx="3" fill="#32246b" />
      {/* Eyepiece arm */}
      <path d="M30 20 L44 12" stroke="#32246b" strokeWidth="6" strokeLinecap="round" />
      {/* Eyepiece */}
      <rect x="42" y="6" width="10" height="14" rx="4" fill="#5356df" stroke="#32246b" strokeWidth="1.5" />
      {/* Objective lens */}
      <circle cx="30" cy="40" r="7" fill="#5356df" stroke="#b3f82d" strokeWidth="2" />
      <circle cx="30" cy="40" r="4" fill="#32246b" />
      <circle cx="28" cy="38" r="1.5" fill="white" opacity="0.7" />
      {/* Sample on stage */}
      <ellipse cx="30" cy="50" rx="6" ry="2" fill="#b3f82d" opacity="0.6" />
      {/* Sparkles */}
      <path d="M48 28 l1.5 3 l3 1 l-3 1.5 l-1.5 3 l-1.5-3 l-3-1.5 l3-1 z" fill="#f51553" />
      <path d="M8 30 l1 2 l2 1 l-2 1 l-1 2 l-1-2 l-2-1 l2-1 z" fill="#b3f82d" />
    </svg>
  )
}

// ── AtomAvatar ────────────────────────────────────────────────────────────────
export function AtomAvatar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 70 70" fill="none" className={className} aria-hidden>
      {/* Nucleus */}
      <circle cx="35" cy="35" r="8" fill="#5356df" />
      <circle cx="33" cy="33" r="3" fill="#32246b" />
      <circle cx="37" cy="37" r="2" fill="#b3f82d" opacity="0.8" />
      {/* Orbit 1 - horizontal */}
      <ellipse cx="35" cy="35" rx="28" ry="10" stroke="#b3f82d" strokeWidth="2" fill="none" />
      {/* Orbit 2 - tilted */}
      <ellipse cx="35" cy="35" rx="28" ry="10" stroke="#f51553" strokeWidth="2" fill="none" transform="rotate(60 35 35)" />
      {/* Orbit 3 - other tilt */}
      <ellipse cx="35" cy="35" rx="28" ry="10" stroke="#5356df" strokeWidth="2" fill="none" transform="rotate(-60 35 35)" />
      {/* Electrons */}
      <circle cx="63" cy="35" r="4" fill="#b3f82d" />
      <circle cx="23" cy="22" r="4" fill="#f51553" />
      <circle cx="47" cy="48" r="4" fill="#5356df" stroke="#b3f82d" strokeWidth="1.5" />
    </svg>
  )
}

// ── RocketAvatar ──────────────────────────────────────────────────────────────
export function RocketAvatar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 80" fill="none" className={className} aria-hidden>
      {/* Rocket body */}
      <path d="M30 5 C18 5 12 20 12 35 L12 55 L30 62 L48 55 L48 35 C48 20 42 5 30 5z" fill="#f51553" />
      {/* Nose cone */}
      <path d="M30 5 C24 5 16 12 14 22 L46 22 C44 12 36 5 30 5z" fill="#32246b" />
      {/* Window */}
      <circle cx="30" cy="32" r="9" fill="#5356df" stroke="white" strokeWidth="2" />
      <circle cx="30" cy="32" r="5" fill="#b3f82d" opacity="0.7" />
      <circle cx="27.5" cy="29.5" r="2" fill="white" opacity="0.8" />
      {/* Side fins */}
      <path d="M12 46 L2 60 L12 56 z" fill="#32246b" />
      <path d="M48 46 L58 60 L48 56 z" fill="#32246b" />
      {/* Engine nozzle */}
      <path d="M20 56 L18 65 L30 62 L42 65 L40 56 z" fill="#32246b" />
      {/* Flame */}
      <path d="M22 64 Q25 74 30 78 Q35 74 38 64" fill="#b3f82d" opacity="0.9" />
      <path d="M24 64 Q27 72 30 75 Q33 72 36 64" fill="white" opacity="0.7" />
      {/* Stars */}
      <circle cx="8" cy="20" r="1.5" fill="white" />
      <circle cx="52" cy="15" r="2" fill="white" opacity="0.8" />
      <circle cx="5" cy="40" r="1" fill="#b3f82d" />
      <circle cx="55" cy="38" r="1.5" fill="#b3f82d" />
    </svg>
  )
}

// ── MathAvatar ────────────────────────────────────────────────────────────────
export function MathAvatar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 70" fill="none" className={className} aria-hidden>
      {/* Calculator body */}
      <rect x="8" y="8" width="44" height="58" rx="6" fill="#1f406b" stroke="#b3f82d" strokeWidth="2" />
      {/* Screen */}
      <rect x="14" y="14" width="32" height="16" rx="3" fill="#b3f82d" />
      {/* Screen text */}
      <text x="30" y="25" textAnchor="middle" fill="#1f406b" fontSize="8" fontWeight="bold">2+2=4</text>
      {/* Button grid */}
      {[
        [16, 36], [25, 36], [34, 36], [43, 36],
        [16, 45], [25, 45], [34, 45], [43, 45],
        [16, 54], [25, 54], [34, 54], [43, 54],
      ].map(([x, y], i) => (
        <rect key={i} x={x - 4} y={y - 4} width="8" height="8" rx="2"
          fill={i % 4 === 3 ? "#f51553" : i % 3 === 0 ? "#5356df" : "#32246b"} />
      ))}
      {/* Math symbols floating */}
      <text x="4" y="20" fill="#b3f82d" fontSize="10" fontWeight="bold">∑</text>
      <text x="52" y="30" fill="#f51553" fontSize="8" fontWeight="bold">π</text>
      <text x="4" y="52" fill="#5356df" fontSize="8" fontWeight="bold">∞</text>
      <text x="52" y="52" fill="#b3f82d" fontSize="8" fontWeight="bold">√</text>
    </svg>
  )
}

// ── ScatterElements ───────────────────────────────────────────────────────────
// Renders 10 scattered science element SVGs as absolute-positioned decorations
export function ScatterElements({ className }: { className?: string }) {
  const elements = [
    // atom top-left
    { left: "3%",  top: "6%",  size: 44, rotate: 0,   opacity: 0.18, type: "atom" },
    // beaker top-right
    { left: "88%", top: "4%",  size: 36, rotate: 15,  opacity: 0.15, type: "flask" },
    // gear mid-left
    { left: "1%",  top: "32%", size: 40, rotate: 30,  opacity: 0.12, type: "gear" },
    // test tube mid-right
    { left: "91%", top: "28%", size: 32, rotate: -20, opacity: 0.16, type: "tube" },
    // molecule bottom-left
    { left: "5%",  top: "66%", size: 48, rotate: 10,  opacity: 0.13, type: "molecule" },
    // star mid-center
    { left: "46%", top: "5%",  size: 30, rotate: 0,   opacity: 0.14, type: "star" },
    // beaker bottom-right
    { left: "86%", top: "60%", size: 38, rotate: -10, opacity: 0.15, type: "flask" },
    // atom bottom-center
    { left: "50%", top: "88%", size: 42, rotate: 45,  opacity: 0.12, type: "atom" },
    // gear top-center
    { left: "25%", top: "3%",  size: 28, rotate: 20,  opacity: 0.10, type: "gear" },
    // star right
    { left: "92%", top: "50%", size: 26, rotate: 0,   opacity: 0.14, type: "star" },
  ]

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}>
      {elements.map((el, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: el.left,
            top: el.top,
            width: el.size,
            height: el.size,
            transform: `rotate(${el.rotate}deg)`,
            opacity: el.opacity,
          }}
        >
          {el.type === "atom" && (
            <svg viewBox="0 0 70 70" fill="none" width={el.size} height={el.size}>
              <circle cx="35" cy="35" r="8" fill="#b3f82d" />
              <ellipse cx="35" cy="35" rx="30" ry="10" stroke="#b3f82d" strokeWidth="2.5" fill="none" />
              <ellipse cx="35" cy="35" rx="30" ry="10" stroke="#5356df" strokeWidth="2.5" fill="none" transform="rotate(60 35 35)" />
              <ellipse cx="35" cy="35" rx="30" ry="10" stroke="#f51553" strokeWidth="2.5" fill="none" transform="rotate(-60 35 35)" />
            </svg>
          )}
          {el.type === "flask" && (
            <svg viewBox="0 0 60 70" fill="none" width={el.size} height={el.size}>
              <path d="M22 8 h16 v4 l10 22 a18 18 0 1 1-36 0 l10-22 z" fill="none" stroke="#b3f82d" strokeWidth="3" strokeLinejoin="round" />
              <path d="M17 38 a18 18 0 0 0 26 0 z" fill="#b3f82d" />
            </svg>
          )}
          {el.type === "gear" && (
            <svg viewBox="0 0 60 60" fill="none" width={el.size} height={el.size}>
              <circle cx="30" cy="30" r="12" stroke="#5356df" strokeWidth="3" fill="none" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, j) => (
                <rect
                  key={j}
                  x="27" y="4" width="6" height="10" rx="2"
                  fill="#5356df"
                  transform={`rotate(${angle} 30 30)`}
                />
              ))}
              <circle cx="30" cy="30" r="5" fill="#5356df" />
            </svg>
          )}
          {el.type === "tube" && (
            <svg viewBox="0 0 30 60" fill="none" width={el.size} height={el.size}>
              <rect x="8" y="4" width="14" height="42" rx="7" fill="none" stroke="#f51553" strokeWidth="2.5" />
              <rect x="8" y="28" width="14" height="18" rx="7" fill="#f51553" opacity="0.7" />
              <rect x="6" y="2" width="18" height="6" rx="3" fill="#32246b" />
              <circle cx="14" cy="34" r="2" fill="white" opacity="0.6" />
            </svg>
          )}
          {el.type === "molecule" && (
            <svg viewBox="0 0 70 70" fill="none" width={el.size} height={el.size}>
              <circle cx="20" cy="35" r="10" fill="#32246b" stroke="#b3f82d" strokeWidth="2" />
              <circle cx="50" cy="20" r="8" fill="#5356df" stroke="#b3f82d" strokeWidth="2" />
              <circle cx="50" cy="50" r="8" fill="#f51553" stroke="#b3f82d" strokeWidth="2" />
              <line x1="30" y1="35" x2="42" y2="22" stroke="#b3f82d" strokeWidth="2.5" />
              <line x1="30" y1="35" x2="42" y2="48" stroke="#b3f82d" strokeWidth="2.5" />
            </svg>
          )}
          {el.type === "star" && (
            <svg viewBox="0 0 40 40" fill="none" width={el.size} height={el.size}>
              <path d="M20 3 l3.5 10.5 L34 13.5 l-8.5 7 3 11 L20 26 l-8.5 5.5 3-11-8.5-7 10.5-.5z" fill="#b3f82d" />
            </svg>
          )}
        </div>
      ))}
    </div>
  )
}

// ── ConfirmationHero ──────────────────────────────────────────────────────────
export function ConfirmationHero({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 180" fill="none" className={className} aria-hidden>
      {/* Background */}
      <rect width="320" height="180" rx="16" fill="#32246b" />

      {/* Stars scattered */}
      {[[40,20],[80,12],[140,8],[200,15],[260,10],[300,25],[310,60],[290,140],[60,155],[20,100],[160,170],[100,165]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={i%3===0?3:i%2===0?2:1.5} fill={i%3===0?"#b3f82d":i%2===0?"#f51553":"white"} opacity="0.7" />
      ))}

      {/* Confetti pieces */}
      {[[30,40],[50,30],[90,25],[130,20],[170,22],[210,18],[250,28],[270,40],[285,55],[295,80]].map(([x,y],i) => (
        <rect key={i} x={x-3} y={y-3} width={6} height={6} rx={1}
          fill={["#b3f82d","#f51553","#5356df","white"][i%4]}
          opacity="0.8"
          transform={`rotate(${i*37} ${x} ${y})`}
        />
      ))}

      {/* Boy scientist - left */}
      <g transform="translate(20, 50) scale(0.55)">
        {/* Body */}
        <rect x="18" y="52" width="44" height="40" rx="6" fill="#ffffff" stroke="#32246b" strokeWidth="2" />
        <path d="M36 52 L40 62 L44 52" fill="#32246b" />
        <rect x="30" y="52" width="20" height="20" fill="#5356df" />
        <rect x="8" y="54" width="12" height="28" rx="6" fill="#ffffff" stroke="#32246b" strokeWidth="2" />
        <rect x="60" y="54" width="12" height="28" rx="6" fill="#ffffff" stroke="#32246b" strokeWidth="2" />
        <ellipse cx="14" cy="83" rx="5" ry="4" fill="#f4c89a" />
        {/* Beaker in hand */}
        <path d="M62 74 h6 v3 l3 5 a4 4 0 0 1-12 0 l3-5 z" fill="#b3f82d" stroke="#32246b" strokeWidth="1" />
        <rect x="35" y="44" width="10" height="10" rx="3" fill="#f4c89a" />
        <ellipse cx="40" cy="30" rx="16" ry="18" fill="#f4c89a" />
        <path d="M24 26 Q26 12 40 12 Q54 12 56 26 Q52 18 40 18 Q28 18 24 26z" fill="#2d1b00" />
        <rect x="26" y="24" width="11" height="8" rx="3" fill="#32246b" opacity="0.85" />
        <rect x="43" y="24" width="11" height="8" rx="3" fill="#32246b" opacity="0.85" />
        <line x1="37" y1="28" x2="43" y2="28" stroke="#32246b" strokeWidth="1.5" />
        <rect x="27.5" y="25.5" width="8" height="5" rx="2" fill="#b3f82d" opacity="0.5" />
        <rect x="44.5" y="25.5" width="8" height="5" rx="2" fill="#b3f82d" opacity="0.5" />
        <path d="M33 36 Q40 44 47 36" stroke="#2d1b00" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="32" cy="29" r="2" fill="#2d1b00" />
        <circle cx="48" cy="29" r="2" fill="#2d1b00" />
      </g>

      {/* Girl scientist - right */}
      <g transform="translate(200, 50) scale(0.55)">
        {/* Body */}
        <rect x="18" y="52" width="44" height="40" rx="6" fill="#ffffff" stroke="#f51553" strokeWidth="2" />
        <path d="M36 52 L40 62 L44 52" fill="#f51553" />
        <rect x="30" y="52" width="20" height="20" fill="#f51553" opacity="0.7" />
        <rect x="8" y="54" width="12" height="28" rx="6" fill="#ffffff" stroke="#f51553" strokeWidth="2" />
        <rect x="60" y="54" width="12" height="28" rx="6" fill="#ffffff" stroke="#f51553" strokeWidth="2" />
        <ellipse cx="66" cy="83" rx="5" ry="4" fill="#f4c89a" />
        {/* Microscope */}
        <rect x="60" y="68" width="8" height="14" rx="2" fill="#5356df" stroke="#32246b" strokeWidth="1" />
        <circle cx="64" cy="66" r="3.5" fill="#32246b" />
        <rect x="35" y="44" width="10" height="10" rx="3" fill="#f4c89a" />
        <ellipse cx="40" cy="30" rx="16" ry="18" fill="#f4c89a" />
        <path d="M24 22 Q24 8 40 8 Q56 8 56 22" fill="#3d1a00" />
        <path d="M24 22 Q20 30 22 42" fill="#3d1a00" />
        <path d="M56 22 Q60 30 58 42" fill="#3d1a00" />
        <rect x="26" y="24" width="11" height="8" rx="3" fill="#f51553" opacity="0.85" />
        <rect x="43" y="24" width="11" height="8" rx="3" fill="#f51553" opacity="0.85" />
        <line x1="37" y1="28" x2="43" y2="28" stroke="#f51553" strokeWidth="1.5" />
        <rect x="27.5" y="25.5" width="8" height="5" rx="2" fill="#b3f82d" opacity="0.5" />
        <rect x="44.5" y="25.5" width="8" height="5" rx="2" fill="#b3f82d" opacity="0.5" />
        <path d="M33 36 Q40 44 47 36" stroke="#2d1b00" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="32" cy="29" r="2" fill="#2d1b00" />
        <circle cx="48" cy="29" r="2" fill="#2d1b00" />
      </g>

      {/* Central celebration element - trophy / beaker */}
      <g transform="translate(130, 55)">
        <path d="M30 10 h20 v3 l8 18 a14 14 0 1 1-36 0 l8-18 z" fill="#32246b" stroke="#b3f82d" strokeWidth="2.5" />
        <path d="M24 34 a14 14 0 0 0 32 0 z" fill="#b3f82d" />
        <circle cx="40" cy="40" r="3.5" fill="white" opacity="0.7" />
        <circle cx="34" cy="44" r="2.5" fill="white" opacity="0.6" />
        <circle cx="46" cy="42" r="2" fill="white" opacity="0.5" />
        <rect x="28" y="8" width="24" height="5" rx="2.5" fill="#5356df" stroke="#b3f82d" strokeWidth="1" />
      </g>

      {/* Burst lines from center */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((angle,i) => (
        <line key={i}
          x1={160 + Math.cos(angle*Math.PI/180)*25}
          y1={90 + Math.sin(angle*Math.PI/180)*25}
          x2={160 + Math.cos(angle*Math.PI/180)*45}
          y2={90 + Math.sin(angle*Math.PI/180)*45}
          stroke={i%3===0?"#b3f82d":i%3===1?"#f51553":"#5356df"}
          strokeWidth="2"
          opacity="0.6"
        />
      ))}

      {/* Text */}
      <text x="160" y="158" textAnchor="middle" fill="#b3f82d" fontSize="13" fontWeight="bold" letterSpacing="1">
        YOU&apos;RE BOOKED!
      </text>
    </svg>
  )
}

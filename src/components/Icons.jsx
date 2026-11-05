import React from 'react'
import { TIER_BY_ID } from '../lib/ranks'

export function ApexLogo({ size = 26 }) {
  return (
    <div className="logo" style={{ fontSize: size }}>
      <svg width={size * 1.08} height={size * 1.08} viewBox="0 0 36 36" fill="none" style={{ marginRight: 2 }}>
        <defs>
          <linearGradient id="apxA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#8ab0ff" />
          </linearGradient>
          <linearGradient id="apxB" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4c83ff" />
            <stop offset="1" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
        <path d="M18 3L32 29H24.6L18 16.2L11.4 29H4L18 3Z" fill="url(#apxA)" />
        <path d="M13.5 23.5H22.5L20.7 19.8H15.3L13.5 23.5Z" fill="url(#apxB)" />
        <path d="M18 3L25 16L21.5 16L18 9.4L14.5 16L11 16L18 3Z" fill="#fff" fillOpacity=".35" />
      </svg>
      <span>pex</span>
    </div>
  )
}

/**
 * Epic Faceted Esports & Mythic Rank Badge SVG System:
 * - iron: Heavy forged brutalist armor plate with riveted bevels and brushed steel core
 * - bronze: Spartan battle-forged shield with engraved warrior rings and hammered copper trim
 * - silver: Bladed knight diamond crest with polished chrome facets and razor wingtips
 * - gold: Imperial crowned winged paladin crest with 24K gilded laurels and radiant core
 * - ruby: Crystalline crimson blood-gem with faceted obsidian-ruby refractions and fiery aura
 * - emerald: Ancient techno-mystic runic hexagon with glowing neon emerald channels
 * - diamond: Prismatic brilliant-cut diamond crest with icy facets and refracted flares
 * - amethyst: Sovereign celestial astral crown with deep violet crystal spires and star motes
 * - apex: Mythic divine entity with orbiting celestial halos, coronal rays & 8-point super-nova
 */
export function RankBadge({
  tier = 'iron',
  division = '',
  size = 38,
  glow = false,
  epic = false,
  showDiv = false,
  className = '',
  style = {},
}) {
  const t = typeof tier === 'string' ? TIER_BY_ID[tier] || TIER_BY_ID.iron : tier
  const tierId = t?.id || 'iron'
  const isHighTier = ['diamond', 'amethyst', 'apex'].includes(tierId)
  const shouldGlow = glow || epic || isHighTier
  const uid = React.useId().replace(/[:]/g, '')
  const gid = `rb-${tierId}-${uid}`

  // Standard Starburst / Nova Path for gem centers
  const star4 = 'M20 13.5 L21.6 18.4 L26.5 20 L21.6 21.6 L20 26.5 L18.4 21.6 L13.5 20 L18.4 18.4 Z'
  const star8 =
    'M20 11.5 L21.4 17.2 L26.8 14.8 L22.8 18.6 L28.5 20 L22.8 21.4 L26.8 25.2 L21.4 22.8 L20 28.5 L18.6 22.8 L13.2 25.2 L17.2 21.4 L11.5 20 L17.2 18.6 L13.2 14.8 L18.6 17.2 Z'

  return (
    <div
      className={`rank-badge ${epic ? 'rank-badge-glow' : ''} ${className}`}
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'inline-grid',
        placeItems: 'center',
        flex: 'none',
        filter: shouldGlow
          ? `drop-shadow(0 0 ${Math.round(size * 0.28)}px ${t.glow || '#3b82ff'}99) drop-shadow(0 2px 8px rgba(0,0,0,0.6))`
          : 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))',
        ...style,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Main Tier Metallic Gradient */}
          <linearGradient id={`${gid}-base`} x1="4" y1="2" x2="40" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={t.glow || '#fff'} />
            <stop offset="45%" stopColor={t.color || '#888'} />
            <stop offset="100%" stopColor={t.dark || '#111'} />
          </linearGradient>

          {/* Secondary Shading Gradient */}
          <linearGradient id={`${gid}-shade`} x1="22" y1="4" x2="22" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#000000" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.75" />
          </linearGradient>

          {/* Specular Bevel Shine */}
          <linearGradient id={`${gid}-shine`} x1="6" y1="4" x2="30" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Core Gem Radial Gradient */}
          <radialGradient id={`${gid}-rad`} cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="35%" stopColor={t.glow} stopOpacity="0.85" />
            <stop offset="80%" stopColor={t.color} />
            <stop offset="100%" stopColor={t.dark} />
          </radialGradient>
        </defs>

        {/* 1. IRON: Brutalist Forged Heavy Plate with Bolted Rivets */}
        {tierId === 'iron' && (
          <g>
            {/* Outer Armor Rim */}
            <path
              d="M7 6 L37 6 L40 18 L22 41 L4 18 Z"
              fill={`url(#${gid}-base)`}
              stroke="#d8e0eb"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Inner Recessed Plate */}
            <path
              d="M10 9 L34 9 L36.5 18 L22 37.5 L7.5 18 Z"
              fill="#181a20"
              stroke="#404652"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Industrial Angled Cross Blades */}
            <path d="M12 11 L32 31 M32 11 L12 31" stroke="#2a2f3a" strokeWidth="2.5" strokeLinecap="round" />
            {/* Specular Edge Top */}
            <path d="M7 6 L37 6 L22 18 Z" fill={`url(#${gid}-shine)`} opacity="0.35" />
            {/* Corner Bolted Rivets */}
            <circle cx="12" cy="10" r="1.3" fill="#a4b0c0" stroke="#000" strokeWidth="0.5" />
            <circle cx="32" cy="10" r="1.3" fill="#a4b0c0" stroke="#000" strokeWidth="0.5" />
            <circle cx="22" cy="33" r="1.3" fill="#a4b0c0" stroke="#000" strokeWidth="0.5" />
            {/* Center Iron Emblem */}
            <polygon points="22,14 28,20 22,26 16,20" fill={`url(#${gid}-base)`} stroke="#cbd5e1" strokeWidth="1" />
            <path d={star4} fill="#ffffff" fillOpacity="0.9" />
          </g>
        )}

        {/* 2. BRONZE: Spartan Battle-Forged Round War Shield */}
        {tierId === 'bronze' && (
          <g>
            {/* Outer Spiked Ring */}
            <circle cx="22" cy="22" r="19" fill="#2d1405" stroke={`url(#${gid}-base)`} strokeWidth="1.8" />
            <circle cx="22" cy="22" r="15.8" fill={`url(#${gid}-base)`} stroke="#ffa760" strokeWidth="1.2" />
            {/* Embossed Inner Shield Basin */}
            <circle cx="22" cy="22" r="12.5" fill="#3b1a08" />
            {/* Engraved Sunburst Beams */}
            <path
              d="M22 6.5 V10 M22 34 V37.5 M6.5 22 H10 M34 22 H37.5 M11 11 L13.5 13.5 M30.5 30.5 L33 33 M11 33 L13.5 30.5 M30.5 13.5 L33 11"
              stroke="#ffd1a3"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            {/* Spartan Central Chevron / Warrior Crest */}
            <polygon points="22,13 30,28 22,24 14,28" fill={`url(#${gid}-rad)`} stroke="#ffe4cc" strokeWidth="1.2" />
            <path d="M22 7 C28 7 34 11 36 17 L22 22 Z" fill={`url(#${gid}-shine)`} opacity="0.4" />
            <path d={star4} fill="#ffffff" fillOpacity="0.95" />
          </g>
        )}

        {/* 3. SILVER: Bladed Knight Diamond Crest with Chrome Lustre */}
        {tierId === 'silver' && (
          <g>
            {/* Side Blade Accents */}
            <path d="M2 22 L10 12 L10 32 Z" fill="#71829e" stroke="#e2e8f0" strokeWidth="0.8" />
            <path d="M42 22 L34 12 L34 32 Z" fill="#71829e" stroke="#e2e8f0" strokeWidth="0.8" />
            {/* Main Diamond Shield Body */}
            <polygon
              points="22,3 39,22 22,41 5,22"
              fill={`url(#${gid}-base)`}
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Inner Stepped Bevels */}
            <polygon points="22,7 34,22 22,37 10,22" fill="#1e2532" stroke="#94a3b8" strokeWidth="1.2" />
            {/* Faceted Mirror Shards */}
            <polygon points="22,7 34,22 22,22" fill="#64748b" opacity="0.4" />
            <polygon points="22,7 22,22 10,22" fill="#ffffff" opacity="0.35" />
            <polygon points="10,22 22,22 22,37" fill="#334155" opacity="0.6" />
            <polygon points="22,22 34,22 22,37" fill="#0f172a" opacity="0.8" />
            {/* Upper Chrome Flare */}
            <polygon points="22,3 39,22 22,22 5,22" fill={`url(#${gid}-shine)`} opacity="0.55" />
            {/* Center Silver Core */}
            <polygon points="22,14 28,22 22,30 16,22" fill={`url(#${gid}-rad)`} stroke="#ffffff" strokeWidth="1" />
            <path d={star4} fill="#ffffff" fillOpacity="1" />
          </g>
        )}

        {/* 4. GOLD: Imperial Winged Paladin Crest with Crown & 24K Gilded Laurels */}
        {tierId === 'gold' && (
          <g>
            {/* Gilded Wings / Laurel Leaves */}
            <path
              d="M5 16 C3 8 10 4 15 8 L15 17 Z M39 16 C41 8 34 4 29 8 L29 17 Z"
              fill={`url(#${gid}-base)`}
              stroke="#ffe885"
              strokeWidth="0.9"
            />
            {/* Crowned Pentagon Base */}
            <polygon
              points="22,4 39,15 32,38 12,38 5,15"
              fill={`url(#${gid}-base)`}
              stroke="#fff2a8"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            {/* Inner Rich Gold Plate */}
            <polygon points="22,8 35,17 29.5,35 14.5,35 9,17" fill="#382403" stroke="#eab308" strokeWidth="1.2" />
            {/* Crown Spikes in Top Border */}
            <polygon points="18,17 22,11 26,17 29,14 29,22 15,22 15,14" fill={`url(#${gid}-base)`} />
            {/* Glossy Upper Light Sweep */}
            <polygon points="22,4 39,15 22,22 5,15" fill={`url(#${gid}-shine)`} opacity="0.5" />
            {/* Central Imperial Jewel */}
            <polygon points="22,15 29,22 22,29 15,22" fill={`url(#${gid}-rad)`} stroke="#ffffff" strokeWidth="1.2" />
            <path d={star8} fill="#ffffff" fillOpacity="1" />
          </g>
        )}

        {/* 5. RUBY: Crystalline Crimson Blood-Gem with Faceted Obsidian Cuts */}
        {tierId === 'ruby' && (
          <g>
            {/* Outer Dragon Horn / Crystalline Prisms */}
            <polygon
              points="14,3 30,3 41,14 41,30 30,41 14,41 3,30 3,14"
              fill={`url(#${gid}-base)`}
              stroke="#ffa1ab"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            {/* Inner Dark Garnet Cavity */}
            <polygon
              points="16,6.5 28,6.5 37.5,16 37.5,28 28,37.5 16,37.5 6.5,28 6.5,16"
              fill="#2b0308"
              stroke="#e11d48"
              strokeWidth="1.2"
            />
            {/* Multi-facet Gem Refractions */}
            <polygon points="16,6.5 28,6.5 22,22" fill="#ff4d64" opacity="0.45" />
            <polygon points="28,6.5 37.5,16 22,22" fill="#be123c" opacity="0.6" />
            <polygon points="37.5,16 37.5,28 22,22" fill="#881337" opacity="0.8" />
            <polygon points="37.5,28 28,37.5 22,22" fill="#4c0519" opacity="0.9" />
            <polygon points="28,37.5 16,37.5 22,22" fill="#1f0208" />
            <polygon points="16,37.5 6.5,28 22,22" fill="#4c0519" opacity="0.85" />
            <polygon points="6.5,28 6.5,16 22,22" fill="#9f1239" opacity="0.6" />
            <polygon points="6.5,16 16,6.5 22,22" fill="#fb7185" opacity="0.4" />
            {/* Top Gloss Reflection */}
            <polygon points="14,3 30,3 41,14 22,22 3,14" fill={`url(#${gid}-shine)`} opacity="0.55" />
            {/* Central Pure Heart Ruby */}
            <polygon points="22,14 28,22 22,30 16,22" fill={`url(#${gid}-rad)`} stroke="#ffffff" strokeWidth="1.2" />
            <path d={star8} fill="#ffffff" fillOpacity="1" />
          </g>
        )}

        {/* 6. EMERALD: Ancient Techno-Mystic Runic Hex-Shield with Neon Crystals */}
        {tierId === 'emerald' && (
          <g>
            {/* Outer Hexagon Shell */}
            <polygon
              points="22,2 39,12 39,32 22,42 5,32 5,12"
              fill={`url(#${gid}-base)`}
              stroke="#a7f3d0"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            {/* Inner Runic Matrix */}
            <polygon points="22,6.5 35,14 35,30 22,37.5 9,30 9,14" fill="#042312" stroke="#10b981" strokeWidth="1.2" />
            {/* Cyber/Mystic Circuit Insets */}
            <path
              d="M22 6.5 V16 M9 14 L16 19 M35 14 L28 19 M9 30 L16 25 M35 30 L28 25 M22 37.5 V28"
              stroke="#34d399"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            {/* Floating Crystalline Shards */}
            <polygon points="22,10 26,16 22,22 18,16" fill="#6ee7b7" opacity="0.6" />
            <polygon points="22,22 26,28 22,34 18,28" fill="#059669" opacity="0.8" />
            {/* Glass Highlight */}
            <polygon points="22,2 39,12 22,22 5,12" fill={`url(#${gid}-shine)`} opacity="0.5" />
            {/* Emerald Core Power Crystal */}
            <circle cx="22" cy="22" r="6" fill={`url(#${gid}-rad)`} stroke="#ffffff" strokeWidth="1.2" />
            <path d={star8} fill="#ffffff" fillOpacity="1" />
          </g>
        )}

        {/* 7. DIAMOND: Prismatic Brilliant-Cut Celestial Diamond */}
        {tierId === 'diamond' && (
          <g>
            {/* Floating Sub-crystal Wings */}
            <polygon points="2,18 10,9 13,24" fill="#38bdf8" opacity="0.5" stroke="#bae6fd" strokeWidth="0.8" />
            <polygon points="42,18 34,9 31,24" fill="#38bdf8" opacity="0.5" stroke="#bae6fd" strokeWidth="0.8" />
            {/* Crown Cut Diamond Silhouette */}
            <polygon
              points="13,5 31,5 41,16 22,41 3,16"
              fill={`url(#${gid}-base)`}
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Diamond Table & Pavilion Facets */}
            <polygon points="13,5 31,5 28,16 16,16" fill="#e0f2fe" opacity="0.75" stroke="#7dd3fc" strokeWidth="0.8" />
            <polygon points="3,16 16,16 22,41" fill="#0284c7" opacity="0.85" />
            <polygon points="41,16 28,16 22,41" fill="#0369a1" opacity="0.95" />
            <polygon points="16,16 28,16 22,41" fill="#38bdf8" opacity="0.8" />
            <polygon points="13,5 16,16 3,16" fill="#bae6fd" opacity="0.9" />
            <polygon points="31,5 41,16 28,16" fill="#7dd3fc" opacity="0.7" />
            {/* Prismatic Center Flare Line */}
            <line x1="3" y1="16" x2="41" y2="16" stroke="#ffffff" strokeWidth="1.2" />
            {/* Specular White Shimmer */}
            <polygon points="13,5 31,5 28,16 16,16" fill="#ffffff" opacity="0.6" />
            {/* Radiant Ice Core */}
            <polygon points="22,12 28,18 22,28 16,18" fill={`url(#${gid}-rad)`} stroke="#ffffff" strokeWidth="1.2" />
            <path d={star8} fill="#ffffff" fillOpacity="1" />
          </g>
        )}

        {/* 8. AMETHYST: Sovereign Celestial Astral Crown with Violet Spires */}
        {tierId === 'amethyst' && (
          <g>
            {/* 5-Spire Ascending Crown Crest */}
            <path
              d="M5 24 L7 10 L14 17 L22 4 L30 17 L37 10 L39 24 L22 41 Z"
              fill={`url(#${gid}-base)`}
              stroke="#f3e8ff"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Inner Astral Cavity */}
            <path
              d="M9 23 L10.5 13 L15.5 18 L22 8 L28.5 18 L33.5 13 L35 23 L22 37 Z"
              fill="#22073d"
              stroke="#a855f7"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Star Sparkle Constellations */}
            <circle cx="14" cy="24" r="1.2" fill="#e9d5ff" />
            <circle cx="30" cy="24" r="1.2" fill="#e9d5ff" />
            <circle cx="22" cy="14" r="1.5" fill="#ffffff" />
            {/* Spire Highlights */}
            <line x1="22" y1="8" x2="22" y2="20" stroke="#f3e8ff" strokeWidth="1.5" strokeLinecap="round" />
            {/* Upper Crystal Sheen */}
            <path d="M7 10 L14 17 L22 4 L30 17 L37 10 L22 22 Z" fill={`url(#${gid}-shine)`} opacity="0.45" />
            {/* Heart Jewel of Amethyst */}
            <polygon points="22,16 29,23 22,32 15,23" fill={`url(#${gid}-rad)`} stroke="#ffffff" strokeWidth="1.4" />
            <path d={star8} fill="#ffffff" fillOpacity="1" />
          </g>
        )}

        {/* 9. APEX: Mythic Divine Sphere with Orbiting Halos, Coronal Rays & Super-Nova */}
        {tierId === 'apex' && (
          <g>
            {/* Outer Orbiting Cosmic Ring 1 (Tilted Halo) */}
            <ellipse
              cx="22"
              cy="22"
              rx="20"
              ry="7"
              transform="rotate(-28 22 22)"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="1.5"
              strokeDasharray="4 2"
              opacity="0.85"
            />
            {/* Outer Orbiting Cosmic Ring 2 (Counter-tilted) */}
            <ellipse
              cx="22"
              cy="22"
              rx="19"
              ry="6"
              transform="rotate(38 22 22)"
              fill="none"
              stroke="#93c5fd"
              strokeWidth="1.2"
              opacity="0.7"
            />

            {/* Orbiting Satellite Star Motes */}
            <circle cx="6" cy="12" r="1.5" fill="#ffffff" />
            <circle cx="38" cy="32" r="1.5" fill="#ffffff" />
            <circle cx="36" cy="10" r="1.2" fill="#bfdbfe" />

            {/* Radiant Coronal Rays (Solar Flare Points) */}
            <path
              d="M22 1 L24 7 L22 5 L20 7 Z M43 22 L37 24 L39 22 L37 20 Z M22 43 L20 37 L22 39 L24 37 Z M1 22 L7 20 L5 22 L7 24 Z"
              fill="#bfdbfe"
            />

            {/* Main Divine Core Orb with Pulsating Aura */}
            <circle
              cx="22"
              cy="22"
              r="15"
              fill={`url(#${gid}-rad)`}
              stroke="#ffffff"
              strokeWidth="1.8"
              filter="drop-shadow(0 0 6px #60a5fa)"
            />

            {/* Internal Diamond Facet Ring */}
            <circle cx="22" cy="22" r="11" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

            {/* Diagonal Prismatic Energy Band */}
            <path
              d="M10 30 L30 10 L34 14 L14 34 Z"
              fill="#ffffff"
              fillOpacity="0.32"
            />

            {/* Specular Hemisphere Glow */}
            <path
              d="M9 16 A13 13 0 0 1 35 16 Z"
              fill="url(#apxA)"
              opacity="0.4"
            />

            {/* Blazing 8-Point Super-Nova Star Core */}
            <path d={star8} fill="#ffffff" filter="drop-shadow(0 0 4px #ffffff)" />
          </g>
        )}
      </svg>

      {/* Styled Division Plate (I, II, III) */}
      {showDiv && division && (
        <span
          style={{
            position: 'absolute',
            bottom: -4,
            right: -3,
            fontSize: Math.max(9, Math.round(size * 0.24)),
            fontWeight: 900,
            letterSpacing: '0.04em',
            background: 'linear-gradient(180deg, #181b24 0%, #08090d 100%)',
            color: t.glow || '#fff',
            border: `1.5px solid ${t.color || '#444'}`,
            borderRadius: 6,
            padding: '1px 5px',
            lineHeight: 1.2,
            boxShadow: '0 2px 6px rgba(0,0,0,0.8), 0 0 6px rgba(0,0,0,0.5)',
          }}
        >
          {division}
        </span>
      )}
    </div>
  )
}


export const Icon = {
  Home: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z" />
    </svg>
  ),
  Folder: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </svg>
  ),
  FolderPlus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
      <path d="M12 11v6M9 14h6" />
    </svg>
  ),
  Dumbbell: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M6.5 6.5L17.5 17.5" />
      <path d="M3 10l7-7M2.5 6.5l4-4M14 21l7-7M17.5 21.5l4-4" />
    </svg>
  ),
  Scan: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
      <circle cx="12" cy="8.5" r="2" />
      <path d="M8.5 13l3.5 1 3.5-1M10.5 14v5M13.5 14v5" />
    </svg>
  ),
  User: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  ),
  Book: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M2 5.5A2.5 2.5 0 0 1 4.5 3H11v17H4.5A2.5 2.5 0 0 0 2 22.5v-17zM22 5.5A2.5 2.5 0 0 0 19.5 3H13v17h6.5a2.5 2.5 0 0 1 2.5 2.5v-17z" />
    </svg>
  ),
  Gear: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.77 1.02 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Sparkles: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M10 2L12.2 7.8L18 10L12.2 12.2L10 18L7.8 12.2L2 10L7.8 7.8L10 2Z" />
      <path d="M18.5 14L19.6 17.4L23 18.5L19.6 19.6L18.5 23L17.4 19.6L14 18.5L17.4 17.4L18.5 14Z" />
    </svg>
  ),
  Play: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M6 4.8v14.4a1 1 0 0 0 1.55.83l11.2-7.2a1 1 0 0 0 0-1.66L7.55 3.97A1 1 0 0 0 6 4.8z" />
    </svg>
  ),
  Pause: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <rect x="6" y="4" width="4.5" height="16" rx="1.5" />
      <rect x="13.5" y="4" width="4.5" height="16" rx="1.5" />
    </svg>
  ),
  Clock: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  Timer: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M10 2h4M12 14l3-3M19 6l1.5-1.5" />
      <circle cx="12" cy="14" r="8" />
    </svg>
  ),
  Check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  ),
  Plus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  ChevronDown: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  ChevronLeft: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  ),
  Dots: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <circle cx="12" cy="5" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="12" cy="19" r="1.8" />
    </svg>
  ),
  DotsH: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  ),
  Search: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  ),
  Flame: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12.5 2C12.5 2 17 6.2 17 10.5c0 1.4-.5 2.6-1.2 3.5.4-1.3.1-2.8-.8-3.8 0 0-.2 2.4-1.8 3.6-1.1.8-1.7 2-1.7 3.2 0 1.7 1.2 3 2.7 3A6.5 6.5 0 0 1 6 13.5C6 8.8 10.2 5.4 12.5 2z" />
    </svg>
  ),
  Heart: ({ filled, ...p }) => (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  ),
  Comment: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.7 8.7 0 0 1-3.8-.9L3 21l1.9-4.9A8.3 8.3 0 0 1 3 11.5a8.5 8.5 0 0 1 18 0z" />
    </svg>
  ),
  Camera: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  Volume: ({ muted, ...p }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      {muted ? <path d="M22 9l-6 6M16 9l6 6" /> : <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />}
    </svg>
  ),
  Link: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  Trash: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
    </svg>
  ),
  Flip: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  Trophy: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  ),
  Close: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" {...p}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  Calculator: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="4" y="2" width="16" height="20" rx="3" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <circle cx="8.5" cy="11" r="1" fill="currentColor" />
      <circle cx="12" cy="11" r="1" fill="currentColor" />
      <circle cx="15.5" cy="11" r="1" fill="currentColor" />
      <circle cx="8.5" cy="15" r="1" fill="currentColor" />
      <circle cx="12" cy="15" r="1" fill="currentColor" />
      <circle cx="15.5" cy="15" r="1" fill="currentColor" />
      <circle cx="8.5" cy="18.5" r="1" fill="currentColor" />
      <line x1="12" y1="18.5" x2="15.5" y2="18.5" />
    </svg>
  ),
  Bolt: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  ),
}

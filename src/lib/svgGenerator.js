// Parametric SVG generator for Brother Singapore on-brand visual assets

export function generateFestiveSVG({
  title = "Selamat Hari Raya Puasa",
  subtitle = "Warm wishes from all of us at Brother Singapore",
  occasion = "Hari Raya Puasa",
  theme = "festive-green", // 'festive-green', 'national-red', 'cny-red', 'deepavali-gold', 'brother-blue'
  year = "2027"
}) {
  let primaryBg = "#0A2540";
  let accentColor = "#00D4FF";
  let secondaryAccent = "#F59E0B";
  let motifPattern = "";

  if (theme === "national-red") {
    primaryBg = "#850014";
    accentColor = "#FFFFFF";
    secondaryAccent = "#FFD700";
  } else if (theme === "festive-green") {
    primaryBg = "#064E3B";
    accentColor = "#34D399";
    secondaryAccent = "#FBBF24";
  } else if (theme === "cny-red") {
    primaryBg = "#991B1B";
    accentColor = "#FBBF24";
    secondaryAccent = "#FDE68A";
  } else if (theme === "deepavali-gold") {
    primaryBg = "#451A03";
    accentColor = "#F59E0B";
    secondaryAccent = "#F43F5E";
  } else {
    primaryBg = "#003A70";
    accentColor = "#00D4FF";
    secondaryAccent = "#38BDF8";
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="100%" height="100%" style="border-radius: 12px; font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryBg}" />
      <stop offset="60%" stop-color="#071529" />
      <stop offset="100%" stop-color="#020817" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${accentColor}" />
      <stop offset="100%" stop-color="${secondaryAccent}" />
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="20%" r="60%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.25" />
      <stop offset="100%" stop-color="${primaryBg}" stop-opacity="0" />
    </radialGradient>
    <pattern id="kumikoGrid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 60 30 L 30 60 L 0 30 Z" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1.2" />
      <circle cx="30" cy="30" r="4" fill="rgba(255,255,255,0.06)" />
    </pattern>
  </defs>

  <!-- Background Base -->
  <rect width="1200" height="630" fill="url(#bgGrad)" />
  <rect width="1200" height="630" fill="url(#kumikoGrid)" />
  <rect width="1200" height="630" fill="url(#glow)" />

  <!-- Decorative Corner Accent -->
  <path d="M 0 0 L 180 0 Q 0 0 0 180 Z" fill="url(#accentGrad)" opacity="0.8" />

  <!-- Top Badge -->
  <g transform="translate(100, 90)">
    <rect width="260" height="38" rx="19" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1" />
    <circle cx="20" cy="19" r="6" fill="${accentColor}" />
    <text x="36" y="24" fill="#F8FAFC" font-size="14" font-weight="700" letter-spacing="1.5">FESTIVE OCCASION • ${year}</text>
  </g>

  <!-- Main Headline (Wrapped if needed) -->
  <g transform="translate(100, 240)">
    <text x="0" y="0" fill="url(#accentGrad)" font-size="52" font-weight="800" letter-spacing="-1">${title}</text>
    <text x="0" y="70" fill="#E2E8F0" font-size="26" font-weight="400" opacity="0.95">${subtitle}</text>
    <text x="0" y="115" fill="#94A3B8" font-size="18" font-weight="400">Celebrating unity, growth, and togetherness across Singapore.</text>
  </g>

  <!-- Bottom Divider Line -->
  <line x1="100" y1="490" x2="1100" y2="490" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1.5" />

  <!-- Footer: Brother Branding & Tagline -->
  <g transform="translate(100, 530)">
    <!-- Brother Blue Logo Badge -->
    <rect width="130" height="42" rx="8" fill="#005BAC" />
    <text x="65" y="27" fill="#FFFFFF" font-size="22" font-weight="800" text-anchor="middle" letter-spacing="1">brother</text>
    <text x="150" y="27" fill="#F8FAFC" font-size="18" font-weight="600">Singapore</text>
    <text x="250" y="27" fill="#64748B" font-size="18" font-weight="400">•</text>
    <text x="270" y="27" fill="#94A3B8" font-size="16" font-style="italic">At your side</text>
  </g>

  <!-- Right Side Decorative Emblem -->
  <g transform="translate(940, 230)">
    <circle cx="90" cy="90" r="110" fill="none" stroke="url(#accentGrad)" stroke-width="2" stroke-dasharray="8 6" opacity="0.6" />
    <circle cx="90" cy="90" r="85" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />
    <polygon points="90,30 108,72 153,75 118,104 129,148 90,123 51,148 62,104 27,75 72,72" fill="url(#accentGrad)" opacity="0.85" />
  </g>
</svg>`;
}

export function generateInnovationInfographicSVG({
  topic = "Autonomous Agentic Workflows",
  pillar1 = "Autonomous Multi-Agent Systems",
  pillar1Desc = "Self-directing task execution across workflows.",
  pillar2 = "Operational Agility",
  pillar2Desc = "65% reduction in repetitive coordination friction.",
  pillar3 = "Brother SG Breakthrough",
  pillar3Desc = "Empowering staff with high-velocity automation.",
  source = "MIT Technology Review / Serper 24h"
}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="100%" height="100%" style="border-radius: 12px; font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;">
  <defs>
    <linearGradient id="techBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0A1E3F" />
      <stop offset="60%" stop-color="#040D1E" />
      <stop offset="100%" stop-color="#01060F" />
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.07)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0.02)" />
    </linearGradient>
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00D4FF" />
      <stop offset="100%" stop-color="#3B82F6" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#techBg)" />
  
  <!-- Subtle Grid Lines -->
  <g stroke="rgba(255,255,255,0.04)" stroke-width="1">
    <line x1="0" y1="120" x2="1200" y2="120" />
    <line x1="0" y1="480" x2="1200" y2="480" />
  </g>

  <!-- Header Section -->
  <g transform="translate(80, 50)">
    <rect width="200" height="28" rx="14" fill="rgba(0, 212, 255, 0.12)" stroke="#00D4FF" stroke-width="1" />
    <text x="100" y="19" fill="#00D4FF" font-size="12" font-weight="700" text-anchor="middle" letter-spacing="1">AI INTELLIGENCE BRIEF</text>
    
    <text x="0" y="65" fill="#FFFFFF" font-size="32" font-weight="800" letter-spacing="-0.5">${topic}</text>
  </g>

  <!-- 3 Pillar Cards -->
  
  <!-- Pillar 1 -->
  <g transform="translate(80, 160)">
    <rect width="320" height="280" rx="16" fill="url(#cardGrad)" stroke="rgba(0, 212, 255, 0.25)" stroke-width="1.5" />
    <circle cx="45" cy="45" r="22" fill="#005BAC" />
    <text x="45" y="52" fill="#FFFFFF" font-size="16" font-weight="800" text-anchor="middle">01</text>
    <text x="80" y="42" fill="#00D4FF" font-size="12" font-weight="700" letter-spacing="1">WHAT IT IS</text>
    <text x="80" y="60" fill="#FFFFFF" font-size="16" font-weight="700">${pillar1}</text>
    
    <line x1="25" y1="90" x2="295" y2="90" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
    <text x="25" y="130" fill="#CBD5E1" font-size="15" font-weight="400" width="270">
      <tspan x="25" dy="0">${pillar1Desc.slice(0, 35)}</tspan>
      <tspan x="25" dy="24">${pillar1Desc.slice(35, 75)}</tspan>
      <tspan x="25" dy="24">${pillar1Desc.slice(75, 115)}</tspan>
    </text>
  </g>

  <!-- Pillar 2 -->
  <g transform="translate(440, 160)">
    <rect width="320" height="280" rx="16" fill="url(#cardGrad)" stroke="rgba(59, 130, 246, 0.25)" stroke-width="1.5" />
    <circle cx="45" cy="45" r="22" fill="#1E40AF" />
    <text x="45" y="52" fill="#FFFFFF" font-size="16" font-weight="800" text-anchor="middle">02</text>
    <text x="80" y="42" fill="#60A5FA" font-size="12" font-weight="700" letter-spacing="1">WHY IT MATTERS</text>
    <text x="80" y="60" fill="#FFFFFF" font-size="16" font-weight="700">${pillar2}</text>
    
    <line x1="25" y1="90" x2="295" y2="90" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
    <text x="25" y="130" fill="#CBD5E1" font-size="15" font-weight="400">
      <tspan x="25" dy="0">${pillar2Desc.slice(0, 35)}</tspan>
      <tspan x="25" dy="24">${pillar2Desc.slice(35, 75)}</tspan>
      <tspan x="25" dy="24">${pillar2Desc.slice(75, 115)}</tspan>
    </text>
  </g>

  <!-- Pillar 3 (Brother Impact - Highlighted) -->
  <g transform="translate(800, 160)">
    <rect width="320" height="280" rx="16" fill="rgba(0, 91, 172, 0.25)" stroke="#00D4FF" stroke-width="2" />
    <circle cx="45" cy="45" r="22" fill="#00D4FF" />
    <text x="45" y="52" fill="#0A1E3F" font-size="16" font-weight="800" text-anchor="middle">03</text>
    <text x="80" y="42" fill="#38BDF8" font-size="12" font-weight="700" letter-spacing="1">BROTHER SG IMPACT</text>
    <text x="80" y="60" fill="#FFFFFF" font-size="16" font-weight="700">${pillar3}</text>
    
    <line x1="25" y1="90" x2="295" y2="90" stroke="rgba(0, 212, 255, 0.2)" stroke-width="1" />
    <text x="25" y="130" fill="#E2E8F0" font-size="15" font-weight="400">
      <tspan x="25" dy="0">${pillar3Desc.slice(0, 35)}</tspan>
      <tspan x="25" dy="24">${pillar3Desc.slice(35, 75)}</tspan>
      <tspan x="25" dy="24">${pillar3Desc.slice(75, 115)}</tspan>
    </text>
  </g>

  <!-- Footer / Attribution -->
  <g transform="translate(80, 520)">
    <!-- Brother Logo -->
    <rect width="110" height="34" rx="6" fill="#005BAC" />
    <text x="55" y="23" fill="#FFFFFF" font-size="18" font-weight="800" text-anchor="middle">brother</text>
    <text x="125" y="23" fill="#F8FAFC" font-size="16" font-weight="600">Singapore</text>
    <text x="215" y="23" fill="#64748B" font-size="16">•</text>
    <text x="230" y="23" fill="#94A3B8" font-size="14">Brother Xplorer AI Intelligence</text>
    
    <text x="1040" y="23" fill="#64748B" font-size="13" text-anchor="end">Source: ${source}</text>
  </g>
</svg>`;
}

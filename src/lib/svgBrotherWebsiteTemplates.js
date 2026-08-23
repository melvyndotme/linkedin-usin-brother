// Official Brother Singapore logo URL provided by user
export const OFFICIAL_BROTHER_LOGO_URL = "https://media.licdn.com/dms/image/v2/C510BAQFFuI6MoUwmVA/company-logo_400_400/company-logo_400_400/0/1630606968981/brother_international_singapore_pte_ltd_logo?e=1788998400&v=beta&t=YC5raNCKcU09QhBEFCYAU3XIIDbjFlC0cm0hxOx-TOU";

/**
 * Template 1: Brother Singapore Website Hero Banner Style (From User Screenshots)
 * Curved Brother Blue shield on left + Marina Bay Singapore skyline/fireworks on right + product lineup
 */
export function generateBrotherWebsiteBannerSVG({
  badgeText = "Celebrate SG Special",
  headline = "Singapore National Day",
  subtitle = "Honoring 61 years of unity, resilience & innovation",
  ctaText = "Brother Singapore • At your side",
  theme = "national-day" // 'national-day', 'mid-autumn', 'deepavali', 'christmas', 'ai-tech'
}) {
  let skyGlow = "#FF4D6D";
  let badgeBg = "#FFFFFF";
  let badgeColor = "#0f2ea2";
  let rightSkylineBg = "#06102B";

  if (theme === "mid-autumn") {
    skyGlow = "#FBBF24";
  } else if (theme === "deepavali") {
    skyGlow = "#F59E0B";
  } else if (theme === "christmas") {
    skyGlow = "#10B981";
  } else if (theme === "ai-tech") {
    skyGlow = "#00D4FF";
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 500" width="100%" height="100%" style="border-radius: 20px; font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;">
  <defs>
    <!-- Right side Skyline background -->
    <linearGradient id="nightSky" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050C1F" />
      <stop offset="60%" stop-color="#0B1C3D" />
      <stop offset="100%" stop-color="#14061A" />
    </linearGradient>

    <!-- Brother Signature Blue Curved Shield Gradient -->
    <linearGradient id="brotherBlueShield" x1="0%" y1="0%" x2="100%" y2="80%">
      <stop offset="0%" stop-color="#004391" />
      <stop offset="45%" stop-color="#0f2ea2" />
      <stop offset="100%" stop-color="#003572" />
    </linearGradient>

    <radialGradient id="fireworkGlow" cx="82%" cy="40%" r="50%">
      <stop offset="0%" stop-color="${skyGlow}" stop-opacity="0.6" />
      <stop offset="50%" stop-color="#FF1493" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Background Base Container -->
  <rect width="1200" height="500" rx="20" fill="url(#nightSky)" />

  <!-- Right Half: Singapore Marina Bay Skyline & Fireworks -->
  <rect x="500" y="0" width="700" height="500" rx="20" fill="url(#fireworkGlow)" />
  
  <!-- Fireworks Sparks in the Sky -->
  <g transform="translate(920, 180)">
    <!-- Firework Burst 1 -->
    <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
    <path d="M 0 0 L 0 -80 M 0 0 L 56 -56 M 0 0 L 80 0 M 0 0 L 56 56 M 0 0 L 0 80 M 0 0 L -56 56 M 0 0 L -80 0 M 0 0 L -56 -56" stroke="#FF6B8B" stroke-width="2" stroke-dasharray="3 5" opacity="0.85" />
    <path d="M 0 0 L 28 -68 M 0 0 L 68 -28 M 0 0 L 68 28 M 0 0 L 28 68 M 0 0 L -28 68 M 0 0 L -68 28 M 0 0 L -68 -28 M 0 0 L -28 -68" stroke="#FFE66D" stroke-width="1.5" stroke-dasharray="2 4" opacity="0.9" />
  </g>
  <g transform="translate(1080, 260)">
    <!-- Firework Burst 2 -->
    <path d="M 0 0 L 0 -50 M 0 0 L 35 -35 M 0 0 L 50 0 M 0 0 L 35 35 M 0 0 L 0 50 M 0 0 L -35 35 M 0 0 L -50 0 M 0 0 L -35 -35" stroke="#4ECDC4" stroke-width="1.5" stroke-dasharray="2 4" opacity="0.8" />
  </g>

  <!-- Singapore Skyline Silhouette (MBS + CBD) -->
  <g transform="translate(560, 280)" fill="#030814" opacity="0.95">
    <!-- Marina Bay Sands 3 Towers + Skypark -->
    <rect x="360" y="40" width="30" height="180" rx="3" />
    <rect x="400" y="40" width="30" height="180" rx="3" />
    <rect x="440" y="40" width="30" height="180" rx="3" />
    <path d="M 340 38 Q 440 25 500 38 L 490 52 Q 430 42 350 52 Z" fill="#030814" />
    <!-- Singapore Flyer Wheel Outline -->
    <circle cx="560" cy="110" r="55" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2" stroke-dasharray="4 6" />
    <!-- City Skyline Skyscrapers -->
    <rect x="0" y="80" width="45" height="140" />
    <rect x="55" y="50" width="55" height="170" />
    <rect x="120" y="90" width="40" height="130" />
    <rect x="170" y="60" width="60" height="160" />
    <rect x="240" y="110" width="50" height="110" />
    <rect x="300" y="70" width="45" height="150" />
    <!-- Water Reflection Line -->
    <rect x="0" y="215" width="640" height="15" fill="#01040A" />
  </g>

  <!-- Signature Brother Blue Curved Shape (Directly Matching Screenshot 1 & 2) -->
  <path d="M 0 0 L 620 0 Q 720 120 730 260 Q 740 400 650 500 L 0 500 Z" fill="url(#brotherBlueShield)" />

  <!-- Brother Logo Top Left (White typography matching corporate identity) -->
  <g transform="translate(60, 50)">
    <text x="0" y="28" fill="#FFFFFF" font-size="34" font-weight="900" letter-spacing="1">brother</text>
    <text x="2" y="48" fill="#E2E8F0" font-size="14" font-style="italic" font-weight="500">at your side</text>
  </g>

  <!-- Top Badge: e.g. Free NTUC Vouchers! / Celebrate SG -->
  <g transform="translate(60, 130)">
    <rect width="260" height="42" rx="4" fill="${badgeBg}" />
    <text x="130" y="27" fill="${badgeColor}" font-size="16" font-weight="800" text-anchor="middle" letter-spacing="0.5">${badgeText}</text>
  </g>

  <!-- Main Promotion / Occasion Headline -->
  <g transform="translate(60, 235)">
    <text x="0" y="0" fill="#FFFFFF" font-size="44" font-weight="900" letter-spacing="-1">${headline}</text>
    <text x="0" y="45" fill="#E2E8F0" font-size="19" font-weight="500">${subtitle}</text>
  </g>

  <!-- Product Lineup Silhouette / Render Graphics in Brother Blue Section -->
  <g transform="translate(60, 330)">
    <!-- Product 1: Compact Label Printer Cube -->
    <rect x="0" y="30" width="55" height="55" rx="8" fill="#FFFFFF" opacity="0.95" />
    <rect x="10" y="40" width="35" height="15" rx="3" fill="#0f2ea2" opacity="0.3" />
    <circle cx="27" cy="68" r="4" fill="#0f2ea2" />

    <!-- Product 2: Inkjet All-in-One Printer -->
    <rect x="70" y="20" width="95" height="65" rx="6" fill="#1E293B" />
    <rect x="80" y="30" width="75" height="22" rx="3" fill="#334155" />
    <rect x="130" y="35" width="20" height="12" rx="2" fill="#38BDF8" />
    <rect x="80" y="60" width="75" height="18" fill="#0F172A" />

    <!-- Product 3: Desktop Label Printer -->
    <rect x="180" y="10" width="45" height="75" rx="6" fill="#F8FAFC" />
    <rect x="188" y="20" width="30" height="30" rx="3" fill="#0f2ea2" />

    <!-- Product 4: Sewing & Crafting Machine (Innov-is series) -->
    <path d="M 240 75 L 240 15 Q 270 10 325 15 L 325 40 L 290 40 L 290 75 Z" fill="#F8FAFC" />
    <rect x="248" y="22" width="28" height="20" rx="2" fill="#0f2ea2" opacity="0.3" />
    <rect x="240" y="70" width="90" height="15" rx="3" fill="#CBD5E1" />

    <!-- Product 5: Heavy Duty Laser Printer / Multi-Function Copier -->
    <rect x="345" y="0" width="90" height="85" rx="6" fill="#F8FAFC" />
    <rect x="345" y="0" width="90" height="25" rx="4" fill="#E2E8F0" />
    <rect x="355" y="35" width="70" height="20" fill="#CBD5E1" />
    <rect x="410" y="8" width="18" height="10" rx="2" fill="#0f2ea2" />
  </g>

  <!-- Legal / Footnote Note -->
  <text x="60" y="465" fill="rgba(255,255,255,0.7)" font-size="11" font-weight="400">* On selected models, terms and conditions apply. Singapore Official Channel.</text>
</svg>`;
}

/**
 * Template 2: Brother Modern Corporate Wave Style (From Screenshot 2 - Toner / E-Store Special)
 */
export function generateBrotherWaveCorporateSVG({
  badgeText = "Brother Official E-store Special",
  headline = "5% Off Toner Bundle Promotion",
  subtitle = "Purchase TN269C/M/Y/BK toners as a set & receive 5% off the bundle set*",
  promoTag = "Free Delivery",
  theme = "ai-thought"
}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 500" width="100%" height="100%" style="border-radius: 20px; font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;">
  <defs>
    <!-- Wave Gradient -->
    <linearGradient id="softCyanBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EBF5FF" />
      <stop offset="40%" stop-color="#D6EDFE" />
      <stop offset="100%" stop-color="#BAE6FD" />
    </linearGradient>
    <linearGradient id="tonerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0f2ea2" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="500" rx="20" fill="url(#softCyanBg)" />

  <!-- Smooth Flowing Cyan/Blue Wave Gradients (Right Side) -->
  <path d="M 600 500 Q 800 200 1200 250 L 1200 500 Z" fill="#7DD3FC" opacity="0.5" />
  <path d="M 700 0 Q 900 300 1200 150 L 1200 0 Z" fill="#38BDF8" opacity="0.35" />
  <path d="M 850 500 Q 1000 350 1200 400 L 1200 500 Z" fill="#0284C7" opacity="0.25" />

  <!-- Top Left: Brother Logo -->
  <g transform="translate(70, 50)">
    <text x="0" y="28" fill="#0f2ea2" font-size="32" font-weight="900" letter-spacing="0.5">brother</text>
    <text x="2" y="46" fill="#475569" font-size="13" font-style="italic" font-weight="600">at your side</text>
  </g>

  <!-- E-Store / Topic Badge -->
  <g transform="translate(70, 125)">
    <text x="0" y="0" fill="#0f2ea2" font-size="20" font-weight="800" letter-spacing="-0.2">${badgeText}</text>
    <g transform="translate(0, 12)">
      <circle cx="8" cy="8" r="6" fill="#0f2ea2" />
      <text x="22" y="12" fill="#0f2ea2" font-size="14" font-weight="700">${promoTag}</text>
    </g>
  </g>

  <!-- Main Headline -->
  <g transform="translate(70, 220)">
    <text x="0" y="0" fill="#0F172A" font-size="42" font-weight="900" letter-spacing="-1">${headline}</text>
    <text x="0" y="45" fill="#334155" font-size="18" font-weight="500" width="550">${subtitle.slice(0, 70)}</text>
  </g>

  <!-- 3-Pillar / Product Bundle Feature Cards on Right -->
  <g transform="translate(720, 140)">
    <!-- Toner Box 1: Cyan -->
    <g transform="translate(0, 80)">
      <rect width="90" height="140" rx="8" fill="#0F172A" />
      <rect width="90" height="25" rx="4" fill="#0f2ea2" />
      <text x="45" y="17" fill="#FFFFFF" font-size="10" font-weight="800" text-anchor="middle">brother</text>
      <rect x="10" y="70" width="70" height="20" rx="3" fill="#00D4FF" />
      <text x="45" y="125" fill="#FFFFFF" font-size="16" font-weight="800" text-anchor="middle">269 C</text>
    </g>

    <!-- Toner Box 2: Magenta -->
    <g transform="translate(100, 50)">
      <rect width="90" height="170" rx="8" fill="#0F172A" />
      <rect width="90" height="25" rx="4" fill="#0f2ea2" />
      <text x="45" y="17" fill="#FFFFFF" font-size="10" font-weight="800" text-anchor="middle">brother</text>
      <rect x="10" y="90" width="70" height="20" rx="3" fill="#EC4899" />
      <text x="45" y="150" fill="#FFFFFF" font-size="16" font-weight="800" text-anchor="middle">269 M</text>
    </g>

    <!-- Toner Box 3: Yellow -->
    <g transform="translate(200, 30)">
      <rect width="90" height="190" rx="8" fill="#0F172A" />
      <rect width="90" height="25" rx="4" fill="#0f2ea2" />
      <text x="45" y="17" fill="#FFFFFF" font-size="10" font-weight="800" text-anchor="middle">brother</text>
      <rect x="10" y="100" width="70" height="20" rx="3" fill="#EAB308" />
      <text x="45" y="170" fill="#FFFFFF" font-size="16" font-weight="800" text-anchor="middle">269 Y</text>
    </g>

    <!-- Toner Box 4: Black -->
    <g transform="translate(300, 10)">
      <rect width="95" height="210" rx="8" fill="#0F172A" />
      <rect width="95" height="25" rx="4" fill="#0f2ea2" />
      <text x="47" y="17" fill="#FFFFFF" font-size="10" font-weight="800" text-anchor="middle">brother</text>
      <rect x="10" y="110" width="75" height="20" rx="3" fill="#475569" />
      <text x="47" y="190" fill="#FFFFFF" font-size="18" font-weight="800" text-anchor="middle">269 BK</text>
    </g>
  </g>

  <!-- Footnote -->
  <text x="70" y="455" fill="#64748B" font-size="11">* Terms and conditions apply. Compatible with Brother Singapore authorized genuine supply.</text>
</svg>`;
}

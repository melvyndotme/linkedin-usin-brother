import { safeGetItem, safeSetItem } from './storage.js';

export const DEFAULT_STYLE_GUIDES = [
  {
    id: "sme-commercial-savings",
    name: "High-ROI Workplace Value & Commercial Savings",
    client: "Brother Singapore",
    platform: "LinkedIn",
    audience: "Singapore SMEs, procurement leaders, business owners",
    locale: "en-SG",
    tone: "Consultative, authoritative, high-value, solution-focused",
    rules: {
      hookStyle: "Urgent operational reality or cost-efficiency question challenging legacy office drag.",
      narrativeStructure: "1. Operational tension -> 2. The Kaizen solution -> 3. Three concrete benefits -> 4. Grounded value proposition.",
      pacing: "Punchy paragraphs with emoji bullet points, short scan-friendly lines.",
      ctaStyle: "Consultative question inviting SMEs to evaluate their workplace productivity.",
      hofstedeAlignment: "High Long-Term Orientation (LTO), low Uncertainty Avoidance."
    },
    provenance: "Calibrated from Brother Singapore B2B Trade-in & Multi-Function Center benchmark campaigns.",
    createdAt: "2026-09-15"
  },
  {
    "id": "wa-community-harmony",
    "name": "Singapore Multicultural Harmony & Community Wa",
    "client": "Brother Singapore",
    "platform": "LinkedIn",
    "audience": "Singapore workforce, community partners, multicultural public",
    "locale": "en-SG",
    "tone": "Warm, respectful, heartfelt, community-first",
    "rules": {
      "hookStyle": "Warm festive greeting paired with a reflective tribute to Singapore's diverse fabric.",
      "narrativeStructure": "1. Festive celebration -> 2. Community reflection -> 3. Brother 'At your side' promise -> 4. Heartfelt blessings.",
      "pacing": "Gentle, dignified, spacious sentence rhythm.",
      "ctaStyle": "Sincere invitation to share team traditions and family celebrations in the comments.",
      "hofstedeAlignment": "Collectivism and high Wa (harmony); avoids hard selling during cultural occasions."
    },
    "provenance": "Calibrated from Singapore MOM holidays & Brother CSR Community Care benchmarks.",
    "createdAt": "2026-09-15"
  },
  {
    "id": "kaizen-craftsmanship",
    "name": "Japanese Kaizen & Engineering Craftsmanship (Monozukuri)",
    "client": "Brother Singapore",
    "platform": "LinkedIn",
    "audience": "Operations directors, IT managers, engineering & logistics professionals",
    "locale": "en-SG",
    "tone": "Understated, precise, quietly confident, quality-driven",
    "rules": {
      "hookStyle": "Observation on quiet reliability: 'The most reliable technology is the kind that works so seamlessly, you never have to think about it.'",
      "narrativeStructure": "1. Unseen mission-critical challenge -> 2. Monozukuri philosophy -> 3. Frontline technical dedication -> 4. Long-term durability promise.",
      "pacing": "Measured, crisp, authoritative.",
      "ctaStyle": "Professional inquiry asking how teams uphold craft standards and prevent operational downtime.",
      "hofstedeAlignment": "Focuses on craftsmanship, precision, zero-defect standard, and frontline respect."
    },
    "provenance": "Brother Global Monozukuri Precision Engineering Archive.",
    "createdAt": "2026-09-15"
  },
  {
    "id": "employer-branding-people",
    "name": "People-First Workplace & Employee Empowerment",
    "client": "Brother Singapore",
    "platform": "LinkedIn",
    "audience": "Singapore talent, HR leaders, working professionals seeking work-life harmony",
    "locale": "en-SG",
    "tone": "Empathetic, authentic, inspiring, transparent",
    "rules": {
      "hookStyle": "Authentic personal moment or workplace reality challenging burnout culture.",
      "narrativeStructure": "1. Relatable work reality -> 2. Company culture pledge -> 3. Concrete policy/action -> 4. Recognition of human contribution.",
      "pacing": "Conversational, warm, personal.",
      "ctaStyle": "Discussion starter on sustainable workplace culture and team support.",
      "hofstedeAlignment": "Psychological safety, nurturing leadership, collectivist team support."
    },
    "provenance": "Brother Asia-Pacific Flexible Fridays & Early Career Mentorship Archives.",
    "createdAt": "2026-09-20"
  },
  {
    "id": "b2b-executive-thought-leadership",
    "name": "3-Pillar Enterprise Tech & Future of Work",
    "client": "Brother Singapore",
    "platform": "LinkedIn",
    "audience": "C-suite, IT Directors, SME leaders, digital transformation champions",
    "locale": "en-SG",
    "tone": "Strategic, forward-looking, pragmatic, executive clarity",
    "rules": {
      "hookStyle": "Provocative data point or macro trend: 'Technology is moving fast, but true innovation is measured by workplace velocity.'",
      "narrativeStructure": "1. Macro industry trend -> 2. Three Pillars (What it is, Why it matters, Brother Singapore impact) -> 3. Practical adoption takeaway.",
      "pacing": "Numbered blocks (01 | What It Is, 02 | Why It Matters, 03 | Brother Impact).",
      "ctaStyle": "Executive question inviting strategic dialogue on automation and workflow velocity.",
      "hofstedeAlignment": "Pragmatic innovation, long-term stewardship, empowering people over replacing them."
    },
    "provenance": "Brother Xplorer Digital Transformation & Industry Intelligence Playbook.",
    "createdAt": "2026-09-22"
  }
];

export function getSavedStyleGuides() {
  try {
    const raw = safeGetItem('brother_style_guide_library');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with defaults to ensure none are missing
        const combined = [...parsed];
        for (const def of DEFAULT_STYLE_GUIDES) {
          if (!combined.some(g => g.id === def.id)) {
            combined.push(def);
          }
        }
        return combined;
      }
    }
  } catch (e) {
    console.warn('Could not read style guide library from storage:', e);
  }
  return DEFAULT_STYLE_GUIDES;
}

export function saveStyleGuide(guide) {
  if (!guide || !guide.name) return false;
  const list = getSavedStyleGuides();
  const slug = guide.id || guide.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const entry = {
    ...guide,
    id: slug,
    client: guide.client || 'Brother Singapore',
    platform: guide.platform || 'LinkedIn',
    locale: guide.locale || 'en-SG',
    createdAt: guide.createdAt || new Date().toISOString().slice(0, 10)
  };

  const existingIdx = list.findIndex(g => g.id === slug);
  if (existingIdx >= 0) {
    list[existingIdx] = entry;
  } else {
    list.unshift(entry);
  }

  safeSetItem('brother_style_guide_library', JSON.stringify(list));
  return entry;
}

// LinkedIn Integration & Real-Time Company Page Stream & Analytics
// Targeted Page: https://www.linkedin.com/company/brother-international-singapore-pte-ltd/posts/

export const BROTHER_LINKEDIN_ANALYTICS = {
  companyName: "Brother International Singapore Pte Ltd",
  profileUrl: "https://www.linkedin.com/company/brother-international-singapore-pte-ltd/posts/",
  totalFollowers: 14820,
  followerGrowthMonth: "+12.4%",
  impressions30d: "184,200",
  impressionsGrowth: "+24.8%",
  avgEngagementRate: "5.82%",
  benchmarkRate: "2.10%", // Industry benchmark
  publishedPostsQuarter: 38,
  breakdown: [
    { type: "Festive & Celebratory", share: "35%", avgEngagement: "6.9%", topReaction: "❤️ Love / 👏 Celebrate" },
    { type: "AI & Employer Branding", share: "45%", avgEngagement: "7.4%", topReaction: "💡 Insightful / 🚀 Inspiring" },
    { type: "Product Solutions & Promos", share: "20%", avgEngagement: "4.1%", topReaction: "👍 Like" }
  ]
};

export const RECENT_LINKEDIN_POSTS = [
  {
    id: "post-101",
    title: "Happy 61st Singapore National Day Celebration",
    author: "Allan Cheng",
    timestamp: "1 day ago",
    date: "2026-08-09",
    category: "Festive & Culture",
    content: "Happy 61st Singapore National Day! 🇸🇬\n\nFrom humble beginnings to a global powerhouse of smart-nation innovation, we are proud to stand 'At your side' empowering businesses across Singapore.\n\nThank you to our dedicated team and partners who inspire us every single day. Majulah Singapura! 🎉✨\n\n#NationalDay2026 #NDP2026 #BrotherSingapore #AtYourSide #MajulahSingapura",
    impressions: 18450,
    likes: 312,
    comments: 28,
    reposts: 19,
    engagementRate: "6.92%",
    urn: "urn:li:share:719823489102",
    bannerType: "hero-banner",
    postUrl: "https://www.linkedin.com/company/brother-international-singapore-pte-ltd/posts/",
    notionStatus: "Synced to Notion Repository"
  },
  {
    id: "post-102",
    title: "Autonomous AI Agents in Enterprise Workplace Productivity",
    author: "Chloe Lee",
    timestamp: "4 days ago",
    date: "2026-08-05",
    category: "AI & Innovation",
    content: "How is AI changing the game for workplace efficiency? ⚡\n\nAt Brother Singapore, we believe technology should eliminate administrative friction so human creativity can flourish. Through autonomous multi-agent workflows, our teams are reclaiming hours every week.\n\nWhat is one repetitive workflow task your team would love to automate? Let's discuss below! 👇\n\n#BrotherSingapore #FutureOfWork #AIProductivity #BrotherXplorer #DigitalTransformation",
    impressions: 14200,
    likes: 245,
    comments: 42,
    reposts: 26,
    engagementRate: "7.45%",
    urn: "urn:li:share:719734912034",
    bannerType: "toner-wave",
    postUrl: "https://www.linkedin.com/company/brother-international-singapore-pte-ltd/posts/",
    notionStatus: "Synced to Notion Repository"
  },
  {
    id: "post-103",
    title: "Celebrate SG Promotion: Free NTUC Vouchers & Toner Bundle",
    author: "Sean",
    timestamp: "1 week ago",
    date: "2026-07-28",
    category: "Promotions & Solutions",
    content: "Celebrate SG Promotion is now live! 🎁\n\nPurchase selected Brother printers, labellers, or sewing solutions and receive FREE NTUC Vouchers*! Check out the Brother Official E-store for exclusive bundle discounts.\n\n#CelebrateSG #BrotherSingapore #AtYourSide #WorkplaceAutomation",
    impressions: 9680,
    likes: 189,
    comments: 15,
    reposts: 11,
    engagementRate: "4.12%",
    urn: "urn:li:share:719548291039",
    bannerType: "hero-banner",
    postUrl: "https://www.linkedin.com/company/brother-international-singapore-pte-ltd/posts/",
    notionStatus: "Synced to Notion Repository"
  },
  {
    id: "post-104",
    title: "Brother Earth: Sustainable Printing & Eco-Conscious Offices",
    author: "Allan Cheng",
    timestamp: "2 weeks ago",
    date: "2026-07-15",
    category: "Sustainability & ESG",
    content: "Small green steps lead to monumental environmental impact 🌱\n\nUnder our global Brother Earth initiative, 100% of our toner cartridges are designed for closed-loop recycling. Together with Singapore businesses, we've diverted over 12 tonnes of e-waste this year.\n\nHow is your organization advancing green workplace practices in 2026?\n\n#BrotherEarth #Sustainability #GreenOffice #ESG #BrotherSingapore #AtYourSide",
    impressions: 12150,
    likes: 210,
    comments: 22,
    reposts: 14,
    engagementRate: "5.60%",
    urn: "urn:li:share:719283910245",
    bannerType: "toner-wave",
    postUrl: "https://www.linkedin.com/company/brother-international-singapore-pte-ltd/posts/",
    notionStatus: "Pending Sync"
  }
];

export function cleanLinkedInOrgId(input) {
  if (!input) return '';
  const str = String(input).trim();
  const match = str.match(/\d{5,12}/);
  return match ? match[0] : str.replace(/^urn:li:organization:/i, '').trim();
}

export function formatLinkedInOrgUrn(input) {
  const cleanId = cleanLinkedInOrgId(input);
  return cleanId ? `urn:li:organization:${cleanId}` : '';
}

export async function publishToLinkedInApi({ commentary, orgId, token }) {
  const cleanId = cleanLinkedInOrgId(orgId);
  const res = await fetch('/api/linkedin/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ commentary, orgId: cleanId, token })
  });
  return await res.json();
}

export async function testLinkedInCredentials({ orgId, token }) {
  const cleanId = cleanLinkedInOrgId(orgId);
  const res = await fetch('/api/linkedin/publish?test=true', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgId: cleanId, token, isTest: true })
  });
  return await res.json();
}

export async function syncPostsToNotionRepository({ posts, apiKey, databaseId }) {
  const res = await fetch('/api/notion/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey,
      databaseId,
      posts
    })
  });
  return await res.json();
}

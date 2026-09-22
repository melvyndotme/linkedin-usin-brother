# Project Specification & Context Handoff (`AI_HANDOFF_SPEC.md`)
**Project Name**: Linked-Us-In (Brother Singapore LinkedIn Employee Advocacy & Content Portal)  
**Production URL**: https://linked-us-in.vercel.app  
**Repository**: `melvyndotme/linkedin-usin-brother` (GitHub) / `melvyndotme/linked-us-in` (Vercel)  
**Framework**: React 19 (Vite 6), Tailwind CSS v4, Vercel Serverless (Node.js ESM)  
**Last Updated**: September 22, 2026

---

## 1. Executive Summary & Purpose
**Linked-Us-In** is a specialized, enterprise-grade portal developed for **Brother Singapore**. Its primary objective is operationalizing corporate employee advocacy, brand thought leadership, and B2B engagement on LinkedIn.

The application enables Brother Singapore employees, marketing managers, and executives to:
1. Track upcoming Singapore public holidays (MOM calendar 2026), cultural festivals, and corporate milestones.
2. Search real-time industry news and trends across Singapore and Southeast Asia with zero external API dependencies.
3. Automatically generate on-brand LinkedIn copy across multiple psychological angles (Craftsmanship/Kaizen, Community Harmony/*Wa*, Employer Branding, Thought Leadership).
4. Generate branded 5-slide editorial carousels (1080×1080) and social banners using official Brother assets and curated event photography.
5. Review drafts through a Human-in-the-Loop review gate, preview posts in an authentic LinkedIn feed simulator, and publish directly to Brother Singapore's official LinkedIn Organization Page.

---

## 2. Technical Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────┐
│               Frontend: Vite + React 19                │
│  Tailwind CSS v4 • Lucide React • Native Canvas Canvas │
└──────────────┬─────────────────────────┬───────────────┘
               │                         │
     Direct Client Storage          API Proxy Layer
     (localStorage / Cache)         (/api/*)
               │                         │
               ▼                         ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   Client Engines & Lib   │  │ Vercel Serverless (ESM)  │
│  • serperEngine.js       │  │  • /api/serper/search.js  │
│  • imageTemplateEngine.js│  │  • /api/linkedin/publish  │
│  • draftGenerator.js     │  │  • /api/ai/media.js       │
│  • yamlTemplates.js      │  │  • /api/notion/sync.js    │
│  • storage.js            │  │  • /api/notion/team.js    │
└──────────────────────────┘  └──────────────────────────┘
```

### Frontend
- **Bundler**: Vite 6 (`vite.config.js` proxies `/api` to local port 3001 in development).
- **Core Library**: React 19 (`react`, `react-dom`).
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`).
- **Icons**: `lucide-react`.
- **Canvas Rendering**: Native HTML5 Canvas 2D rendering in `imageTemplateEngine.js` for zero-dependency graphic and slide generation.

### Backend / Serverless Functions (`api/`)
> **Crucial Infrastructure Constraint**: Vercel Hobby tier strictly limits deployments to **12 Serverless Functions**. All endpoints have been consolidated to maintain compliance:
1. `api/serper/search.js`: Real-time news search (Primary: Serper.dev API; Fallback: Google News Singapore live RSS).
2. `api/linkedin/publish.js`: LinkedIn Organization REST API post publisher with 365-day auto token refresh.
3. `api/linkedin/data.js`: LinkedIn organization analytics and post performance fetcher.
4. `api/auth/magic-link.js`: Passwordless authentication token issuer and magic link dispatcher.
5. `api/auth/linkedin/callback.js`: OAuth 2.0 callback handler for LinkedIn account connectivity.
6. `api/ai/media.js`: Multi-modal endpoint merging Gemini/Imagen 3 image generation and secure CORS image proxying.
7. `api/notion/sync.js`: Syncs curated templates and brand data with Brother's Notion workspace.
8. `api/notion/team.js`: Fetches and updates dynamic team directory from Notion without hardcoded members.
9. `api/notion/save-template.js`: Persists custom post templates into Notion database.
10. `api/mom/holidays.js`: Singapore Ministry of Manpower (MOM) public holidays API with static JSON backup.
11. `api/templates/ingest.js`: Ingests and parses YAML template definitions.
12. `api/blob.js`: Vercel Blob storage handler for uploaded image assets.

### Local Development Server (`server/index.js`)
- Runs a lightweight Node.js HTTP server on port 3001 adapting Vercel functions for local parity.
- Features a built-in Playwright scraper for competitive tracking against the LinkedIn Ad Library.

---

## 3. Core Modules & Component Map

| Component | Path | Responsibility |
| :--- | :--- | :--- |
| **Brother Header** | `src/components/BrotherHeader.jsx` | Global navigation bar with logo, theme toggle, and profile badge. |
| **Sidebar** | `src/components/Sidebar.jsx` | Main application navigation with official Brother brand accents. |
| **Module 1: Events** | `src/components/Module1EventPosts.jsx` | MOM calendar holidays, Singapore festivals, theme presets (blue/green/red/amber), custom event creation, 3-angle post generation. |
| **Module 2: News & Trends** | `src/components/Module2AIPosts.jsx` | Search engine for industry topics, timeframe filtering, reactive search, pre-seeded keywords (Work-Life Balance, Document Automation, etc.). |
| **Content Studio** | `src/components/DraftMediaStudio.jsx` | Unified drafting studio with template picker, dual-pane editor, visual studio, and 1-click LinkedIn publishing. |
| **Visual / Carousel Studio** | `src/components/ImageTemplateStudio.jsx` | 5-slide editorial carousel designer (1080×1080) and 1.91:1 banner generator with Brother asset library and event photo gallery. |
| **LinkedIn Simulator** | `src/components/LinkedInSimulator.jsx` | Realistic LinkedIn feed preview card with review gate controls, approval state, and post stats. |
| **Notion Hub** | `src/components/NotionDatabaseHub.jsx` | Team member directory, role management, and template database sync. |
| **Settings & Integrations** | `src/components/SettingsView.jsx` | Manages credentials: LinkedIn OAuth token, Serper API key, Gemini API key, and Notion integration secrets. |
| **Ads Tracker App** | `src/standalone/AdsTrackerApp.jsx` | Scrapes and inspects competitor LinkedIn ads (formats: Single Image, Carousel, Video). |

---

## 4. Key Subsystems & Business Logic

### A. Real-Time News Search (`src/lib/serperEngine.js` & `api/serper/search.js`)
- **Zero-Key Live Search**: When no paid Serper.dev API key is provided, the backend queries Google News Singapore's live RSS feed (`https://news.google.com/rss/search?q={query}&hl=en-SG&gl=SG&ceid=SG:en`).
- **Query Refinement**: Queries for `"Brother Singapore"` automatically expand to `'"Brother Singapore" OR (Brother printer Singapore) OR (Brother International Singapore)'` to isolate business and technology news from unrelated personal stories.
- **Dynamic Topical Fallback (`generateDynamicTopicalNews`)**: If the client is disconnected or running purely offline, it dynamically synthesizes 5 tailored articles for:
  - *Work-Life Balance, Wellbeing & FWA Guidelines*.
  - *Brother Singapore Hardware & Smart Document Solutions*.
  - *Any custom keyword* with direct Google News search links.

### B. 5-Slide Carousel Engine (`src/lib/imageTemplateEngine.js`)
- **Angle-Specific Storyboards**:
  - *Angle 1 (Wa / Harmony)*: Warm greeting $\rightarrow$ Shared table $\rightarrow$ Foundation $\rightarrow$ Community impact $\rightarrow$ Heartfelt CTA.
  - *Angle 2 (Kaizen / Craftsmanship)*: Headline problem $\rightarrow$ Japanese precision standard $\rightarrow$ Measurable impact $\rightarrow$ Sustainable practice $\rightarrow$ Strategic takeaway.
  - *Angle 3 (Internal Culture & Team)*: Pantry moment $\rightarrow$ Frontline dedication $\rightarrow$ Mentorship $\rightarrow$ People-first policy $\rightarrow$ Discussion question.
- **Multi-Image Sequences**: Each slide in a carousel automatically pulls a distinct curated photo from Brother's enterprise asset library or event photography (Slide 1: Hero visual, Slide 2: Cultural context, Slide 3: People, Slide 4: Brother Hardware, Slide 5: Community celebration).
- **Per-Slide Overrides**: Users can assign distinct photos per slide, apply one photo across all 5 slides, or reset to curated defaults.

### C. Draft Generation (`src/lib/draftGenerator.js` & `src/lib/yamlTemplates.js`)
- **Festive Posts**: 3 distinct Hofstede cultural angles (Warm Community Greeting, Values & Heritage Kaizen Reflection, Internal Team Culture).
- **News & Trends**: 5 structured B2B thought-leadership angles (3-Pillar Breakthrough Synthesis, Employee Empowerment & Kaizen, B2B Partner Trust, Sustainability & ESG, Strategic Industry Commentary).

### D. LinkedIn API Connectivity (`api/linkedin/publish.js`)
- **Target Organization**: Brother Singapore (`urn:li:organization:808877`).
- **Token Refresh**: Uses `refresh_token`, `client_id`, and `client_secret` to automatically refresh expired 60-day access tokens silently before executing publish requests.

---

## 5. Storage & Environment Variables

### Local Storage Keys (`src/lib/storage.js`)
- `key_serper`: Serper.dev API key.
- `key_gemini`: Google Gemini API key.
- `key_linkedin_token`: LinkedIn OAuth Access Token.
- `key_linkedin_refresh_token`: LinkedIn OAuth Refresh Token.
- `key_linkedin_org`: Target Organization ID (default `808877`).
- `key_notion_token`: Notion Integration Token.
- `cached_notion_team`: Cached dynamic team member array for instant UI rendering.

### Server Environment Variables (Vercel)
- `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_REFRESH_TOKEN`, `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_ORG_ID`
- `SERPER_API_KEY` or `VITE_SERPER_API_KEY` (Optional; RSS fallback operates if missing)
- `GEMINI_API_KEY`
- `NOTION_API_KEY`, `NOTION_DATABASE_ID`
- `BLOB_READ_WRITE_TOKEN`

---

## 6. Current Operational Backlog & Next Steps

If you are continuing development with another AI tool, here are the highest-priority enhancement candidates:

1. **LinkedIn Carousel PDF Multi-Page Exporter**:
   - *Context*: LinkedIn does not allow multiple loose PNGs to be uploaded as a carousel in standard feed posts. LinkedIn carousels are uploaded as **multi-page PDF documents** (via "Add a document").
   - *Action*: Add `jspdf` or canvas-to-pdf in `ImageTemplateStudio.jsx` to export all 5 slides into a single 1080×1080 multi-page PDF with 1 click.
2. **Direct Image Publishing via LinkedIn API**:
   - *Context*: `api/linkedin/publish.js` currently publishes text commentary.
   - *Action*: Implement LinkedIn REST Assets API (`registerUpload` $\rightarrow$ upload binary to uploadUrl $\rightarrow$ attach asset URN to post payload) to enable 1-click publishing of generated graphics and carousels directly to LinkedIn.
3. **Automated Weekly Topic Alerts**:
   - *Context*: Enabling marketing POD leads to receive scheduled digests of trending Singapore workplace and document automation news.

---

## 7. Verification & Build Commands

```bash
# Install dependencies
npm install

# Start local frontend
npm run dev

# Start local mock API server (optional)
npm run server

# Production build verification
npm run build
```
Build verification passes cleanly with exit code `0` and generates `dist/assets/`.

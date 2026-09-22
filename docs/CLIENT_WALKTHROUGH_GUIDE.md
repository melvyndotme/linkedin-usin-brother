# Linked-Us-In: Client Walkthrough & User Guide
### Brother Singapore LinkedIn Employee Advocacy & Content Generation Portal

> **Production Application**: [https://linked-us-in.vercel.app](https://linked-us-in.vercel.app)  
> **Client**: Brother International Singapore Pte Ltd  
> **Brand Motto**: *"At your side"* | **Design System**: Brother Precision Blue (`#003399`), Deep Slate (`#0B132B`), Emerald ESG (`#059669`)  
> **Version**: 2.4.0 Enterprise Edition (Updated September 2026)

---

## Executive Summary & Solution Architecture

**Linked-Us-In** is a purpose-built B2B employee advocacy and content orchestration platform tailored specifically for **Brother Singapore**. It solves the central operational challenge facing enterprise technology teams on LinkedIn: *empowering technical specialists, sales directors, and marketing leads to consistently publish high-authority thought leadership without spending hours writing from scratch.*

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               LINKED-US-IN PLATFORM                                     │
├───────────────────────┬────────────────────────┬───────────────────────────────────────┤
│    DISCOVERY & TRENDS │   CREATIVE STUDIO      │        GOVERNANCE & ADVOCACY          │
├───────────────────────┼────────────────────────┼───────────────────────────────────────┤
│ • MOM 2026 Calendar   │ • Dual-Pane Post Draft │ • Notion Employee Roster Sync         │
│ • Cultural Angle Gen  │ • Fold-Line Visualizer │ • LinkedIn OAuth 2.0 Integration     │
│ • Real-time News RSS  │ • 5-Slide Visual Studio│ • Advocacy Scorecard & Leaderboard    │
│ • 5 B2B Angle Engines │ • 11 Curated Blueprints│ • Admin PIN Security Locks            │
└───────────────────────┴────────────────────────┴───────────────────────────────────────┘
```

---

## Table of Contents
1. [Module 0: Access & Authentication](#module-0-access--authentication)
2. [Module 1: Executive Mission Control (Dashboard)](#module-1-executive-mission-control-dashboard)
3. [Module 2: Festive & Cultural Calendar Hub](#module-2-festive--cultural-calendar-hub)
4. [Module 3: Real-Time News & Industry Trends Engine](#module-3-real-time-news--industry-trends-engine)
5. [Module 4: Unified Content Studio & Visual Carousel Designer](#module-4-unified-content-studio--visual-carousel-designer)
6. [Module 5: Template Ingestion Studio](#module-5-template-ingestion-studio)
7. [Module 6: Employee Advocacy Directory](#module-6-employee-advocacy-directory)
8. [Module 7: System Settings & Integrations](#module-7-system-settings--integrations)
9. [Operational Best Practices for Brother SG Advocates](#operational-best-practices-for-brother-sg-advocates)

---

## Module 0: Access & Authentication

The Linked-Us-In portal enforces enterprise domain security while maintaining a frictionless, passwordless login flow.

![Login Page - Brother Singapore Portal](screenshots/01_login_page.png)

### Key Features:
- **Passwordless Magic Links**: Advocates sign in using their corporate email. No passwords to remember or compromise.
- **Strict Domain Whitelisting**: Authentication is restricted to `@brother.com.sg`, `@brother.sg`, and approved Brother corporate domains.
- **Enterprise Session Tokens**: Cryptographically signed tokens stored in local browser state with automatic expiry.
- **Instant Demo Mode**: For internal workshops and demos, append `?token=demo-auth&email=allan.cheng@brother.com.sg` to access the portal in test mode.

### How to Use:
1. Navigate to the portal URL in your desktop or mobile browser.
2. Enter your Brother corporate email address (`name@brother.com.sg`).
3. Click **"Send Magic Link"**. Check your corporate inbox for the sign-in link.
4. Click the link to securely access your personalized advocacy dashboard.

---

## Module 1: Executive Mission Control (Dashboard)

Upon logging in, team members and executives are greeted by the **Executive Mission Control**, delivering real-time advocacy telemetry and direct access to active modules.

![Executive Mission Control Dashboard](screenshots/02_home_dashboard.png)

### Key Features:
- **Telemetry KPI Banners**:
  - **5,240+ Corporate Followers**: Real-time tracking of the official Brother Singapore LinkedIn page audience.
  - **6 Active Advocates**: Key division leaders actively driving employee-generated impressions.
  - **25k Weekly Target Impressions**: Advocacy reach goal progress tracker.
  - **88/100 Advocacy Health Score**: Composite metric measuring publishing frequency, template compliance, and hashtag governance.
- **Live Official Benchmark Feed**: Real-time preview of the corporate Brother SG LinkedIn feed, allowing advocates to easily reshare or quote corporate announcements.
- **Module Quick Launcher**: Single-click routing directly into the Festive Calendar, News Engine, Content Studio, Template Studio, Team Directory, or Settings.

---

## Module 2: Festive & Cultural Calendar Hub

Singapore is a multi-cultural business hub. The **Festive & Cultural Hub** tracks all gazetted Ministry of Manpower (MOM) 2026 public holidays and cultural festivals, automatically generating authentic, culturally resonant LinkedIn angles.

![Module 1: Singapore MOM 2026 Calendar Hub](screenshots/03_module1_events_calendar.png)

### 4 Theme Classification Badges:
1. **Corporate & Innovation (Blue)**: Brother milestone anniversaries, product launches, customer appreciation weeks.
2. **Sustainability & ESG (Green)**: Brother Earth initiatives, e-waste recycling drives, paper-saving technologies.
3. **MOM Public Holidays (Red)**: Official statutory holidays (National Day, Chinese New Year, Hari Raya Puasa, Deepavali, Labour Day).
4. **Cultural & Community (Amber)**: Regional festivities, Mid-Autumn Festival, SME innovation weeks.

### Cultural Angle Generator (Hofstede Tuning):
Each event card features an automated angle generator that drafts authentic B2B narratives rooted in Japanese corporate philosophy and Singaporean workplace culture:
- **Wa (Harmony & Community)**: Emphasizing family, festive togetherness, and collective achievement.
- **Kaizen (Continuous Improvement)**: Celebrating craftsmanship and process optimization during quiet holiday periods.
- **Team Solidarity**: Honoring frontline operations, customer support, and field service engineers.

![Custom Corporate Event Modal](screenshots/04_module1_custom_event_modal.png)

### How to Add a Custom Corporate Event / Promotion:
1. Click the **"+ Add Custom Event"** button at the top of the calendar.
2. Enter the **Event Title** (e.g. *"Brother SME Trade-In Expo 2026"*).
3. Select the **Event Date** and assign a **Theme Category** (Blue, Green, Red, or Amber).
4. Enter internal tags (e.g. `promo`, `b2b`, `esg`) and click **"Save Event"**. The event will immediately appear with an active countdown card.
5. Click **"Generate Angles"** on any card to create ready-to-use post drafts.

---

## Module 3: Real-Time News & Industry Trends Engine

The **News & Trends Engine** continuously monitors Singapore tech, business, and enterprise developments using a zero-API-key Google News RSS aggregation pipeline.

![Module 2: Real-Time News & Trends Engine](screenshots/05_module2_news_trends.png)

### 5 Industry Keyword Streams:
1. **AI Office Automation**: Workflow optimization, intelligent document capture, robotic process automation.
2. **Cybersecurity & Print Security**: Firmware integrity, endpoint document protection, PDPA compliance for office printers.
3. **Sustainable Tech & ESG**: Low-energy hardware, non-toxic toners, closed-loop recycling in Singapore offices.
4. **Hybrid Work & Enterprise Print**: Distributed office infrastructure, secure pull-printing, mobile print management.
5. **Singapore SME Tech Adoption**: Productivity Solutions Grant (PSG), digital transformation trends among local enterprises.

![B2B Thought Leadership Angles](screenshots/06_module2_b2b_drafts.png)

### 5 Thought-Leadership Angles Per Story:
When an advocate selects a news headline (e.g. from *The Straits Times*, *Singapore Business Review*, or *The Business Times*), the engine instantly formulates 5 distinct perspectives:
- **Executive POV**: High-level strategic commentary tailored for Directors and C-suite leaders.
- **Industry Analysis**: Macro analysis connecting trends to printing, logistics, and document management.
- **Solution / Practical**: Actionable tips and tactical best practices for IT managers and procurement teams.
- **Provocative / Contrarian**: Counter-intuitive viewpoints that spark productive engagement and comments.
- **Culture / Workplace**: The human impact on employee productivity, flexible work models, and office well-being.

Clicking **"Send to Content Studio"** automatically populates the chosen angle and article reference into the editor.

---

## Module 4: Unified Content Studio & Visual Carousel Designer

The **Content Studio** is the flagship creative workshop of Linked-Us-In. It combines a professional copy editor with a dedicated 5-slide visual carousel generator.

![Content Studio Dual-Pane Interface](screenshots/07_content_draft_studio.png)

### Key Features of the Left Pane (Post Copy & Narrative Editor):
- **Live Character & Word Counters**: Real-time monitoring against optimal LinkedIn engagement lengths.
- **Interactive "Mobile Fold Line" Visualizer**: Clearly marks the crucial 140–210 character threshold where LinkedIn truncates text behind the `...see more` button. This guarantees your hook is visible before users scroll.
- **Smart Hashtag Manager**: Automated insertion of compliant corporate hashtags (`#BrotherSingapore`, `#AtYourSide`, `#PrintSmart`, `#ESG`).

![Template Library Modal](screenshots/08_content_studio_template_library_modal.png)

### 11 Curated Benchmark Blueprints:
Clicking **"Template Library"** opens an enterprise repository of proven high-engagement structures:
1. **Industry Contrarian**: Challenge conventional industry thinking with data.
2. **Problem-Agitation-Solution (PAS)**: Address an office pain point and reveal the solution.
3. **Case Study / Client Transformation**: Before-and-after operational improvements.
4. **Step-by-Step Educational Framework**: Actionable 3-to-5 step workflow tutorial.
5. **Myth Buster vs Reality**: Debunk common printing or cybersecurity misconceptions.
6. **Event Reflection & Key Takeaways**: Post-conference or expo thought leadership.
7. **Product Behind-The-Scenes**: R&D, Japanese precision engineering (*Takumi*), and reliability testing.
8. **Customer Success Spotlight**: Real-world Singapore enterprise deployment story.
9. **Tech Deep Dive**: Firmware security, network encryption, and print management protocols.
10. **ESG & Sustainability Milestone**: Measurable e-waste reductions and eco-packaging milestones.
11. **Leadership Lesson**: Personal reflections from Brother department heads.

---

### Visual Carousel Designer (Right Pane)

Carousels (PDF documents) generate the highest click-through and dwell time on LinkedIn. The built-in visual studio generates pixel-perfect 1080x1080 square slides ready for export.

![Visual Studio Slide 2 Layout](screenshots/08_visual_carousel_studio.png)

### Slide Architecture:
- **Slide 1: The Hook Cover**: Bold typography, high-contrast kicker, and compelling challenge.
- **Slide 2: Context / The Problem**: Visual breakdown of the dilemma facing modern offices.
- **Slide 3: The Framework / Core Insight**: Diagram, bulleted principles, or benchmark metrics.
- **Slide 4: The Proof / Technology in Action**: Brother SG enterprise hardware showcase (HL-L6400DW laser, MFC-J6940DW A3 inkjet, P-touch labellers).
- **Slide 5: Call to Action (CTA)**: Clear next step, consultation link, and branded closing banner.

![Visual Studio Typography & Text Editor](screenshots/09_visual_studio_text_editor.png)

### Visual Customization Controls:
- **Typography & Scale**: Adjustable font hierarchy (Heading 1, Heading 2, Subtext, Eyebrow).
- **Brand Contrast Themes**: Brother Deep Blue (`#003399`), Obsidian Slate (`#0B132B`), Pure Light Mode, and Emerald ESG (`#059669`).
- **Layout Alignment**: Left-aligned editorial or centered presentation format.
- **Brother SG Asset Sequence**: Toggle between official enterprise printer photography and graphic badge overlays.
- **Brother "At your side" Watermark**: Ensures brand attribution across every slide download.

![Realistic LinkedIn Simulator](screenshots/09_linkedin_simulator.png)

### Realistic LinkedIn Feed Simulator:
Clicking the **"Simulator"** tab switches to an authentic simulation of the LinkedIn feed on both mobile and desktop. Advocates can verify:
- Exactly where their text breaks before the `...see more` button.
- How the carousel swipe appears with author headline, profile image, and timestamp.
- Realistic engagement metrics and comment section styling.

---

## Module 5: Template Ingestion Studio

The **Template Ingestion Studio** allows marketing administrators to reverse-engineer high-performing LinkedIn posts from external thought leaders or competitors and convert them into reusable internal blueprints.

![Template Ingestion Studio](screenshots/10_template_ingestion_studio.png)

### 3 Ingestion Modalities:
1. **Direct LinkedIn Post URL**: Paste the URL of any public post.
2. **Screenshot Upload**: Upload a PNG/JPG capture of a high-engagement post.
3. **PDF Document / Carousel Upload**: Upload an existing multi-page slide deck.

### Structural Deconstruction Engine:
When an asset is ingested, the system analyzes and extracts:
- **Hook Mechanics**: Questions, statistics, contrarian statements, or story hooks.
- **Pacing & Line Breaks**: Cadence of whitespace and paragraph length.
- **Call-to-Action Strategy**: Question-based engagement, document downloads, or direct message prompts.
- **Automatic Blueprint Generation**: Instantly saves the template into your team's library with placeholders for Brother SG specific content.

---

## Module 6: Employee Advocacy Directory

Employee advocacy succeeds when the entire organization participates. The **Team Directory** connects directly to Brother Singapore's Notion database to display active advocates, departmental coverage, and individual performance.

![Team Directory & Advocate Management](screenshots/11_team_directory.png)

### Active Advocate Roster:
- **Allan Cheng**: POD Lead & Enterprise Print Solutions Specialist
- **Sarah Tan**: Marketing Communications & PR Manager
- **David Lim**: Senior B2B Product Specialist
- **Michelle Koh**: Enterprise Sales Director
- **Kelvin Wong**: Technical Support & Solutions Engineering Lead
- **Rachel Neo**: People Experience & Workplace Culture Champion

### Management Capabilities:
- **Filter by Department**: Focus on Sales, Marketing, Technical, or HR advocacy initiatives.
- **Approval Tracking**: Track the number of approved and published articles per advocate.
- **One-Click Notion Re-Sync**: Synchronize role changes, new hires, or profile updates directly from Notion without restarting servers.

---

## Module 7: System Settings & Integrations

The **Settings & Integrations** center provides marketing administrators with centralized control over API connections, security credentials, and system parameters.

![System Settings & Connected Integrations](screenshots/12_settings_integrations.png)

### Integrated Services Status:
1. **Notion Database Integration**: Synchronizes team rosters, content calendar databases, and template blueprints.
2. **LinkedIn OAuth 2.0 API**: Direct channel for publishing updates, verifying personal profile connections, and pulling feed analytics.
3. **MOM Singapore Public Holiday API**: Connects to the official statutory calendar to keep holiday countdowns current.
4. **Resend Transactional Email API**: Delivers secure, instant login magic links to advocates.

### Security & Governance Locks:
- **Admin PIN Lock**: Critical configuration toggles are protected by an administrative PIN to prevent accidental modifications by general users.
- **Allowed Domain Enforcement**: Guarantees that only authorized corporate emails can authenticate.

---

## Operational Best Practices for Brother SG Advocates

### The 3-2-1 Weekly Advocacy Rhythm:
- **3 Thoughtful Comments**: Comment on target clients', partners', or Singapore business leaders' posts.
- **2 Curated Industry Shares**: Use **Module 2** to share an AI or ESG news story with an Executive or Practical POV.
- **1 Original Carousel / Deep Dive**: Use **Module 4** with the *Problem-Agitation-Solution* or *Case Study* template, publishing a 5-slide visual carousel showcasing Brother reliability and innovation.

### Preserving the "At your side" Voice:
- Ground every technical discussion in customer benefit: How does this printer feature eliminate downtime for a busy Singapore SME?
- Embrace Japanese craftsmanship (*Takumi*) with pride, highlighting Brother's rigorous testing and eco-friendly manufacturing.
- Maintain professional, accessible language, avoiding overly promotional jargon.

---
*Linked-Us-In Portal Documentation | Prepared for Brother International Singapore Pte Ltd*

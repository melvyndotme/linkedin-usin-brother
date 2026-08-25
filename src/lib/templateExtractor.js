// Template Library Extractor & Instructional Placeholder Engine

export const BENCHMARK_TEMPLATES = [
  {
    id: "tmpl-brother-kaizen",
    source: "Brother Global / Brother AP Benchmark",
    name: "Kaizen Innovation & Precision Superpowers",
    category: "Productivity & Solutions",
    tone: "Inspiring, authoritative, human-centric, Kaizen-grounded",
    description: "Deconstructed from top-performing Brother Global posts on continuous improvement and digital ease.",
    frontmatterYaml: `---
id: "brother_kaizen_productivity"
source_account: "Brother Global / AP Benchmark"
category: "Workplace Innovation"
tone: "Inspiring, authoritative, human-centric"
target_audience: "Singapore Enterprise Leaders & Operations Managers"
hook_archetype: "Pain-to-Superpower Transition"
---`,
    placeholderTemplate: `[Insert Hook: Provocative question challenging manual friction, e.g. "What if your team could eliminate 5 hours of administrative coordination every week? ⏳"]

[State the Workplace Problem: Describe the 1-2 repetitive friction points draining team focus in Singapore enterprises]

At Brother Singapore, our 'At your side' philosophy is rooted in Kaizen — continuous, human-centered improvement. Here is how modern workplaces are unlocking breakthrough efficiency:

• [Superpower 1: Automated task ingestion & document synthesis]
• [Superpower 2: Zero-defect verification maintaining quality with zero fatigue]
• [Superpower 3: Seamless cross-departmental handoffs without manual re-entry]

[Brother Connection: How Brother Singapore solutions/printers/scanners/AI workflows stand beside local teams to make this a reality]

[Insert Call to Action: Conversational question inviting followers to share their biggest workflow bottleneck 👇]

#BrotherSingapore #AtYourSide #Kaizen #WorkplaceInnovation #FutureOfWork #DigitalTransformation`,
    examplePost: `What if your team could eliminate 5 hours of administrative coordination every week? ⏳

In today's fast-moving business landscape, high-performing teams shouldn't be bogged down by manual data re-entry and fragmented approvals.

At Brother Singapore, our 'At your side' philosophy is rooted in Kaizen — continuous, human-centered improvement. Here is how modern workplaces are unlocking breakthrough efficiency:

• Automated document ingestion transforming paper workflows into real-time digital actions
• Intelligent verification maintaining high precision with near-zero error rates
• Frictionless cross-team collaboration empowering employees to focus on strategic creativity

When technology takes care of the routine, your people are free to innovate.

What is one repetitive workflow task your team would love to automate this quarter? Share with us below! 👇

#BrotherSingapore #AtYourSide #Kaizen #WorkplaceInnovation #FutureOfWork #DigitalTransformation`
  },
  {
    id: "tmpl-competitor-b2b-case",
    source: "Canon / Epson Singapore Competitor Benchmark",
    name: "Enterprise Cost & Waste Reduction Case",
    category: "B2B Sustainability & ROI",
    tone: "Data-driven, persuasive, practical, eco-conscious",
    description: "Reverse-engineered from top competitor B2B campaign posts highlighting total cost of ownership and green office credentials.",
    frontmatterYaml: `---
id: "b2b_sustainability_roi"
source_account: "Competitor Market Benchmark"
category: "B2B Sustainability & Solutions"
tone: "Data-driven, persuasive, eco-conscious"
target_audience: "Procurement & Sustainability Heads"
hook_archetype: "Surprising Data Metric Hook"
---`,
    placeholderTemplate: `[Insert Hook: Start with a hard-hitting data point, e.g. "Did you know that 30% of enterprise print and energy waste is completely preventable? 🌿📊"]

[State the Hidden Cost: Explain how legacy equipment and unmonitored consumables drain budgets and increase carbon footprint]

Smart businesses across Singapore are rethinking workplace infrastructure:
✔️ [Benefit 1: High-yield genuine consumables cutting replacement cycles by X%]
✔️ [Benefit 2: Low-energy standby modes certified under global eco standards]
✔️ [Benefit 3: Centralized fleet management tracking usage metrics in real time]

[Brother Earth Connection: Reaffirm Brother Singapore's 5R environmental commitments and local e-waste recycling programs]

[Insert Call to Action: Invite readers to download a green office audit checklist or discuss sustainability goals 👇]

#BrotherSingapore #BrotherEarth #SustainabilityInAction #GreenOfficeSG #SmartOperations`,
    examplePost: `Did you know that 30% of enterprise print and energy waste is completely preventable? 🌿📊

As Singapore organizations accelerate their green transition, sustainable workplace technology is no longer optional — it is a smart business advantage.

By modernizing your office fleet with high-efficiency hardware:
✔️ High-yield consumables reduce packaging waste and operational downtime
✔️ Intelligent eco-modes lower energy consumption by up to 40%
✔️ Smart monitoring provides transparent visibility over departmental usage

At Brother Singapore, our Brother Earth initiative is dedicated to walking beside you on your ESG journey.

How is your office reducing carbon footprint this year? Let's discuss below! 👇

#BrotherSingapore #BrotherEarth #SustainabilityInAction #GreenOfficeSG #SmartOperations`
  },
  {
    id: "tmpl-brother-festive-spotlight",
    source: "Brother AP Social Community Benchmark",
    name: "Multicultural Community & Team Spotlight",
    category: "Culture & Employer Branding",
    tone: "Warm, authentic, inclusive, celebratory",
    description: "Derived from high-engagement Brother regional holiday and employee culture stories.",
    frontmatterYaml: `---
id: "brother_community_spotlight"
source_account: "Brother AP Community Benchmark"
category: "Culture & Celebrations"
tone: "Warm, authentic, inclusive"
target_audience: "Singapore Community, Employees, Prospective Talent"
hook_archetype: "Festive Multiracial Celebration Hook"
---`,
    placeholderTemplate: `[Insert Festive Hook: Energetic celebration greeting for the occasion, e.g. "Happy [Occasion Name] to all our friends, partners, and colleagues across Singapore! 🌟✨"]

[Cultural Reflection: Briefly highlight the core value of the holiday — unity, gratitude, renewal, or family bonding]

[Brother Singapore Office Moment: Share a glimpse of how our diverse team is marking the festival together (pantry treats, decorations, cultural sharing)]

[People-First Message: Emphasize that our team's diverse strengths and shared respect are what power our 'At your side' promise every day]

[Insert Call to Action: Ask followers how their teams and families are celebrating this special day 👇]

#BrotherSingapore #LifeAtBrother #CelebrateTogether #AtYourSide #PeopleFirst #[OccasionHashtag]`,
    examplePost: `Happy Singapore National Day to all our friends, partners, and colleagues across the nation! 🇸🇬✨

61 years of sovereignty, resilience, and forward progress — built on the united strength of our multicultural community.

At Brother Singapore, we are proud to stand 'At your side' as local businesses and communities continue to pioneer new heights.

From our Brother family to yours, we wish everyone a vibrant and joyous National Day celebration with your loved ones! 🎉

Majulah Singapura! 

#BrotherSingapore #NDP2026 #NationalDay2026 #MajulahSingapura #AtYourSide #LifeAtBrother`
  }
];

export function extractTemplateFromInput({ type, content, title = "Custom Extracted Template" }) {
  return {
    id: `tmpl-extracted-${Date.now()}`,
    source: type === 'url' ? `Live Post: ${content}` : type === 'screenshot' ? 'Screenshot Image Analysis' : 'PDF Document Archive',
    name: title,
    category: "Extracted Competitive Benchmark",
    tone: "Persuasive, structured, instructional",
    description: "Reverse-engineered using Gemini Multimodal Vision & Structure Extractor.",
    frontmatterYaml: `---
id: "custom_extracted_${Date.now()}"
source_type: "${type}"
extracted_at: "${new Date().toISOString().slice(0, 10)}"
category: "Extracted Benchmark"
tone: "Structured, high-impact"
---`,
    placeholderTemplate: `[Insert Hook: Highlight the core insight or compelling question that stops the scroll within 120 characters]

[State the Context: Introduce the key challenge or announcement relevant to Singapore enterprise audiences]

Key Highlights & Takeaways:
🔹 [Point 1: Describe the primary achievement, feature, or metric]
🔹 [Point 2: Explain why this matters for operational velocity]
🔹 [Point 3: Connect to human empowerment and practical utility]

[Brother Singapore Angle: Reiterate how Brother stands 'At your side' with trusted local support]

[Insert Call to Action: Invite comments, questions, or perspectives from the community 👇]

#BrotherSingapore #AtYourSide #WorkplaceInnovation #SingaporeBusiness`,
    examplePost: content ? `Extracted sample post inspired by:\n${content.slice(0, 280)}...` : "Sample post ready to be drafted with this new template."
  };
}

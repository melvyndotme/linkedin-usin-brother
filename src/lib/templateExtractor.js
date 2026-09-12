// Template Library Extractor & Instructional Placeholder Engine (Calibrated for Asia-Pacific & Singapore Hofstede Framework)

export const BENCHMARK_TEMPLATES = [
  {
    id: "tmpl-eb-flexibility-sg",
    source: "Brother Asia-Pacific Cultural Benchmark",
    name: "Workplace Flexibility & Family Wellbeing",
    category: "Employer Branding & Culture",
    tone: "Warm, respectful, grounded, empathetic",
    description: "Calibrated for Asian work-life harmony \u2014 framing flexibility as responsible self-management and dedication to family care rather than mere casualness.",
    frontmatterYaml: `---
id: "eb_tangible_perk_flexibility"
source_account: "Brother Asia-Pacific Benchmark"
category: "Employer Branding & Culture"
tone: "Warm, respectful, empathetic"
target_audience: "Singapore professionals, working parents, talent seeking sustainable work-life integration"
hofstede_alignment:
  collectivism: "Honors family harmony and personal wellbeing, recognizing employees as holistic community members"
  long_term_orientation: "Prevents burnout to sustain multi-year loyalty, health, and consistent excellence"
  power_distance: "Demonstrates managerial trust; leadership empowers teams rather than policing face-time"
---`,
    placeholderTemplate: `[Insert Hook: Acknowledge the intense pace of modern professional life in Singapore and the pressure of meeting fatigue, e.g. "In a fast-paced business hub like Singapore, sustainable performance requires space to breathe."]

[State the Cultural Reality: Reflect on the struggle between demanding professional goals and precious family/personal commitments]

At Brother, our 'At your side' philosophy begins with our own team. Flexibility is designed into our rhythm year-round:
• [Protected Focus Block: Describe meeting-free Friday afternoons dedicated to uninterrupted deep work]
• [Autonomy & Trust: Detail how teams are trusted to depart early for family commitments once goals are met]
• [Holistic Well-being: Emphasize that management evaluates outcomes, care, and quality — never mere chair-time]

[Everyday Life Reflection: Describe what this looks like in practice — beating the evening commute, having dinner with family, or recharging mindfully for the week ahead]

[Insert Call to Action: Invite fellow professionals to share how their teams support work-life integration 👇]

#BrotherSingapore #AtYourSide #LifeAtBrother #WorkLifeHarmony #FutureOfWork #PeopleFirst`,
    examplePost: `In a fast-paced business hub like Singapore, sustainable performance requires space to breathe.

Many organizations speak about work-life harmony, but in the thick of busy project sprints, personal time is often the first thing compromised.

At Brother, our 'At your side' philosophy starts by taking care of our people. Flexibility isn't a seasonal privilege — it is a year-round commitment to sustainable excellence.

Through our Flexible Fridays approach:
• Friday afternoons are protected focus time: no internal meeting invites, allowing teams to wrap up their week with clarity and calm.
• Teammates who complete their weekly deliverables have the autonomy to sign off early to beat the commute, care for their parents or children, or simply recharge.
• We measure success by the quality of our outcomes and the care we bring to our partners — not by how late an office light stays on.

When employees are supported as whole individuals, dedication and creativity naturally follow.

How does your team cultivate balance at the end of a demanding week? Let us know below! 👇

#BrotherSingapore #AtYourSide #LifeAtBrother #WorkLifeHarmony #FutureOfWork #PeopleFirst`
  },
  {
    id: "tmpl-eb-early-career-sg",
    source: "Brother Asia Early Talent & Mentorship Archive",
    name: "Early Career Mentorship & Real Ownership",
    category: "Talent Acquisition & Internships",
    tone: "Nurturing, inspiring, grounded, empowering",
    description: "Aligns with the Asian Senpai-Kohai mentorship dynamic \u2014 pairing young talent with senior leaders for foundational skill-building (Kaizen).",
    frontmatterYaml: `---
id: "eb_real_work_early_career"
source_account: "Brother Asia Mentorship Archive"
category: "Talent Acquisition & Early Career"
tone: "Nurturing, inspiring, empowering"
target_audience: "Polytechnic & university students, fresh graduates, early-career professionals"
hofstede_alignment:
  power_distance: "Senior leaders act as accessible mentors (Senpai-Kohai), bridging hierarchy with guidance"
  long_term_orientation: "Invests in foundational skill-building (Kaizen) and future-readiness for a lifelong career"
  collectivism: "Welcomes young talent warmly into the Brother team family with genuine cross-functional support"
---`,
    placeholderTemplate: `[Insert Hook: Challenge the stereotype of passive training or menial administrative tasks, e.g. "A meaningful internship shouldn't just be an observation exercise. It should be a launchpad for real capability."]

[Cohort Context: Introduce the young talent cohort joining across technical, supply chain, marketing, or legal functions]

From Day One, our senior leaders and teams walk alongside them to provide real ownership:
🔹 [Hands-On Contribution 1: Delivering real customer workflows, data analytics, or supply chain enhancements]
🔹 [Mentorship Touchpoint 2: Direct guidance and feedback from experienced department heads]
🔹 [Capability Workshop 3: Structured learning sessions on professional branding, industry standards, and teamwork]

[Gratitude to the Youth: Praise their curiosity, diligent work ethic, and fresh perspectives that enrich the wider team]

[Insert Call to Action: Invite aspiring graduates and students to connect or explore early-career opportunities 👇]

#BrotherSingapore #EarlyCareer #MentorshipInAction #Kaizen #FutureLeaders #LifeAtBrother`,
    examplePost: `A meaningful internship shouldn't just be an observation exercise. It should be a launchpad for real capability.

When young talent is entrusted with real projects and guided by experienced mentors, breakthrough learning happens.

Over the past semester, our student interns didn't sit on the sidelines. Embedded directly within our engineering, supply chain, and business development teams, they:
🔹 Contributed to real automation projects and client workflow optimizations
🔹 Received close, one-on-one mentorship from senior department leaders on problem-solving and professional communication
🔹 Participated in tailored professional growth workshops to sharpen their career navigation and industry readiness

In the spirit of Kaizen, investing in the next generation is how we build long-term resilience for our industry.

To our latest cohort: thank you for your curiosity, diligence, and positive energy. We are honored to be part of your growth journey! 🎓🌟

#BrotherSingapore #EarlyCareer #MentorshipInAction #Kaizen #FutureLeaders #LifeAtBrother`
  },
  {
    id: "tmpl-eb-recruiter-advice-sg",
    source: "Brother Regional Talent Acquisition Benchmark",
    name: "From the Talent Desk (Candidate Guidance & Mutual Fit)",
    category: "Candidate Experience & Coaching",
    tone: "Sincere, encouraging, transparent, consultative",
    description: "Demystifies the Asian corporate hiring process, presenting recruiters as supportive career allies and emphasizing mutual cultural harmony.",
    frontmatterYaml: `---
id: "eb_unfiltered_recruiter_advice"
source_account: "Brother Talent Acquisition"
category: "Candidate Experience & Coaching"
tone: "Sincere, consultative, transparent"
target_audience: "Singapore job seekers, mid-career professionals, talent seeking supportive leadership"
hofstede_alignment:
  power_distance: "Lowers applicant anxiety by framing interviews as mutual, respectful career consultations"
  uncertainty_avoidance: "Provides transparent guidance and clear criteria, helping candidates feel prepared"
  collectivism: "Emphasizes team harmony, shared values, and mutual fit over boastful self-promotion"
---`,
    placeholderTemplate: `[Insert Hook: Frame the interview process as a two-way respectful conversation, e.g. "An interview isn't an interrogation. It's a mutual conversation about shared values and long-term fit."]

In our latest note from the Talent Acquisition team, we want to share what our hiring managers genuinely look for beyond what's written on a resume:

1. [Question / Trait 1: Curiosity and enthusiasm for continuous learning and skill adaptation]
2. [Question / Trait 2: Ability to foster cross-team harmony, collaboration, and mutual respect]
3. [Question / Trait 3: Genuine alignment with customer care and long-term accountability]

[HR Guidance: Explain why humility, practical problem-solving, and a team-first mindset shine brightest at Brother]

[Insert Call to Action: Encourage job seekers to ask questions or explore career pathways with us 👇]

#CareerAdvice #JobSearchSG #HiringInSingapore #LifeAtBrother #AtYourSide #TeamCulture`,
    examplePost: `An interview isn't an interrogation. It's a mutual conversation about shared values and long-term fit.

When exploring your next career chapter in Singapore, finding the right cultural environment is just as important as the job title.

At Brother, our talent team is often asked what hiring managers value most. It rarely comes down to rehearsed buzzwords. Instead, we look for:

1. **A Kaizen Mindset:** A genuine passion for continuous learning, curiosity to ask 'how can we improve this?', and openness to feedback.
2. **Team Harmony (Wa):** How you listen, collaborate with colleagues from diverse backgrounds, and support collective team goals.
3. **Customer-Centric Care:** A natural instinct to put yourself in the shoes of the person you are helping — embodying our 'At your side' promise.

We believe in hiring for character and integrity, and nurturing technical capabilities together.

What is one question you always make sure to ask prospective employers during an interview? Share with us below! 👇

#CareerAdvice #JobSearchSG #HiringInSingapore #LifeAtBrother #AtYourSide #TeamCulture`
  },
  {
    id: "tmpl-eb-career-loyalty-sg",
    source: "Brother Heritage & Long-Service Recognition Archive",
    name: "Career Longevity & Multigenerational Stewardship",
    category: "Employee Recognition & Retention",
    tone: "Respectful, deeply appreciative, humble, storytelling-driven",
    description: "Deeply honors Asian long-term orientation and filial loyalty, celebrating multi-decade milestones, institutional wisdom, and generational continuity.",
    frontmatterYaml: `---
id: "eb_longterm_career_loyalty"
source_account: "Brother Long-Service Archive"
category: "Employee Recognition & Culture"
tone: "Respectful, appreciative, grounded"
target_audience: "Experienced professionals, mid-career talent seeking stability, leadership candidates"
hofstede_alignment:
  long_term_orientation: "Deeply honors multi-decade dedication, institutional wisdom, and generational continuity"
  collectivism: "Celebrates the mutual commitment between organization and individual — loyalty as a shared bond"
  power_distance: "Respectful deference for senior leaders and long-serving contributors who laid the team's foundations"
---`,
    placeholderTemplate: `[Insert Hook: Reflect on the rarity of multi-decade loyalty in today's fast-moving job market, e.g. "In a modern workforce where two-year job transitions are common, what inspires someone to dedicate decades to one organization?"]

[The Humble Beginning: Describe how [Name] first joined the organization (a junior assignment, a specialized technical role, or an unexpected opportunity)]

[The Decades of Quiet Impact: Chronicle their journey across business evolutions, product transformations, and mentoring younger generations]

In [Name]'s own reflection:
"[Quote on the enduring culture of mutual respect, teamwork, and standing by one another through challenging seasons]"

[Corporate Gratitude: Express sincere corporate gratitude for their decades of stewardship, wisdom, and foundation-building]

[Insert Call to Action: Invite colleagues and industry friends to extend their warmest blessings and congratulations 👇]

#BrotherSingapore #LongServiceAward #CareerMilestone #GenerationalStewardship #AtYourSide #LifeAtBrother`,
    examplePost: `In a modern workforce where two-year job transitions are common, what inspires someone to dedicate decades to one organization?

What began as a short-term overseas assignment grew into nearly 40 years of dedicated service, leadership, and enduring impact.

Throughout decades of technological shifts — from mechanical typing to digital thermal printing and industrial automation — veteran leaders like Bill Henderson helped build our global organization with quiet diligence and deep customer care.

Reflecting on this multi-decade journey, he shared:
'From the moment I arrived, what stood out was the spirit of mutual respect and teamwork. Brother gave me the foundation to build a meaningful career surrounded by colleagues who truly look out for one another.'

An organization's true strength is built on the shoulders of dedicated custodians who invest in the people around them.

Please join us in expressing our deepest gratitude for four decades of exemplary stewardship, mentorship, and vision! 👏💐

#BrotherSingapore #LongServiceAward #CareerMilestone #GenerationalStewardship #AtYourSide #LifeAtBrother`
  },
  {
    id: "tmpl-eb-community-care-sg",
    source: "Brother Singapore CSR & Multicultural Harmony Archive",
    name: "Multicultural Harmony & Community Stewardship (CSR)",
    category: "Culture & Community Impact",
    tone: "Heartfelt, humble, harmonious, community-minded",
    description: "Calibrated for Singapore's multiracial context and Asian communal responsibility \u2014 celebrating shared festivals, team harmony, and quiet charitable service.",
    frontmatterYaml: `---
id: "eb_multicultural_community_care"
source_account: "Brother Singapore CSR Archive"
category: "Culture & Community Stewardship"
tone: "Heartfelt, humble, harmonious"
target_audience: "Singapore workforce, community partners, talent valuing social responsibility and harmony"
hofstede_alignment:
  collectivism: "Celebrates Singapore's multiracial harmony, team solidarity, and mutual responsibility toward society"
  long_term_orientation: "Environmental stewardship and social contribution creating lasting benefits for future generations"
  power_distance: "Leadership and staff roll up their sleeves together in volunteer service, reinforcing shared humility"
---`,
    placeholderTemplate: `[Insert Hook: Reflect on the shared strength of mutual respect, diverse cultural traditions, and community care, e.g. "Our shared strength as a team in Singapore is rooted in mutual respect, diverse traditions, and caring for the community around us."]

[Communal Initiative: Describe a concrete team volunteer initiative (nature reserve trail restoration, coastal conservation, or charitable outreach)]

Working side-by-side across departments and backgrounds:
🌿 [Action 1: Environmental protection protecting green spaces for future generations]
🤝 [Action 2: Partnering with local community welfare groups to support underserved families]
🍱 [Action 3: Coming together across Chinese, Malay, Indian, and Eurasian cultural traditions in mutual celebration]

[The Philosophy: Reaffirm Brother's 'At your side' commitment — being a responsible corporate citizen dedicated to societal harmony]

[Insert Call to Action: Thank partner non-profits and invite followers to share how their teams give back to the community 👇]

#BrotherSingapore #BrotherEarth #MulticulturalHarmony #CommunityCare #CSRSingapore #AtYourSide #SGTogether`,
    examplePost: `Our shared strength as a team in Singapore is rooted in mutual respect, diverse traditions, and caring for the community around us.

Corporate responsibility isn't about grand slogans. It's about showing up quietly for our environment and our neighbors.

Recently, colleagues from across our business came together alongside local environmental partners to clear debris and maintain natural habitats along our local coastlines and reserves.

Rolling up our sleeves side-by-side — managers, technicians, and administrative teammates alike — reinforced what truly unites us:
🌿 Caring for our shared natural heritage so future generations can enjoy it
🤝 Deepening bonds of mutual respect and teamwork outside the office
💡 Living our 'At your side' promise not just for our customers, but for our wider Singapore community

True team harmony is forged through shared service and mutual care.

A heartfelt thank you to all our team members and community partners who contributed their time and energy! 🌏💚

#BrotherSingapore #BrotherEarth #MulticulturalHarmony #CommunityCare #CSRSingapore #AtYourSide #SGTogether`
  },
  {
    id: "tmpl-eb-craftsmanship-sg",
    source: "Brother Monozukuri & Precision Engineering Archive",
    name: "Precision Craftsmanship & Frontline Dedication (Monozukuri)",
    category: "Engineering & Operational Excellence",
    tone: "Respectful, understated, precise, quietly confident",
    description: "Tuned to the Japanese spirit of Monozukuri (craft mastery) and Asian work ethic \u2014 honoring the quiet, unsung technicians and warehouse logistics teams.",
    frontmatterYaml: `---
id: "eb_craftsmanship_frontline_excellence"
source_account: "Brother Monozukuri Engineering"
category: "Engineering & Operations Excellence"
tone: "Respectful, understated, precise"
target_audience: "Engineers, supply chain specialists, operations managers, technical candidates"
hofstede_alignment:
  uncertainty_avoidance: "Commitment to zero-defect precision, rigorous testing, and mission-critical reliability"
  long_term_orientation: "Respect for foundational engineering mastery (Monozukuri) and continuous refinement (Kaizen)"
  collectivism: "Recognizes the unsung operations, fulfillment, and field technicians whose collective diligence keeps industries moving"
---`,
    placeholderTemplate: `[Insert Hook: Highlight an unseen, mission-critical operational system that society quietly depends on, e.g. "The most reliable technology is often the kind that works so seamlessly, you never have to think about it."]

[Behind the Scenes: Take readers into the technical discipline behind the scenes — precision gearmotors, industrial fulfillment, or extreme durability testing]

Behind every automated distribution line, hospital specimen workflow, and commercial delivery:
⚡ [Precision Mastery 1: Engineering compact, high-torque systems designed for 24/7 industrial dependability]
⚡ [Operational Diligence 2: Supply chain precision ensuring mission-critical hardware reaches frontline workers without delay]
⚡ [The Monozukuri Standard 3: Rigorous quality checks reflecting our heritage of zero-defect craftsmanship]

[Gratitude to the Frontline: Honor the quiet dedication of warehouse coordinators, technicians, and field service specialists]

[Insert Call to Action: Invite technical, logistics, and engineering minds to explore careers rooted in craft mastery 👇]

#Monozukuri #EngineeringExcellence #SupplyChainPrecision #BrotherSingapore #AtYourSide #IndustrialInnovation`,
    examplePost: `The most reliable technology is often the kind that works so seamlessly, you never have to think about it.

Behind high-speed airport sorting systems, medical laboratory robotics, and automated manufacturing lines across Asia, you will often find quiet Brother gearmotors and industrial identification systems working around the clock.

In an era of disposable hardware, our engineering philosophy remains rooted in **Monozukuri** — the art of purposeful, precision craftsmanship:
⚡ High-efficiency, sub-fractional gearmotors engineered for whisper-quiet endurance
⚡ Industrial labeling tested to withstand extreme heat, chemicals, and humidity
⚡ A dedicated logistics and fulfillment team ensuring critical parts reach regional enterprises without disruption

World-class technology is only possible through the quiet diligence and pride of our frontline technicians, engineers, and supply chain coordinators.

To our operations and engineering colleagues across the region: thank you for keeping essential industries moving forward with reliability and integrity! ⚙️🤝

#Monozukuri #EngineeringExcellence #SupplyChainPrecision #BrotherSingapore #AtYourSide #IndustrialInnovation`
  }
];

export function extractTemplateFromInput({ type, content, title = "Custom Extracted Template" }) {
  return {
    id: `tmpl-extracted-${Date.now()}`,
    source: type === 'url' ? `Live Post: ${content}` : type === 'screenshot' ? 'Screenshot Image Analysis' : 'PDF Document Archive',
    name: title,
    category: "Extracted Benchmark",
    tone: "Culturally Calibrated, Respectful, Structured",
    description: "Reverse-engineered and calibrated to Hofstede Asian dimensions (Harmony, Monozukuri, Long-term Stewardship).",
    frontmatterYaml: `---
id: "custom_extracted_${Date.now()}"
source_type: "${type}"
extracted_at: "${new Date().toISOString().slice(0, 10)}"
category: "Extracted Benchmark"
tone: "Respectful, grounded, team-oriented"
hofstede_calibration: "Singapore / Asian Cultural Alignment"
---`,
    placeholderTemplate: `[Insert Culturally Calibrated Hook: Respectful observation, communal value reflection, or operational insight]

[State the Communal Context: Highlight how the initiative supports customer care, employee well-being, or team harmony]

Key Reflections & Takeaways:
🔹 [Point 1: Concrete achievement or craft precision upholding quality standards]
🔹 [Point 2: Team collaboration and cross-functional harmony]
🔹 [Point 3: Long-term value creation for partners and community]

[Brother Connection: Emphasize 'At your side' dedication with quiet reliability and integrity]

[Insert Call to Action: Sincere, respectful question inviting peer perspectives 👇]

#BrotherSingapore #AtYourSide #LifeAtBrother #WorkplaceHarmony`,
    examplePost: content ? `Extracted post aligned with Asian cultural calibration:
${content.slice(0, 280)}...` : "Sample post ready to be drafted with this new template."
  };
}

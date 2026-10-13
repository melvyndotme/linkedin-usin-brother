export const FIVE_CORE_FRAMEWORKS = [
  {
    id: "framework-possibility-launch",
    name: "The Possibility Launch Framework",
    formula: "H-C-V-P-P-A",
    category: "Product & Promotion Innovation",
    source: "Epson America Benchmark Deconstruction",
    tone: "Optimistic, approachable, product-confident",
    description: "Sells the creative possibility before naming product specifications. Converts promotions into meaningful brand metaphors.",
    philosophy: "Sell the possibility before the specification. Transform: Company Message → Audience Relevance → Metaphorical Bridge ('At your side') → Audience Action.",
    whyItDiffers: "Traditional product posts read like dry press releases filled with model numbers, print speeds, and dimensions. This framework humanizes the announcement, focuses on what creators/SMEs can build, and anchors promotions into Brother's 'At your side' promise.",
    whenToUse: "Hardware releases, consumable bundles (e.g. ink + umbrella), craft and commercial printers, seasonal promotional campaigns.",
    structureSteps: [
      { step: "HOOK", label: "Friendly Hook", purpose: "Earn attention before naming the product", prompt: "Lead with curiosity or everyday relevance without sounding like a corporate press release." },
      { step: "CONTEXT", label: "Communal Context", purpose: "Explain why this idea matters", prompt: "Anchor in an everyday home or workplace habit everyone recognizes." },
      { step: "VALUE", label: "Human Value", purpose: "Convert specs into creative possibility", prompt: "Tell the reader what they can create, do, or enjoy rather than technical specs." },
      { step: "PROOF", label: "Credible Proof", purpose: "Provide clear facts without specification dumps", prompt: "State product bundle, promotion dates, and availability concisely." },
      { step: "POSSIBILITY", label: "Future Projection", purpose: "Help customer picture the experience", prompt: "Connect the everyday work benefit to life beyond the desk." },
      { step: "ACTION", label: "Single Action", purpose: "Direct reader toward one clear next step", prompt: "One simple invitation to discover the bundle or visit retailers." }
    ],
    rules: [
      "Aim for 80-140 words total",
      "The first 1-2 lines must make complete sense before 'see more'",
      "Sell what the customer can make before naming the machine",
      "Connect promotional items to brand philosophy ('At your side')",
      "Max 3-5 relevant hashtags"
    ],
    placeholderTemplate: `[Insert Friendly Hook: Earn attention with curiosity or a creative observation, e.g. "Rain or shine, Brother has you covered. ☔"]

[Communal Context: Anchor in an everyday workplace necessity everyone recognizes]

[Human Value & Proposition: Translate the promotion into an immediate user benefit beyond the printer]

[Credible Proof: Eligible model bundle, dates, and campaign conditions]

[Future Possibility: Help the customer visualize the benefit at work and beyond]

[Single Call to Action: Clear invitation to discover the promotion 👇]

#BrotherSingapore #AtYourSide #BrotherPrinters #WorkplacePerks`,
    examplePost: `Rain or shine, Brother has you covered. ☔

Stocking up on ink is something every home or office eventually needs to do. This time, your next refill comes with something useful beyond the printer.

Get 1 set of Brother LC462 cartridges and secure an exclusive Brother Automatic Umbrella while stocks last.

So whether you're preparing documents at your desk or stepping outside into an unexpected downpour, Brother can be at your side.

The promotion runs from 1 October 2026 to 3 January 2027, while stocks last. Terms and conditions apply.

Discover the Brother LC462 Bundle and make your next refill a little more rewarding.

#BrotherSingapore #AtYourSide #BrotherPrinters #LC462 #WorkplacePerks`
  },
  {
    id: "framework-kaizen-problem-solution",
    name: "The Kaizen Problem-Solution Framework",
    formula: "F-C-A-R",
    category: "Operational Excellence & Monozukuri",
    source: "Brother Engineering & Monozukuri Archive",
    tone: "Empathetic, disciplined, precise, consultative",
    description: "Solves quiet operational friction before it becomes an IT crisis. Continuous micro-adjustments beat flashy promises.",
    philosophy: "Quiet engineering precision (Monozukuri) solves real frontline headaches. Replace self-congratulation with professional empathy.",
    whyItDiffers: "Avoids marketing swagger and technical chest-thumping. Focuses on the real, daily friction points of Singapore SME operations and answers them with Japanese precision engineering (Monozukuri).",
    whenToUse: "B2B printer reliability discussions, Managed Print Services (MPS), high-yield cartridge economics, hardware durability showcases.",
    structureSteps: [
      { step: "FRICTION", label: "Operational Friction", purpose: "Name a hidden everyday pain point", prompt: "Identify a subtle workflow annoyance office teams experience regularly." },
      { step: "COST", label: "Cost of Inaction", purpose: "Demonstrate the real toll on momentum", prompt: "Show how a 10-minute bottleneck ripples into lost client trust or delays." },
      { step: "ADJUSTMENT", label: "Kaizen Micro-Adjustment", purpose: "Reveal the deliberate engineering discipline", prompt: "Detail 2-3 specific mechanical or workflow enhancements that prevent the issue." },
      { step: "RESULT", label: "Measurable Impact", purpose: "State tangible productivity payoff", prompt: "Highlight hours saved, zero paper jams, or low cost-per-page." },
      { step: "TAKEAWAY", label: "Consultative Reflection", purpose: "Invite peer dialogue on operations", prompt: "Ask fellow SME leaders how they eliminate friction in their workplace." }
    ],
    rules: [
      "No boastful superlatives ('best', 'revolutionary')",
      "Emphasize quiet reliability over flashy design",
      "Lead with the operator's perspective",
      "Use clean bullet points for technical features"
    ],
    placeholderTemplate: `[Insert Operational Friction: Highlight a common workplace bottleneck that disrupts daily rhythm]

[Cost of Inaction: Explain why small delays compound into lost team productivity]

In the spirit of Kaizen — continuous, quiet improvement — our enterprise engineering focuses on the micro-details that prevent friction before it begins:
🔹 [Point 1: Precision paper-feed or dual-roller mechanism eliminating misfeeds]
🔹 [Point 2: High-capacity consumables designed for high-volume endurance]
🔹 [Point 3: Energy-efficient instant wake-up technology]

[Core Takeaway: True office productivity is tools so dependable you forget they are even there]

[Consultative Call to Action: Invite SME leaders to share operational bottlenecks solved this quarter 👇]

#BrotherSingapore #Kaizen #Monozukuri #WorkplaceProductivity #AtYourSide #SMEsg #Reliability`,
    examplePost: `A 15-minute printer outage right before an executive board meeting isn't just an IT ticket. It's a rupture in team momentum.

In fast-moving Singapore SMEs, high-volume workflows shouldn't be derailed by paper jams, slow warm-up times, or ambiguous error codes.

In the spirit of Kaizen — continuous, quiet improvement — our enterprise engineering focuses on the micro-details that prevent friction before it begins:
🔹 Dual-roller paper feeding mechanisms that virtually eliminate multi-sheet misfeeds
🔹 High-yield ultra-capacity toner cartridges engineered for uninterrupted 10,000-page production runs
🔹 Energy-saving intelligent sleep modes that wake instantly when the first page is sent

True office productivity isn't about flashy gadgets. It’s about tools so reliable that your team forgets they're even there.

What is one small operational bottleneck your team solved this quarter that made an outsized difference? Share your experience below! 👇

#BrotherSingapore #Kaizen #Monozukuri #WorkplaceProductivity #AtYourSide #SMEsg #Reliability`
  },
  {
    id: "framework-thought-leadership",
    name: "Thought Leadership & Contrarian Commentary",
    formula: "O-C-D-I-P",
    category: "Strategic Insight & Future of Work",
    source: "Singapore B2B Industry Intelligence",
    tone: "Thought-provoking, authoritative, balanced, engaging",
    description: "Challenges conventional workplace assumptions with ground realities. Builds intellectual credibility by teaching rather than pitching.",
    philosophy: "Earn LinkedIn authority through genuine intellectual curiosity. The algorithm rewards rich comment conversations, not broadcast spam.",
    whyItDiffers: "Completely non-commercial. Does not sell a product. Instead, it positions Brother Singapore as a wise advisor on the future of work and sparks genuine debate in the LinkedIn comment section.",
    whenToUse: "Singapore MOM workforce guidelines, flexible work arrangements, hybrid office debates, digital-physical document governance, sustainability mandates.",
    structureSteps: [
      { step: "OBSERVATION", label: "Common Consensus", purpose: "State an industry belief taken for granted", prompt: "Open with a common assumption or buzzword in corporate circles." },
      { step: "CONTRARIAN", label: "The Counter-Intuitive Truth", purpose: "Challenge the oversimplification", prompt: "Explain why real-world execution is far more nuanced." },
      { step: "DATA", label: "Ground Reality / Evidence", purpose: "Anchor in Singapore commercial realities", prompt: "Cite real compliance, legal, or supply chain factors." },
      { step: "IMPLICATION", label: "Strategic Roadmap", purpose: "Guide business leaders on the right balance", prompt: "Provide 3 practical pillars modern firms adopt." },
      { step: "PROMPT", label: "Conversation Starter", purpose: "Fuel algorithmic comment discussions", prompt: "Ask an open question asking peers how they navigate the trade-off." }
    ],
    rules: [
      "Never pitch hardware directly",
      "Avoid aggressive confrontation; use respectful intellectual curiosity",
      "Ground assertions in Singapore business context",
      "Close with an open-ended question that cannot be answered with yes/no"
    ],
    placeholderTemplate: `[Insert Common Consensus: State a conventional business assumption or tech prediction]

[Contrarian Insight: Challenge why reality on the ground in Singapore tells a different story]

[Ground Reality / Compliance: Detail the real-world operational factors modern organizations face]

Modern organizations succeed by mastering the bridge:
• [Strategic Pillar 1: Smart cloud indexing and automated ingestion]
• [Strategic Pillar 2: High-security compliance and auditability]
• [Strategic Pillar 3: Sustainable closed-loop recycling aligned with Singapore Green Plan]

[Executive Takeaway: Synthesize the leadership lesson]

[Discussion Prompt: Open-ended question inviting fellow business leaders to exchange perspectives 💬]

#FutureOfWorkSG #DigitalTransformation #BrotherSingapore #SmartWorkplace #AtYourSide #B2BLeadership`,
    examplePost: `The "completely paperless office" has been predicted for 30 years. Yet in Singapore's most digitized legal, shipping, and logistics hubs, physical documents remain non-negotiable.

Why? Because high-stakes commerce doesn't just run on speed — it runs on verifiable trust, chain-of-custody compliance, and tangible physical handoffs.

The future of workplace productivity isn't choosing between 100% digital and 100% paper. It's mastering the seamless bridge between them:
• Barcode-scanned document ingestion that auto-indexes into cloud ERPs
• High-security encrypted print releases that protect sensitive client NDAs
• Sustainable, closed-loop cartridge recycling that meets Singapore Green Plan 2030 standards

Modern organizations don't eliminate paper; they eliminate the friction of managing it.

How is your organization balancing digital transformation with statutory physical compliance? Let’s exchange notes below. 💬

#FutureOfWorkSG #DigitalTransformation #BrotherSingapore #SmartWorkplace #AtYourSide #B2BLeadership`
  },
  {
    id: "framework-cultural-harmony-wa",
    name: "The Cultural Harmony & Community Framework (Wa)",
    formula: "M-S-G-B",
    category: "Employer Branding & Culture",
    source: "Brother Singapore CSR & Multicultural Harmony Archive",
    tone: "Heartfelt, humble, harmonious, respectful",
    description: "Deeply honors Singapore's multiracial context and the Japanese value of Wa (和, harmony). Pure community stewardship.",
    philosophy: "True strength lies in mutual respect and shared harmony (和). Honor the multicultural fabric of our people before any business metric.",
    whyItDiffers: "Strictly non-promotional and deeply rooted in Singapore's multiracial context. Avoids performative corporate CSR and celebrates real human connection, festival traditions, and team gratitude.",
    whenToUse: "Singapore public holidays (National Day, Deepavali, CNY, Hari Raya), team milestones, employee recognition, community volunteering (Brother Earth).",
    structureSteps: [
      { step: "MOMENT", label: "Unifying Milestone", purpose: "Honor the cultural or statutory celebration", prompt: "Acknowledge the festive occasion or community milestone with genuine warmth." },
      { step: "STORY", label: "Pantry / Human Ritual", purpose: "Bring the reader into the actual workplace", prompt: "Share a concrete moment: shared festive sweets, pantry conversations, or joint volunteering." },
      { step: "GRATITUDE", label: "Pillars of Care", purpose: "Reaffirm our commitment to the collective team", prompt: "Detail how Brother supports work-life harmony, family care, and mutual respect." },
      { step: "BLESSING", label: "Heartfelt Warm Wish", purpose: "Extend blessings to the wider community", prompt: "Warmly wish employees, partners, and clients a meaningful celebration." }
    ],
    rules: [
      "No sales pitches or product mentions",
      "Highlight diversity and inclusion without buzzwords",
      "Express genuine gratitude",
      "Use authentic cultural emojis with restraint"
    ],
    placeholderTemplate: `[Insert Unifying Cultural Milestone: Respectfully acknowledge the festive celebration or national milestone]

[Human Story & Workplace Reality: Share a grounded team tradition — shared food, festive conversations, or community service]

At Brother, our 'At your side' promise begins at home. It means:
🌿 [Pillar 1: Supporting team work-life harmony so everyone recharges with family]
🤝 [Pillar 2: Honoring the diverse cultural traditions that enrich our island nation]
💡 [Pillar 3: Active community volunteering and sustainability outreach]

[Communal Blessing: Extend sincere wishes of health, prosperity, and joy to teams, clients, and partners ✨]

[Community Question: Invite followers to share how their teams celebrate together 👇]

#BrotherSingapore #WorkplaceHarmony #AtYourSide #LifeAtBrother #SGTogether #MulticulturalSingapore`,
    examplePost: `In a vibrant, fast-paced city like Singapore, our greatest corporate strength will always be our shared harmony (和).

As festive seasons draw near, our office pantry fills with traditional kuih, pineapple tarts, and sweets shared across desks and departments. Beyond the celebrations, it is a reminder of what makes our workplace special: mutual respect, deep gratitude, and looking out for one another.

At Brother, 'At your side' begins at home. It means:
🌿 Protecting our team's work-life harmony so everyone returns to their families recharged
🤝 Honoring the diverse cultural traditions that enrich our island nation
💡 Supporting our community through regular environmental coastal cleanups and volunteer outreach

To all our team members, clients, and partners celebrating across Singapore: may your season be filled with joy, prosperity, and meaningful connection. ✨🇸🇬

How is your team marking the upcoming holidays together? Share your favorite traditions below! 👇

#BrotherSingapore #WorkplaceHarmony #AtYourSide #LifeAtBrother #SGTogether #MulticulturalSingapore`
  },
  {
    id: "framework-customer-transformation",
    name: "The B2B Customer Transformation Framework",
    formula: "B-T-A-N-P",
    category: "Customer Case Study & Social Proof",
    source: "Brother Industrial & SME Solutions Archive",
    tone: "Grounded, evidence-based, inspiring, peer-to-peer",
    description: "Makes the customer the hero. Shows Brother technology solving real operational bottlenecks inside the client's actual workflow.",
    philosophy: "Make the customer the protagonist. Show the machine solving problems inside the client's actual bustling environment, not a sterile studio.",
    whyItDiffers: "Rather than showing a polished printer on a blank studio background, this puts the technology inside the customer's actual messy, high-pressure workflow (e.g. shipping bench, dental lab, factory floor) and measures real business outcomes.",
    whenToUse: "SME case studies, industrial labeling and direct-thermal solutions, healthcare identification, logistics partner spotlights.",
    structureSteps: [
      { step: "BOTTLENECK", label: "The Operational Roadblock", purpose: "Establish the high-stakes friction before", prompt: "Describe the specific operational stress during a peak volume period." },
      { step: "TURNING POINT", label: "The Realization", purpose: "What prompted the client to seek a better way", prompt: "Explain why standard off-the-shelf consumer gear wasn't cutting it." },
      { step: "OUTCOME", label: "Frontline Transformation", purpose: "Show the new workflow in motion", prompt: "Detail the speed, reliability, or precision unlocked by Brother equipment." },
      { step: "NUMBERS", label: "Hard Operational Proof", purpose: "Quantify the business value", prompt: "Include 2-3 concrete metrics: percent reduction in jams, units packaged, or hours saved." },
      { step: "PEER ADVICE", label: "Takeaway for SME Leaders", purpose: "Provide actionable counsel for other businesses", prompt: "Summarize the core operational lesson for fellow founders." }
    ],
    rules: [
      "Customer and their team are always the protagonists",
      "Lead with the high-stakes situation (e.g. 11.11 sale surge)",
      "Include at least one specific metric or measurable proof point",
      "Include relevant SME and industry hashtags"
    ],
    placeholderTemplate: `[Insert High-Stakes Operational Scenario: Describe a customer scaling challenge during peak volume]

[The Bottleneck: Explain how a small physical delay compounded into hours of lost dispatch time]

By transitioning to industrial-grade Brother solutions, their crew unlocked:
📦 [Metric 1: High-speed output or zero smudge rate]
⏱️ [Metric 2: Measurable reduction in packing bench bottlenecks]
🌿 [Metric 3: Waste reduction and lower consumable overhead]

[The SME Lesson: Advise business leaders to optimize foundations before surges arrive]

[Peer Question: Ask fellow operations leaders what bottleneck they are currently tackling 👇]

#BrotherSingapore #LogisticsAutomation #ECommerceSG #SmartFulfillment #AtYourSide #SMESpotlight`,
    examplePost: `When a local Singapore eCommerce brand scales from 50 orders a day to 1,500 during 11.11, the shipping bench becomes the ultimate operational pressure cooker.

A 3-second delay on every thermal shipping label doesn't sound like much — until it compounds into hours of lost dispatch time and delayed customer packages.

By transitioning from standard desktop printers to industrial-grade Brother direct thermal label systems, their fulfillment crew unlocked:
📦 300mm/second ultra-high-speed label output with zero smudge risk
⏱️ A 42% reduction in packing bench bottlenecks during peak flash sales
🌿 Thermal printing with zero ribbon waste, cutting consumable overhead

The lesson for growing SMEs? Don't wait for your peak season to stress-test your frontline workflows. Optimize your foundation before the surge arrives.

What is one operational hurdle your fulfillment or office team is tackling as year-end sales approach?

#BrotherSingapore #LogisticsAutomation #ECommerceSG #SmartFulfillment #AtYourSide #SMESpotlight`
  }
];

export const BENCHMARK_TEMPLATES = [
  ...FIVE_CORE_FRAMEWORKS,
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

World-class technology is only possible through the quiet diligence and dedication of our frontline technicians, engineers, and supply chain coordinators.

To our operations and engineering colleagues across the region: thank you for keeping essential industries moving forward with reliability and integrity! ⚙️🤝

#Monozukuri #EngineeringExcellence #SupplyChainPrecision #BrotherSingapore #AtYourSide #IndustrialInnovation`
  }
];

export function extractTemplateFromInput({ type, content, title = "Custom Extracted Framework" }) {
  const isPromo = /launch|sale|promotion|discount|free|meet the new|announcing|introducing/i.test(content || '');
  const isKaizen = /jam|repair|reliability|maintenance|speed|efficiency|downtime/i.test(content || '');

  return {
    id: `framework-extracted-${Date.now()}`,
    source: type === 'url' ? `Live Post: ${content}` : type === 'screenshot' ? 'Screenshot Image Analysis' : 'PDF Document Archive',
    name: title,
    category: isPromo ? "Product & Promotion Innovation" : isKaizen ? "Operational Excellence & Monozukuri" : "Extracted Benchmark",
    formula: isPromo ? "H-C-V-P-P-A" : isKaizen ? "F-C-A-R" : "H-C-V-A",
    tone: "Culturally Calibrated, Respectful, Professional",
    description: "Reverse-engineered and calibrated to Hofstede Asian dimensions (Wa Harmony, Monozukuri Precision, Long-term Stewardship).",
    philosophy: "Sell the possibility before the specification. Transform: Company Message → Audience Relevance → Metaphorical Bridge ('At your side') → Audience Action.",
    whyItDiffers: "Deconstructs the competitor's post into cognitive communication steps. Replaces specification dumps with human outcomes and brand resonance.",
    whenToUse: "Ideal for adapting high-performing B2B LinkedIn posts into authentic Brother Singapore thought leadership and campaign advocacy.",
    structureSteps: isPromo ? [
      { step: "HOOK", label: "Friendly Hook", purpose: "Earn attention before naming the product", prompt: "Lead with curiosity or everyday relevance without sounding like a corporate press release." },
      { step: "CONTEXT", label: "Communal Context", purpose: "Explain why this idea matters", prompt: "Anchor in an everyday home or workplace habit everyone recognizes." },
      { step: "VALUE", label: "Human Value", purpose: "Convert specs into creative possibility", prompt: "Tell the reader what they can create, do, or enjoy rather than technical specs." },
      { step: "PROOF", label: "Credible Proof", purpose: "Provide clear facts without specification dumps", prompt: "State product bundle, promotion dates, and availability concisely." },
      { step: "POSSIBILITY", label: "Future Projection", purpose: "Help customer picture the experience", prompt: "Connect the everyday work benefit to life beyond the desk." },
      { step: "ACTION", label: "Single Action", purpose: "Direct reader toward one clear next step", prompt: "One simple invitation to discover the bundle or visit retailers." }
    ] : [
      { step: "HOOK", label: "Attention Hook", purpose: "Highlight an operational reality or thought-provoking question", prompt: "Open with a relatable workplace friction or milestone." },
      { step: "CONTEXT", label: "Context & Reality", purpose: "Explain the challenge without self-congratulation", prompt: "Show empathy with the professional's daily constraints." },
      { step: "VALUE", label: "Brother Connection", purpose: "Connect back to 'At your side' dedication", prompt: "Explain how our craft and support make the difference." },
      { step: "ACTION", label: "Consultative Call to Action", purpose: "Invite community reflection", prompt: "Close with an engaging question for fellow Singapore professionals." }
    ],
    rules: [
      "Keep between 80-140 words",
      "First 2 lines must make complete sense before 'see more'",
      "Sell what the customer can do before naming the model number",
      "Connect back to 'At your side' positioning",
      "Max 3-5 relevant hashtags"
    ],
    placeholderTemplate: `[Insert Culturally Calibrated Hook: Respectful observation, communal value reflection, or operational insight]

[State the Communal Context: Highlight how the initiative supports customer care, employee well-being, or team harmony]

Key Reflections & Takeaways:
🔹 [Point 1: Concrete achievement or craft precision upholding quality standards]
🔹 [Point 2: Team collaboration and cross-functional harmony]
🔹 [Point 3: Long-term value creation for partners and community]

[Brother Connection: Emphasize 'At your side' dedication with quiet reliability and integrity]

[Insert Call to Action: Sincere, respectful question inviting peer perspectives 👇]

#BrotherSingapore #AtYourSide #LifeAtBrother #WorkplaceHarmony`,
    examplePost: content && content.length > 50 ? content : `In today's fast-moving Singapore workplace, the best technology works quietly 'At your side'.

When teams are empowered with dependable tools, everyday productivity flows effortlessly without friction.

Discover how Brother Singapore supports enterprise reliability and sustainable growth.

#BrotherSingapore #AtYourSide #WorkplaceInnovation`
  };
}

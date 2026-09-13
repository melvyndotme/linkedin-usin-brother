import { YAML_TEMPLATES } from './yamlTemplates.js';

export function generateFestiveDrafts(holiday) {
  const occasionName = holiday.name;
  const culturalContext = holiday.culturalContext;
  const hashtags = (holiday.suggestedHashtags || []).join(' ');

  return [
    {
      id: "draft-1",
      templateId: "festive_warm_greeting",
      templateName: "Warm Community Greeting",
      angle: "Community Unity & Heartfelt Celebration",
      whyThisWorks: "Employs high Hofstede Harmony (*Wa*) and multiracial warmth. The hook immediately engages local audiences, followed by an authentic tribute to Singapore's diverse fabric and Brother's 'At your side' commitment.",
      postContent: `Wishing all our colleagues, partners, and friends a vibrant and joyous ${occasionName}! 🌟

As we mark this special occasion across Singapore, we reflect on what brings our community together — unity, gratitude, and mutual support. 

At Brother Singapore, our promise to stand 'At your side' goes beyond technology. It is about honoring the rich cultural tapestry that makes our island nation vibrant and strong.

May this festive season bring renewed hope, peace, and joyous moments with your loved ones. ✨

To everyone celebrating, how are you and your team marking this special day? We’d love to hear your favorite traditions below! 👇

${hashtags}`
    },
    {
      id: "draft-2",
      templateId: "festive_reflection_values",
      templateName: "Values & Heritage Reflection",
      angle: "Cultural Craftsmanship & Sustainable Growth",
      whyThisWorks: "Combines Japanese Kaizen (continuous care & precision) with Singapore's forward-looking Long-Term Orientation (LTO). Positions Brother Singapore as a thoughtful, value-driven corporate citizen.",
      postContent: `Beyond the celebrations, ${occasionName} reminds us of the enduring power of reflection, care, and collective resilience. 🌿

In both life and business, true progress isn't just about moving fast — it is about honoring strong foundations, fostering trust, and ensuring that every step forward uplifts those around us.

At Brother Singapore, this spirit resonates deeply with our core philosophy: putting people and long-term sustainability at the heart of everything we create.

As we celebrate today, we reaffirm our commitment to walking alongside our community, empowering workplaces, and building a brighter future together.

Wishing everyone a meaningful, peaceful, and blessed ${occasionName}. 🤝

${hashtags}`
    },
    {
      id: "draft-3",
      templateId: "festive_team_spotlight",
      templateName: "Internal Team & Culture Spotlight",
      angle: "Behind-the-Scenes & People-First Culture",
      whyThisWorks: "Maximizes employer branding resonance. Showcases Brother Singapore's vibrant, inclusive internal workplace culture, directly attracting prospective talent and celebrating current employees.",
      postContent: `The festive energy is palpable across our Brother Singapore family as we welcome ${occasionName}! 🎉

From sharing traditional delicacies in the pantry to exchanging stories and well-wishes, moments like these remind us that our greatest strength is the diverse, passionate people behind our brand.

Creating an inclusive environment where every culture is celebrated is central to our workplace ethos. When our people thrive together, we deliver our very best to our partners and customers every single day.

A big shoutout to our incredible team for bringing warmth and dedication to work every day. 

How is your workplace celebrating ${occasionName} this week? Share your team's festivities with us! 🇸🇬

${hashtags} #LifeAtBrother #PeopleFirst`
    }
  ];
}

export function generateAIDrafts(newsItem) {
  const title = newsItem?.title || newsItem?.headline || 'Enterprise Technology Breakthrough';
  const snippet = newsItem?.snippet || newsItem?.summary120 || 'Recent breakthroughs in workplace technology are transforming daily operations.';
  const source = newsItem?.sourceTitle || 'Industry Intelligence';
  const pillars = newsItem?.suggestedPillars || {
    whatItIs: snippet.slice(0, 150) + "...",
    whyItMatters: "Eliminates routine operational friction by 65%, freeing teams for strategic creative tasks.",
    brotherImpact: "Empowers Brother Singapore employees and B2B clients to achieve breakthrough productivity."
  };

  return [
    {
      id: "ai-draft-1",
      name: "3-Pillar Thought Leadership",
      templateId: "ai_thought_leadership_3pillar",
      templateName: "3-Pillar Breakthrough Synthesis",
      category: "Executive Thought Leadership",
      angle: "Executive Clarity & Macro Shift",
      whyThisWorks: "Employs the proven 'What it is → Why it matters → Brother Singapore impact' framework. Removes tech hype and provides immediate strategic clarity for B2B executives and innovation leaders.",
      postContent: `Technology is moving fast, but true innovation is measured by tangible workplace velocity. ⚡\n\nHere is our executive breakdown on the latest development (${source}): "${title}":\n\n🔹 01 | What It Is:\n${pillars.whatItIs}\n\n🔹 02 | Why It Matters:\n${pillars.whyItMatters}\n\n🔹 03 | How It Empowers Brother Singapore:\n${pillars.brotherImpact} Under our Brother Xplorer framework, we are transforming frontier tools into practical daily superpowers for our employees and B2B partners.\n\nTrue progress isn't about adopting technology for its own sake — it's about removing manual friction so human ingenuity can thrive.\n\nHow is your team exploring practical innovation in your daily workflows? Let's connect in the comments below! 👇\n\n#BrotherSingapore #AtYourSide #WorkplaceInnovation #DigitalTransformation #FutureOfWork #Productivity`
    },
    {
      id: "ai-draft-2",
      name: "Employee Empowerment & Kaizen",
      templateId: "ai_productivity_empowerment",
      templateName: "Employee Productivity & Workflow Accelerator",
      category: "Employer Branding & Culture",
      angle: "Human Potential & Continuous Learning",
      whyThisWorks: "Emphasizes human empowerment over replacement. Appeals to knowledge workers and HR leaders by spotlighting how continuous learning (*Kaizen*) enhances workplace wellbeing and career fulfillment.",
      postContent: `What if your team could reclaim hours of administrative drag every single week? ⏳\n\nAs reported by ${source} ("${title}"), workplace intelligence is unlocking new levels of operational ease:\n\n🚀 Automated workflows replacing repetitive manual data entry\n🚀 Rapid synthesis of complex documents into actionable decisions\n🚀 Smarter collaboration keeping teams aligned across hybrid workspaces\n\nAt Brother Singapore, our philosophy has always been 'At your side' — and that begins with our own people. Through internal digital learning and the Brother Xplorer mindset, we empower every team member to turn technology into daily productivity.\n\nTools should simplify work, not complicate it.\n\nWhat is one repetitive task you would love to automate in your office this month? Drop your thoughts below! 💡\n\n#BrotherSingapore #LifeAtBrother #PeopleFirst #ContinuousImprovement #Kaizen #SmartWorkplace`
    },
    {
      id: "ai-draft-3",
      name: "B2B Partner & Enterprise Trust",
      templateId: "ai_partner_trust",
      templateName: "B2B Enterprise Reliability & Precision",
      category: "B2B & Enterprise Solutions",
      angle: "Operational Excellence & Japanese Reliability",
      whyThisWorks: "Appeals to procurement heads and operations leaders by balancing adoption speed with rigorous Japanese quality assurance (*Monozukuri*), reliability, and clear enterprise ROI.",
      postContent: `Speed is good. Speed with reliability is game-changing. 🎯\n\nAmid fast-moving industry shifts (${title}), the competitive advantage for Singapore enterprises isn't just moving fast — it's executing with uncompromising trust, security, and precision.\n\nAt Brother Singapore, we bridge frontier digital capabilities with over a century of precision engineering heritage:\n\n✔️ Rigorous testing and compliance before deployment\n✔️ Dependable document, print, and workflow hardware that never slows you down\n✔️ Dedicated on-site service standing beside your business daily\n\nInnovation with integrity is how we stand 'At your side' in an evolving business landscape.\n\nHow is your organization balancing tech adoption speed with long-term reliability? 🤝\n\n#BrotherSingapore #AtYourSide #EnterpriseSolutions #BusinessContinuity #ZeroDowntime #SingaporeBusiness`
    },
    {
      id: "ai-draft-4",
      name: "Sustainability & Green Innovation",
      templateId: "ai_sustainability_esg",
      templateName: "Sustainability & ESG Transformation",
      category: "Sustainability & ESG",
      angle: "Green Workplace & Resource Efficiency",
      whyThisWorks: "Aligns with Singapore Green Plan 2030 and corporate ESG mandates, positioning Brother Singapore as a committed eco-steward and green office partner.",
      postContent: `Sustainable progress isn't just an aspiration — it is built through everyday workplace decisions. 🌿🇸🇬\n\nThe latest industry trend highlight (${title}) underscores a critical reality: modern enterprises must pursue operational velocity in harmony with environmental responsibility.\n\nAt Brother Singapore, this reflects our global Brother Earth commitment:\n\n🌱 Energy-efficient office hardware engineered to cut power consumption\n🌱 Closed-loop recycling programmes for spent consumables and e-waste\n🌱 Cloud document workflows that eliminate wasteful paper bottlenecks\n\nStanding 'At your side' means helping local businesses build sustainable, future-ready operations for generations to come.\n\nHow is your company taking steps toward a greener workplace this year? Share your initiatives with us! 💬\n\n#BrotherEarth #SustainabilitySG #GreenPlan2030 #EcoOffice #ESG #BrotherSingapore`
    },
    {
      id: "ai-draft-5",
      name: "Strategic Industry Commentary",
      templateId: "ai_industry_commentary",
      templateName: "Executive Market Commentary & Vision",
      category: "Strategic Insights",
      angle: "Macro Market Trends & Local Perspective",
      whyThisWorks: "Provides high-level strategic perspective tailored to Singapore and Southeast Asian business dynamics, driving executive discussion and brand authority.",
      postContent: `A defining shift is taking place across modern industry: "${title}". 📊\n\nAccording to analysis from ${source}, organizations that proactively redesign their workflows around intelligent automation are outpacing peers in agility, customer responsiveness, and employee retention.\n\nFor Singapore's corporate landscape, the takeaway is clear:\n1. Incremental tweaks are no longer enough — end-to-end workflow clarity is required.\n2. Investing in team capability is just as crucial as investing in technology.\n3. Trusted, durable infrastructure forms the bedrock of digital agility.\n\nAt Brother Singapore, we are proud to partner with organizations of all sizes to navigate this transformation with confidence.\n\nWhere do you see the biggest growth opportunity for your industry in the next 12 months? Let's discuss! 👇\n\n#BrotherSingapore #IndustryInsights #BusinessStrategy #FutureOfWork #Leadership #SingaporeEnterprise`
    }
  ];
}

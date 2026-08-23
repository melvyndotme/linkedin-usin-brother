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
  const title = newsItem.title;
  const pillars = newsItem.suggestedPillars || {
    whatItIs: newsItem.snippet,
    whyItMatters: "Accelerates daily enterprise workflows and removes operational friction.",
    brotherImpact: "Empowers Brother Singapore employees to pioneer automated productivity."
  };

  return [
    {
      id: "ai-draft-1",
      templateId: "ai_thought_leadership_3pillar",
      templateName: "3-Pillar AI Breakthrough Synthesis",
      angle: "Executive Thought Leadership & Strategic Impact",
      whyThisWorks: "Uses the clean 'What it is → Why it matters → Brother Singapore impact' framework. Removes tech hype and provides immediate strategic clarity, appealing to B2B leaders and tech innovators.",
      postContent: `AI is no longer just answering questions — it is transforming how modern enterprises execute work with speed and precision. ⚡

Here is our 24-hour intelligence breakdown on the latest breakthrough:

🔹 01 | What It Is:
${pillars.whatItIs}

🔹 02 | Why It Matters:
${pillars.whyItMatters}

🔹 03 | How It Empowers Brother Singapore:
${pillars.brotherImpact} Under our Brother Xplorer framework, we are turning these frontier tools into daily productivity superpowers for our teams and partners.

True innovation isn't about adopting technology for its own sake — it's about eliminating manual friction so humans can focus on high-value creativity.

How is your team experimenting with practical AI in your daily workflows? Share your thoughts below! 👇

#BrotherSingapore #AtYourSide #BrotherX #AIProductivity #FutureOfWork #DigitalTransformation`
    },
    {
      id: "ai-draft-2",
      templateId: "ai_productivity_empowerment",
      templateName: "Employee Productivity & Workflow Accelerator",
      angle: "Grassroots Empowerment & Kaizen Mindset",
      whyThisWorks: "Emphasizes human empowerment over replacement. Appeals directly to knowledge workers and HR leaders by highlighting how continuous learning (*Kaizen*) enhances job satisfaction and reduces burnout.",
      postContent: `What if your team could reclaim 5 hours of administrative friction every single week? ⏳

With recent breakthroughs in AI technology, that possibility is quickly becoming daily reality:

🚀 Smarter task orchestration replacing repetitive manual re-entry
🚀 Rapid synthesis of complex documents into actionable insights
🚀 Autonomous verification maintaining quality standards with zero fatigue

At Brother Singapore, our philosophy has always been 'At your side' — and that starts with empowering our own people. Through internal hackathons and AI agentic exploration, we are equipping every employee to achieve breakthrough productivity.

Technology should amplify human potential, not complicate it.

What is one repetitive workflow task you would love to automate this quarter? Let's discuss in the comments! 💡

#BrotherSingapore #LifeAtBrother #WorkplaceInnovation #Empowerment #FutureOfWork #AIAutomation`
    },
    {
      id: "ai-draft-3",
      templateId: "ai_thought_leadership_3pillar",
      templateName: "Pragmatic B2B Partner Perspective",
      angle: "Trust, Reliability & Operational Excellence",
      whyThisWorks: "Taps into Hofstede Uncertainty Avoidance (precision/reliability) by reassuring clients and partners that Brother Singapore blends cutting-edge AI innovation with rigorous Japanese quality assurance.",
      postContent: `Speed is good. Speed with precision is game-changing. 🎯

As new AI developments emerge rapidly (${title}), the differentiator for enterprises isn't just who adopts AI first — it's who implements it with trust, reliability, and clear guardrails.

At Brother Singapore, we bridge frontier digital intelligence with our heritage of precision engineering. Whether in document management, automated printing ecosystems, or internal operations:

✔️ We test rigorously before deployment
✔️ We keep humans in the loop for critical decisions
✔️ We build scalable workflows that deliver tangible ROI

Innovation with integrity is how we stay 'At your side' in the age of intelligence.

How is your organization balancing AI adoption velocity with quality assurance?

#BrotherSingapore #AtYourSide #EnterpriseAI #QualityEngineering #OperationalExcellence #TrustInAI`
    }
  ];
}

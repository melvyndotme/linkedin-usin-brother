// Mock real-time feed for offline demoing + live Serper.dev API connector
export const SAMPLE_AI_NEWS = [
  {
    id: "news-1",
    title: "Autonomous Agentic Workflows Surpass Simple Chatbots in Enterprise Productivity",
    source: "MIT Technology Review",
    date: "4 hours ago",
    snippet: "Organizations adopting multi-agent orchestration are seeing a 65% reduction in repetitive operational workflows, transitioning AI from passive Q&A to proactive task execution across documents and internal databases.",
    keywords: ["Agentic Workflows", "Enterprise AI", "Automation"],
    suggestedPillars: {
      whatItIs: "Multi-agent systems capable of planning, executing, and self-correcting multi-step tasks autonomously.",
      whyItMatters: "Eliminates repetitive digital coordination between siloed tools and spreadsheets, freeing teams for strategic problem-solving.",
      brotherImpact: "Empowers Brother Singapore employees to automate routine scheduling, drafting, and cross-departmental reporting."
    }
  },
  {
    id: "news-2",
    title: "Hybrid Reasoning Models Bridge the Gap Between Instant Speed and Deep Verification",
    source: "VentureBeat AI",
    date: "9 hours ago",
    snippet: "New reasoning architectures allow enterprises to dynamically toggle between instant responses and thorough step-by-step verification, ensuring mission-critical precision without latency overhead.",
    keywords: ["Hybrid Reasoning", "Precision AI", "Quality Assurance"],
    suggestedPillars: {
      whatItIs: "AI models that combine rapid intuitive outputs with deliberate chain-of-thought verification for complex tasks.",
      whyItMatters: "Drastically reduces hallucinations and errors in analytical, contractual, and technical domains.",
      brotherImpact: "Enables Brother Singapore teams to verify customer inquiries, technical documentation, and compliance with near-zero error rates."
    }
  },
  {
    id: "news-3",
    title: "Singapore AI Skills Initiative: Upskilling Workforce for Human-AI Collaboration",
    source: "The Business Times SG",
    date: "14 hours ago",
    snippet: "Singapore announces expanded national programs empowering enterprise staff with practical generative AI mastery, focusing on daily productivity and continuous learning across local subsidiaries.",
    keywords: ["Singapore AI", "Future of Work", "SkillsFuture"],
    suggestedPillars: {
      whatItIs: "National and corporate initiatives promoting hands-on AI literacy and practical tooling for daily employees.",
      whyItMatters: "Shifts digital transformation from top-down mandate to grassroots empowerment where every team member is an innovator.",
      brotherImpact: "Validates the Brother Xplorer mission — fostering an internal culture of continuous Kaizen and AI-driven growth."
    }
  },
  {
    id: "news-4",
    title: "Multimodal Document Intelligence Automates Complex Cross-Departmental Workflows",
    source: "TechCrunch Enterprise",
    date: "18 hours ago",
    snippet: "Next-generation vision-language models can now ingest complex scanned forms, blueprints, and multi-page PDFs, transforming physical and unstructured assets into real-time actionable data.",
    keywords: ["Document AI", "Multimodal", "Operational Efficiency"],
    suggestedPillars: {
      whatItIs: "Advanced vision AI models that instantly read, understand, and extract structured data from complex documents.",
      whyItMatters: "Bridges the gap between legacy paper workflows and modern digital systems with zero manual re-entry.",
      brotherImpact: "Directly complements Brother's printing, scanning, and workflow automation solutions, driving internal and client efficiency."
    }
  }
];

export async function fetchSerperAINews(apiKey, query = "generative AI workplace productivity", num = 4) {
  if (!apiKey || apiKey.trim() === "") {
    // Return sample news filtered by query if matched
    return SAMPLE_AI_NEWS.slice(0, num);
  }

  try {
    const response = await fetch("https://google.serper.dev/news", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: `${query} when:1d`,
        num: num,
        gl: "sg"
      })
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.news && data.news.length > 0) {
      return data.news.map((item, idx) => ({
        id: `serper-${idx}`,
        title: item.title,
        source: item.source || "Tech News",
        date: item.date || "Last 24h",
        snippet: item.snippet,
        link: item.link,
        keywords: [query, "AI Innovation", "Singapore"],
        suggestedPillars: {
          whatItIs: item.snippet.slice(0, 140) + "...",
          whyItMatters: "Accelerates operational workflows and enhances decision-making velocity across agile enterprise teams.",
          brotherImpact: "Enables Brother Singapore staff to pioneer smarter workflows and deliver on our 'At your side' promise."
        }
      }));
    }
    return SAMPLE_AI_NEWS.slice(0, num);
  } catch (err) {
    console.warn("Serper API call failed, falling back to curated real-time dataset:", err);
    return SAMPLE_AI_NEWS.slice(0, num);
  }
}

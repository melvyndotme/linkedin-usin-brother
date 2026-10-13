// Centralized Model Registry for Google Gemini 3, Nano Banana, and Open Models
// Sourced directly from official Google AI Studio documentation (https://aistudio.google.com/docs/models)

export const GEMINI_MODEL_REGISTRY = {
  // 1. Text & Multimodal Deconstruction / Content Generation
  text: [
    {
      id: 'gemini-3.8-flash',
      name: 'Gemini 3.8 Flash',
      badge: 'New Flagship',
      category: 'Gemini 3 (Frontier)',
      description: 'Our most intelligent Flash model, engineered for long-horizon software engineering, autonomous agents, and complex enterprise workflows.'
    },
    {
      id: 'gemini-3.6-flash',
      name: 'Gemini 3.6 Flash',
      badge: 'Stable',
      category: 'Gemini 3 (Frontier)',
      description: 'Balanced speed and multimodal capabilities across general agentic and everyday tasks.'
    },
    {
      id: 'gemini-3.5-flash-lite',
      name: 'Gemini 3.5 Flash-Lite',
      badge: 'Fast & High-Throughput',
      category: 'Gemini 3 (Frontier)',
      description: 'Fastest, most cost-effective 3.5 model for high-throughput execution.'
    },
    {
      id: 'gemini-3.1-flash-lite',
      name: 'Gemini 3.1 Flash-Lite',
      badge: 'Cost Efficient',
      category: 'Gemini 3 (Frontier)',
      description: 'Frontier-class performance rivaling larger models at a fraction of the cost.'
    },
    {
      id: 'gemini-3.1-pro-preview',
      name: 'Gemini 3.1 Pro',
      badge: 'Deep Reasoning',
      category: 'Gemini 3 (Pro Reasoning)',
      description: 'Advanced intelligence, complex problem-solving skills, and powerful agentic capabilities.'
    },
    {
      id: 'gemini-3-flash-preview',
      name: 'Gemini 3 Flash Preview',
      badge: 'Preview',
      category: 'Gemini 3 (Pro Reasoning)',
      description: 'Frontier-class performance preview rivaling larger models.'
    },
    // Open Weights & Efficient Gemma Family
    {
      id: 'gemma-2-27b-it',
      name: 'Gemma 2 27B IT',
      badge: 'Open Weights',
      category: 'Gemma Open Family',
      description: 'Google DeepMind high-performance 27B parameter instruction-tuned open weights model.'
    },
    {
      id: 'gemma-2-9b-it',
      name: 'Gemma 2 9B IT',
      badge: 'Balanced Open',
      category: 'Gemma Open Family',
      description: 'Balanced 9B parameter model providing strong general reasoning and generation capabilities.'
    },
    // Maintained 2.5 Long-Term Enterprise Models
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      badge: 'Enterprise 2.5',
      category: 'Gemini 2.5 Enterprise',
      description: 'Best price-performance for high-volume enterprise tasks requiring fast reasoning.'
    },
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      badge: 'Enterprise Pro',
      category: 'Gemini 2.5 Enterprise',
      description: 'Most advanced 2.5 model featuring deep reasoning and multi-turn workflows.'
    }
  ],

  // 2. Generative Media / Image Generation (Nano Banana Series)
  image: [
    {
      id: 'gemini-nano-banana-2.1',
      name: 'Nano Banana 2.1',
      badge: 'New Flagship Image',
      category: 'Nano Banana Creative',
      description: 'High-efficiency image generation and editing with improved visual quality, typography, and multi-turn consistency.'
    },
    {
      id: 'gemini-3.1-flash-lite-image',
      name: 'Nano Banana 2 Lite',
      badge: 'Fast & Cheap',
      category: 'Nano Banana Creative',
      description: 'Fastest and cheapest Gemini image model, engineered for velocity and high-volume interactive use cases.'
    },
    {
      id: 'gemini-3.1-flash-image',
      name: 'Nano Banana 2',
      badge: '4K Production',
      category: 'Nano Banana Creative',
      description: 'Powerful, high-efficiency image generation and editing, optimized for speed, 4K rendering, and multi-turn consistency.'
    },
    {
      id: 'gemini-3-pro-image',
      name: 'Nano Banana Pro',
      badge: 'Studio 4K & Thinking',
      category: 'Nano Banana Creative',
      description: 'State-of-the-art design engine with reasoning core for studio-quality 4K visuals, complex layouts, and precise text rendering.'
    },
    {
      id: 'gemini-2.5-flash-image',
      name: 'Nano Banana Legacy',
      badge: 'Legacy 2.5',
      category: 'Nano Banana Creative',
      description: 'Previous-generation native image generation and editing for fast, creative workflows.'
    }
  ]
};

// Default fallback selections per context
export const DEFAULT_TEXT_MODEL = 'gemini-3.8-flash';
export const DEFAULT_DECONSTRUCT_MODEL = 'gemini-3.8-flash';
export const DEFAULT_IMAGE_MODEL = 'gemini-nano-banana-2.1';

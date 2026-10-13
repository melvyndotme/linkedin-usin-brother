// Curated Frontier Model Registry for Brother Singapore
// Limited to the top 5 frontier text models and top 3 frontier image models
// Clean, authoritative, zero confusion.

export const GEMINI_MODEL_REGISTRY = {
  // Top 5 Frontier Models for Text, Deconstruction & Strategy
  text: [
    {
      id: 'gemini-3.8-flash',
      name: 'Gemini 3.8 Flash',
      badge: 'New Flagship',
      category: 'Frontier Flagship',
      description: 'Our most intelligent Flash model, engineered for long-horizon autonomous tasks and complex enterprise workflows.'
    },
    {
      id: 'gemini-3.1-pro-preview',
      name: 'Gemini 3.1 Pro',
      badge: 'Deep Reasoning',
      category: 'Frontier Flagship',
      description: 'Advanced intelligence, multi-step problem solving, and nuanced strategic deconstruction.'
    },
    {
      id: 'gemini-3.6-flash',
      name: 'Gemini 3.6 Flash',
      badge: 'Balanced Workhorse',
      category: 'Frontier Flagship',
      description: 'Production-grade workhorse balancing speed, precision, and multimodal understanding.'
    },
    {
      id: 'gemini-3.5-flash-lite',
      name: 'Gemini 3.5 Flash-Lite',
      badge: 'Ultra Fast',
      category: 'Frontier High-Speed',
      description: 'Lightweight, ultra-fast generation engineered for velocity and instant turnaround.'
    },
    {
      id: 'gemma-2-27b-it',
      name: 'Gemma 2 27B',
      badge: 'Open Weights',
      category: 'Open Source Frontier',
      description: 'Google DeepMind high-performance 27B instruction-tuned open weights model.'
    }
  ],

  // Top 3 Frontier Models for Visuals & Image Generation (Nano Banana Suite)
  image: [
    {
      id: 'gemini-nano-banana-2.1',
      name: 'Nano Banana 2.1',
      badge: 'New Flagship Image',
      category: 'Nano Banana Creative',
      description: 'High-efficiency image generation with state-of-the-art typography, photorealism, and search grounding.'
    },
    {
      id: 'gemini-3-pro-image',
      name: 'Nano Banana Pro',
      badge: 'Studio 4K & Thinking',
      category: 'Nano Banana Creative',
      description: 'Professional design engine with reasoning core for studio-quality 4K visuals and complex layouts.'
    },
    {
      id: 'gemini-3.1-flash-lite-image',
      name: 'Nano Banana 2 Lite',
      badge: 'Fast & Lightweight',
      category: 'Nano Banana Creative',
      description: 'Ultra-fast, cost-effective image generator designed for rapid social asset creation.'
    }
  ]
};

// Default selections
export const DEFAULT_TEXT_MODEL = 'gemini-3.8-flash';
export const DEFAULT_DECONSTRUCT_MODEL = 'gemini-3.8-flash';
export const DEFAULT_IMAGE_MODEL = 'gemini-nano-banana-2.1';

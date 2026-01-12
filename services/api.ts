import Anthropic from '@anthropic-ai/sdk'

// Initialize Anthropic Client (client-side only for prototype)
export const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

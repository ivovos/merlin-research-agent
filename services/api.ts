import Anthropic from '@anthropic-ai/sdk'

const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

if (!apiKey) {
  console.warn('[Merlin] Warning: VITE_ANTHROPIC_API_KEY is not set. API calls will fail.')
} else {
  console.log('[Merlin] Anthropic API key configured')
}

// Initialize Anthropic Client (client-side only for prototype)
export const anthropic = new Anthropic({
  apiKey: apiKey || 'missing-key',
  dangerouslyAllowBrowser: true,
})

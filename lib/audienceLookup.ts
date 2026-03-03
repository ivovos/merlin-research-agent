import { PICKER_AUDIENCES, type PickerAudience } from '@/components/chat/AudiencePicker'
import type { AudienceDetails } from '@/types'

// O(1) lookup map built once at module load
const audienceMap = new Map<string, PickerAudience>(
  PICKER_AUDIENCES.map(a => [a.id, a])
)

export function getAudienceById(id: string): PickerAudience | undefined {
  return audienceMap.get(id)
}

export interface TextSegment {
  type: 'text' | 'mention'
  value: string
  audience?: PickerAudience
}

/**
 * Split text into plain-text and @mention segments.
 * Only recognized audience IDs are marked as mentions.
 */
export function parseTextWithMentions(text: string): TextSegment[] {
  const segments: TextSegment[] = []
  const regex = /@([\w-]+)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }
    const audience = audienceMap.get(match[1])
    if (audience) {
      segments.push({ type: 'mention', value: match[0], audience })
    } else {
      // Unknown @token — treat as plain text
      segments.push({ type: 'text', value: match[0] })
    }
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) })
  }
  return segments
}

/** Convert a PickerAudience to AudienceDetails for the detail overlay. */
export function pickerToAudienceDetails(p: PickerAudience): AudienceDetails {
  return {
    id: p.id,
    name: p.label,
    icon: p.icon,
    agents: p.agents,
    description: p.description,
    segments: [],
    updatedAt: new Date().toISOString(),
    source: 'electric-twin',
    sourceLabel: p.category,
  }
}

export interface QuickPollAudience {
  id: string
  name: string
  description: string
  size: number
}

export const QUICK_POLL_AUDIENCES: QuickPollAudience[] = [
  { id: 'uk-pop', name: 'UK Population', description: 'Nationally representative UK sample', size: 1000 },
  { id: 'uk-grocery', name: 'UK Grocery Shoppers', description: 'Regular grocery buyers in the UK', size: 300 },
  { id: 'us-health', name: 'US Health-Conscious', description: 'Health-focused consumers in the US', size: 500 },
  { id: 'uk-young-urban', name: 'UK Young Urban', description: 'Urban dwellers aged 18\u201335 in the UK', size: 250 },
  { id: 'b2b-decision', name: 'B2B Decision Makers', description: 'Senior business decision makers', size: 200 },
  { id: 'uk-parents', name: 'UK Parents', description: 'Parents with children under 16 in the UK', size: 300 },
]

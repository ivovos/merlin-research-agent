/** Tailwind class strings for sentiment badge styling. Uses the new design token classes. */
export const SENTIMENT_COLORS: Record<string, string> = {
  positive: 'bg-sentiment-positive-subtle text-sentiment-positive',
  negative: 'bg-sentiment-negative-subtle text-sentiment-negative',
  neutral: 'bg-sentiment-neutral-subtle text-sentiment-neutral',
  mixed: 'bg-sentiment-mixed-subtle text-sentiment-mixed',
};

export type SentimentType = 'positive' | 'negative' | 'neutral' | 'mixed';

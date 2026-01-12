/**
 * Represents a single selected segment from a chart bar
 */
export interface SelectedSegment {
  questionId: string;
  questionText: string;
  answerLabel: string;
  percentage: number;
  respondents: number;
}

/**
 * Represents the collection of selected segments
 */
export interface SelectedSegments {
  segments: SelectedSegment[];
  totalRespondents: number;
}

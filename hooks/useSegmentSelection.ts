import { useState, useCallback } from 'react';
import type { SelectedSegment, SelectedSegments } from '@/types';

export interface UseSegmentSelectionReturn {
  selectedSegments: SelectedSegments;
  canvasId: string | null;
  selectSegment: (segment: SelectedSegment, canvasId: string) => void;
  removeSegment: (questionId: string, answerLabel: string) => void;
  clearSegments: () => void;
  hasSelection: boolean;
  /** Check if selection belongs to a specific canvas */
  isForCanvas: (canvasId: string) => boolean;
}

const INITIAL_STATE: SelectedSegments = {
  segments: [],
  totalRespondents: 0,
};

/**
 * Hook for managing segment selection state
 * Supports additive/toggle selection of chart bars
 * Selection is scoped to a specific canvas
 */
export function useSegmentSelection(): UseSegmentSelectionReturn {
  const [selectedSegments, setSelectedSegments] = useState<SelectedSegments>(INITIAL_STATE);
  const [canvasId, setCanvasId] = useState<string | null>(null);

  /**
   * Toggle segment selection (additive if not selected, removes if already selected)
   * If selecting on a different canvas, clears previous selection first
   */
  const selectSegment = useCallback((segment: SelectedSegment, segmentCanvasId: string) => {
    setSelectedSegments((prev) => {
      // If selecting on a different canvas, start fresh
      if (canvasId !== null && canvasId !== segmentCanvasId) {
        setCanvasId(segmentCanvasId);
        const totalRespondents = segment.respondents;
        return { segments: [segment], totalRespondents };
      }

      // Set canvas ID if not already set
      if (canvasId === null) {
        setCanvasId(segmentCanvasId);
      }

      // Check if this segment is already selected
      const existingIndex = prev.segments.findIndex(
        (s) => s.questionId === segment.questionId && s.answerLabel === segment.answerLabel
      );

      let newSegments: SelectedSegment[];
      if (existingIndex >= 0) {
        // Remove if already selected (toggle off)
        newSegments = prev.segments.filter((_, i) => i !== existingIndex);
      } else {
        // Add to selection (additive)
        newSegments = [...prev.segments, segment];
      }

      const totalRespondents = newSegments.reduce((sum, s) => sum + s.respondents, 0);

      // If no segments left, clear canvas ID
      if (newSegments.length === 0) {
        setCanvasId(null);
      }

      return { segments: newSegments, totalRespondents };
    });
  }, [canvasId]);

  /**
   * Remove a specific segment from selection
   */
  const removeSegment = useCallback((questionId: string, answerLabel: string) => {
    setSelectedSegments((prev) => {
      const newSegments = prev.segments.filter(
        (s) => !(s.questionId === questionId && s.answerLabel === answerLabel)
      );
      const totalRespondents = newSegments.reduce((sum, s) => sum + s.respondents, 0);

      // If no segments left, clear canvas ID
      if (newSegments.length === 0) {
        setCanvasId(null);
      }

      return { segments: newSegments, totalRespondents };
    });
  }, []);

  /**
   * Clear all selected segments
   */
  const clearSegments = useCallback(() => {
    setSelectedSegments(INITIAL_STATE);
    setCanvasId(null);
  }, []);

  /**
   * Check if selection belongs to a specific canvas
   */
  const isForCanvas = useCallback((checkCanvasId: string) => {
    return canvasId === checkCanvasId;
  }, [canvasId]);

  const hasSelection = selectedSegments.segments.length > 0;

  return {
    selectedSegments,
    canvasId,
    selectSegment,
    removeSegment,
    clearSegments,
    hasSelection,
    isForCanvas,
  };
}

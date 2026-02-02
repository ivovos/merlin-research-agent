import React, { useState, useMemo } from 'react';
import type { QuestionResult, SelectedSegment, SelectedSegments } from '@/types';
import type { BrandColors } from '@/types/audience';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { EditQuestionModal } from './EditQuestionModal';
import { cn } from '@/lib/utils';
import { MoreHorizontal, Pencil, RefreshCw, Share, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Default brand colors (MUBI)
const DEFAULT_BRAND_COLORS: BrandColors = {
  primary: '#2768E3',   // MUBI Blue
  secondary: '#1BD571', // MUBI Green
  tertiary: '#E32768',  // MUBI Pink
  quaternary: '#D5711B', // MUBI Orange
};

interface QuestionCardProps {
  data: QuestionResult;
  index: number;
  canvasId?: string;
  onEditQuestion?: (questionId: string, newText: string, segments: string[]) => void;
  onBarSelect?: (segment: SelectedSegment, canvasId: string) => void;
  selectedSegments?: SelectedSegments;
  brandColors?: BrandColors;
  /** Compact mode removes border/shadow for expanded canvas view */
  compact?: boolean;
  /** Override question title (used in expanded canvas to ensure full question is shown) */
  questionTitle?: string;
}

// Helper to get computed CSS variable value
const getCSSVariable = (varName: string): string => {
  if (typeof window === 'undefined') return '#000000';
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return value ? `hsl(${value})` : '#000000';
};

export const QuestionCard: React.FC<QuestionCardProps> = ({
  data,
  index,
  canvasId,
  onEditQuestion,
  onBarSelect,
  selectedSegments,
  brandColors = DEFAULT_BRAND_COLORS,
  compact = false,
  questionTitle,
}) => {
  // Use questionTitle prop if provided, otherwise fall back to data.question
  const displayQuestion = questionTitle || data.question;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Get computed colors for Recharts
  const mutedForegroundColor = useMemo(() => getCSSVariable('--muted-foreground'), []);
  const foregroundColor = useMemo(() => getCSSVariable('--foreground'), []);

  // Use brand colors for segments
  const segmentColors = useMemo(() => [
    brandColors.primary,
    brandColors.secondary,
    brandColors.tertiary || '#E32768',
    brandColors.quaternary || '#D5711B',
  ], [brandColors]);

  // Check if a specific bar is selected
  const isBarSelected = (label: string) => {
    if (!selectedSegments || selectedSegments.segments.length === 0) return false;
    return selectedSegments.segments.some(
      seg => seg.questionId === data.id && seg.answerLabel === label
    );
  };

  // Check if any bars are selected (to determine if we should show inactive state)
  const hasAnySelection = selectedSegments && selectedSegments.segments.length > 0;

  // Handle bar click
  const handleBarClick = (entry: any) => {
    if (!onBarSelect || !canvasId) return;
    const percentage = entry.percentage || 0;
    const baseRespondents = data.respondents || 0;
    const respondentCount = Math.round((percentage / 100) * baseRespondents);
    onBarSelect({
      questionId: data.id,
      questionText: data.question,
      answerLabel: entry.label,
      percentage,
      respondents: isNaN(respondentCount) ? 0 : respondentCount,
    }, canvasId);
  };
  
  // Helper to parse percentage values (handles "37.2%" strings)
  const parsePercentage = (value: unknown): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace('%', '').trim();
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Normalize and sort options - handle both array and object formats
  const sortedData = useMemo(() => {
    const opts = data.options;
    let normalized: Array<{ label: string; percentage: number; [key: string]: unknown }> = [];

    if (Array.isArray(opts)) {
      normalized = opts.filter(opt => opt && typeof opt.label === 'string').map(opt => ({
        ...opt,
        label: String(opt.label),
        percentage: parsePercentage(opt.percentage)
      }));
    } else if (opts && typeof opts === 'object') {
      // Handle object format like { "Gen Z": 45, "Millennials": 55 }
      normalized = Object.entries(opts).map(([label, value]) => ({
        label,
        percentage: parsePercentage(value)
      }));
    }

    if (normalized.length === 0) return [];

    return normalized.sort((a, b) => {
      const aVal = a.percentage || 0;
      const bVal = b.percentage || 0;
      return bVal - aVal;
    });
  }, [data.options]);

  // For multi-segment comparison: restructure data so each segment becomes a separate row
  // This enables vertical stacking: Label -> Segment1 bar, Segment2 bar (stacked vertically)
  const verticalSegmentData = useMemo(() => {
    if (!data.segments || data.segments.length === 0) return null;

    // Check if options have segment data
    if (sortedData.length === 0 || sortedData[0][data.segments[0]] === undefined) return null;

    // Transform: for each option, create a row for each segment
    // Use a unique key combining label and segment index for proper Y-axis spacing
    const result: Array<{
      label: string;
      uniqueKey: string; // Unique key for Y-axis positioning
      segment: string;
      segmentIndex: number;
      value: number;
      isFirst: boolean; // Is this the first segment for this option (for label display)
    }> = [];

    sortedData.forEach((option, optionIdx) => {
      data.segments!.forEach((seg, segIdx) => {
        result.push({
          label: option.label,
          uniqueKey: `${optionIdx}-${segIdx}`, // Unique key for each bar
          segment: seg,
          segmentIndex: segIdx,
          value: parsePercentage(option[seg]),
          isFirst: segIdx === 0,
        });
      });
    });

    return result;
  }, [sortedData, data.segments]);


  return (
    <div className={cn(
      "bg-card rounded-2xl p-6 mb-6",
      !compact && "shadow-sm border border-border"
    )}>
      {!compact && (
        <div className="flex justify-between items-start mb-4">
          <h4 className="text-sm font-semibold text-muted-foreground">Question {index + 1}</h4>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{data.respondents} respondents</span>
            {/* Action dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => console.log('Share question', data.id)}>
                  <Share className="w-4 h-4 mr-2" />
                  Share this
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit question
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log('Re-run question')}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Re-run question
                </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => console.log('Add audience')}>
                <Users className="w-4 h-4 mr-2" />
                Add another audience
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      )}

      {compact ? (
        // Compact layout: Question with 3-dot menu, respondents below
        <div className="mb-4">
          <div className="flex items-start gap-2">
            <h3 className="text-lg font-bold text-foreground leading-tight flex-1">
              {displayQuestion}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground flex-shrink-0 -mt-1">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => console.log('Share question', data.id)}>
                  <Share className="w-4 h-4 mr-2" />
                  Share this
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit question
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log('Re-run question')}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Re-run question
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => console.log('Add audience')}>
                  <Users className="w-4 h-4 mr-2" />
                  Add another audience
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <span className="text-sm text-muted-foreground mt-2 block">{data.respondents} respondents</span>
        </div>
      ) : (
        <h3 className="text-lg font-bold text-foreground mb-6 leading-tight">
          {displayQuestion}
        </h3>
      )}

      <div className="w-full [&_svg]:outline-none [&_svg]:focus:outline-none [&_.recharts-wrapper]:outline-none">
        {sortedData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">No data available</p>
          </div>
        ) : verticalSegmentData ? (
          // Multi-segment vertical comparison chart
          // Calculate height: each option needs space for all its segment bars
          <ResponsiveContainer width="100%" height={Math.max(250, sortedData.length * (data.segments?.length || 1) * 20 + 40)}>
            <BarChart
              layout="vertical"
              data={verticalSegmentData}
              margin={{ top: 0, right: 60, left: 10, bottom: 0 }}
              barSize={12}
              barGap={2}
              barCategoryGap="20%"
            >
              <XAxis
                type="number"
                hide
                domain={[0, 100]}
              />
              <YAxis
                dataKey="uniqueKey"
                type="category"
                width={260}
                tick={({ x, y, payload, index: tickIndex }) => {
                  // Only show label on the first segment row for each option
                  const item = verticalSegmentData[tickIndex];
                  if (!item?.isFirst) return null;

                  const label = item.label;
                  const maxCharsPerLine = 40;

                  // Split label into lines if too long
                  const words = label.split(' ');
                  const lines: string[] = [];
                  let currentLine = '';

                  words.forEach((word) => {
                    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
                      currentLine = (currentLine + ' ' + word).trim();
                    } else {
                      if (currentLine) lines.push(currentLine);
                      currentLine = word;
                    }
                  });
                  if (currentLine) lines.push(currentLine);

                  // Position label in the middle of the segment group
                  const segmentCount = data.segments!.length;
                  const segmentGroupOffset = ((segmentCount - 1) / 2) * 20; // Approximate bar height + gap

                  return (
                    <text
                      x={x}
                      y={y + segmentGroupOffset}
                      textAnchor="end"
                      fill={mutedForegroundColor}
                      fontSize={14}
                      dominantBaseline="middle"
                    >
                      {lines.map((line, i) => (
                        <tspan
                          key={i}
                          x={x}
                          dy={i === 0 ? 0 : 16}
                        >
                          {line}
                        </tspan>
                      ))}
                    </text>
                  );
                }}
                interval={0}
                axisLine={false}
                tickLine={false}
              />
              <Bar
                dataKey="value"
                radius={[0, 4, 4, 0]}
                onClick={(entry) => handleBarClick({ ...entry, percentage: entry.value })}
                cursor={onBarSelect ? 'pointer' : undefined}
              >
                {verticalSegmentData.map((entry, i) => {
                  return (
                    <Cell
                      key={`cell-${i}`}
                      fill={segmentColors[entry.segmentIndex % segmentColors.length]}
                      fillOpacity={0.9}
                    />
                  );
                })}
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(val: any) => `${val}%`}
                  offset={12}
                  style={{ fill: foregroundColor, fontSize: '14px', fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          // Default single bar chart (no segments)
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              layout="vertical"
              data={sortedData}
              margin={{ top: 0, right: 60, left: 10, bottom: 0 }}
              barSize={24}
              barCategoryGap="15%"
            >
              <XAxis
                type="number"
                hide
                domain={[0, 100]}
              />
              <YAxis
                dataKey="label"
                type="category"
                width={260}
                tick={({ x, y, payload }) => {
                  const label = String(payload.value);
                  const maxCharsPerLine = 40;

                  // Split label into lines if too long
                  const words = label.split(' ');
                  const lines: string[] = [];
                  let currentLine = '';

                  words.forEach((word) => {
                    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
                      currentLine = (currentLine + ' ' + word).trim();
                    } else {
                      if (currentLine) lines.push(currentLine);
                      currentLine = word;
                    }
                  });
                  if (currentLine) lines.push(currentLine);

                  // For multi-line labels, offset the first line up
                  const lineHeight = 16;
                  const offsetY = lines.length > 1 ? -((lines.length - 1) * lineHeight) / 2 : 0;

                  return (
                    <text
                      x={x}
                      y={y}
                      textAnchor="end"
                      fill={mutedForegroundColor}
                      fontSize={14}
                      dominantBaseline="middle"
                    >
                      {lines.map((line, i) => (
                        <tspan
                          key={i}
                          x={x}
                          dy={i === 0 ? offsetY : lineHeight}
                        >
                          {line}
                        </tspan>
                      ))}
                    </text>
                  );
                }}
                interval={0}
                axisLine={false}
                tickLine={false}
              />
              <Bar
                dataKey="percentage"
                fill={segmentColors[0]}
                fillOpacity={0.9}
                radius={[4, 4, 4, 4]}
                onClick={(entry) => handleBarClick(entry)}
                cursor={onBarSelect ? 'pointer' : undefined}
              >
                {sortedData.map((entry, i) => {
                  const selected = isBarSelected(entry.label);
                  const opacity = hasAnySelection ? (selected ? 1 : 0.3) : 0.9;
                  return (
                    <Cell
                      key={`cell-${i}`}
                      fill={segmentColors[0]}
                      fillOpacity={opacity}
                    />
                  );
                })}
                <LabelList
                  dataKey="percentage"
                  position="right"
                  formatter={(val: any) => `${val}%`}
                  offset={12}
                  style={{ fill: foregroundColor, fontSize: '14px', fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Explicit Legend below chart for comparisons */}
      {data.segments && data.segments.length > 0 && (
        <div className="flex items-center justify-center gap-6 mt-2 text-sm text-muted-foreground">
          {data.segments.map((seg, i) => (
            <div key={seg} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: segmentColors[i % segmentColors.length]
                }}
              />
              {seg}
            </div>
          ))}
        </div>
      )}

      <EditQuestionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialQuestion={data.question}
        initialSegments={data.segments}
        onSave={(q, s) => onEditQuestion?.(data.id, q, s)}
      />
    </div>
  );
};
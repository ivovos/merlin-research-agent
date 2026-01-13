import React, { useState, useMemo } from 'react';
import type { QuestionResult, SelectedSegment, SelectedSegments } from '@/types';
import type { BrandColors } from '@/types/audience';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LabelList, Cell } from 'recharts';
import { EditQuestionModal } from './EditQuestionModal';
import { cn } from '@/lib/utils';
import { MoreHorizontal, Pencil, RefreshCw, Users } from 'lucide-react';
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
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Get computed colors for Recharts
  const mutedForegroundColor = useMemo(() => getCSSVariable('--muted-foreground'), []);

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
    const respondentCount = Math.round(((entry.percentage || 0) / 100) * data.respondents);
    onBarSelect({
      questionId: data.id,
      questionText: data.question,
      answerLabel: entry.label,
      percentage: entry.percentage || 0,
      respondents: respondentCount,
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
    const result: Array<{
      label: string;
      segment: string;
      segmentIndex: number;
      value: number;
      isFirst: boolean; // Is this the first segment for this option (for label display)
    }> = [];

    sortedData.forEach((option) => {
      data.segments!.forEach((seg, segIdx) => {
        result.push({
          label: option.label,
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
    <div className="bg-card rounded-2xl p-6 mb-6 shadow-sm animate-in slide-in-from-bottom-2 border border-border">
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

      <h3 className="text-lg font-bold text-foreground mb-6 leading-tight">
        {data.question}
      </h3>

      <div className="h-[250px] w-full">
        {sortedData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">No data available</p>
          </div>
        ) : verticalSegmentData ? (
          // Multi-segment vertical comparison chart
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={verticalSegmentData}
              margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
              barSize={16}
              barGap={2}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <XAxis
                type="number"
                hide
                domain={[0, 100]}
              />
              <YAxis
                dataKey="label"
                type="category"
                width={180}
                tick={({ x, y, payload, index: tickIndex }) => {
                  // Only show label on the first segment row for each option
                  const item = verticalSegmentData[tickIndex];
                  if (!item?.isFirst) return null;
                  const isHovered = hoveredIndex !== null && verticalSegmentData[hoveredIndex]?.label === payload.value;
                  const opacity = hoveredIndex === null ? 1 : (isHovered ? 1 : 0.3);
                  return (
                    <text
                      x={x}
                      y={y}
                      dy={data.segments!.length > 1 ? 4 : 0}
                      textAnchor="end"
                      fill={mutedForegroundColor}
                      fontSize={14}
                      opacity={opacity}
                    >
                      {payload.value}
                    </text>
                  );
                }}
                interval={0}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                isAnimationActive={false}
                offset={100}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div
                        className="bg-popover border border-border p-3 rounded shadow-lg text-sm"
                      >
                        <p className="font-semibold text-popover-foreground mb-1">{item.label}</p>
                        <p className="flex justify-between gap-4" style={{ color: segmentColors[item.segmentIndex] }}>
                          <span>{item.segment}:</span>
                          <span>{item.value}%</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="value"
                radius={[0, 4, 4, 0]}
                onClick={(entry) => handleBarClick({ ...entry, percentage: entry.value })}
                cursor={onBarSelect ? 'pointer' : undefined}
                onMouseEnter={(_, idx) => setHoveredIndex(idx)}
              >
                {verticalSegmentData.map((entry, i) => {
                  const isHovered = hoveredIndex === i;
                  const opacity = hoveredIndex === null ? 0.9 : (isHovered ? 1 : 0.3);
                  return (
                    <Cell
                      key={`cell-${i}`}
                      fill={segmentColors[entry.segmentIndex % segmentColors.length]}
                      fillOpacity={opacity}
                    />
                  );
                })}
                <LabelList
                  dataKey="value"
                  position="insideRight"
                  formatter={(val: any) => `${val}%`}
                  style={{ fill: '#ffffff', fontSize: '11px', fontWeight: 'bold' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          // Default single bar chart (no segments)
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={sortedData}
              margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
              barSize={32}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <XAxis
                type="number"
                hide
                domain={[0, 100]}
              />
              <YAxis
                dataKey="label"
                type="category"
                width={180}
                tick={({ x, y, payload, index: tickIndex }) => {
                  const isHovered = hoveredIndex === tickIndex;
                  const opacity = hoveredIndex === null ? 1 : (isHovered ? 1 : 0.3);
                  return (
                    <text
                      x={x}
                      y={y}
                      textAnchor="end"
                      fill={mutedForegroundColor}
                      fontSize={14}
                      opacity={opacity}
                    >
                      {payload.value}
                    </text>
                  );
                }}
                interval={0}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                isAnimationActive={false}
                offset={100}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div
                        className="bg-popover border border-border p-3 rounded shadow-lg text-sm"
                      >
                        <p className="font-semibold text-popover-foreground mb-1">{payload[0].payload.label}</p>
                        <p className="flex justify-between gap-4">
                          <span>Value:</span>
                          <span>{payload[0].value}%</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="percentage"
                fill={segmentColors[0]}
                fillOpacity={0.9}
                radius={[4, 4, 4, 4]}
                onClick={(entry) => handleBarClick(entry)}
                cursor={onBarSelect ? 'pointer' : undefined}
                onMouseEnter={(_, idx) => setHoveredIndex(idx)}
              >
                {sortedData.map((entry, i) => {
                  const selected = isBarSelected(entry.label);
                  const isHovered = hoveredIndex === i;
                  const opacity = hoveredIndex === null
                    ? (hasAnySelection ? (selected ? 1 : 0.3) : 0.9)
                    : (isHovered ? 1 : 0.3);
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
                  style={{ fill: mutedForegroundColor, fontSize: '14px', fontWeight: 'bold' }}
                  content={({ x, y, value, index: labelIndex }) => {
                    const isHovered = hoveredIndex === labelIndex;
                    const opacity = hoveredIndex === null ? 1 : (isHovered ? 1 : 0.3);
                    return (
                      <text
                        x={Number(x) + 5}
                        y={Number(y)}
                        dy={4}
                        fill={mutedForegroundColor}
                        fontSize={14}
                        fontWeight="bold"
                        opacity={opacity}
                      >
                        {value}%
                      </text>
                    );
                  }}
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
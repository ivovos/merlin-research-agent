import React, { useState, useMemo } from 'react';
import { QuestionResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LabelList, Cell } from 'recharts';
import { EditQuestionModal } from './EditQuestionModal';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  data: QuestionResult;
  index: number;
  onEditQuestion?: (questionId: string, newText: string, segments: string[]) => void;
}

// Helper to get computed CSS variable value
const getCSSVariable = (varName: string): string => {
  if (typeof window === 'undefined') return '#000000';
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return value ? `hsl(${value})` : '#000000';
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

export const QuestionCard: React.FC<QuestionCardProps> = ({ data, index, onEditQuestion }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Get computed colors for Recharts
  const primaryColor = useMemo(() => getCSSVariable('--primary'), []);
  const mutedForegroundColor = useMemo(() => getCSSVariable('--muted-foreground'), []);

  // Sort data for better visualization (descending)
  const sortedData = useMemo(() => {
    if (!data.options || data.options.length === 0) return [];
    return [...data.options].sort((a, b) => {
      const aVal = parsePercentage(a.percentage);
      const bVal = parsePercentage(b.percentage);
      return bVal - aVal;
    });
  }, [data.options]);

  // Segment colors for multi-segment comparison
  const segmentColors = ['#2768E3', '#1BD571', '#E32768', '#D5711B'];

  // For multi-segment comparison: restructure data so each segment becomes a separate row
  const verticalSegmentData = useMemo(() => {
    if (!data.segments || data.segments.length === 0) return null;
    if (sortedData.length === 0 || sortedData[0][data.segments[0]] === undefined) return null;

    const result: Array<{
      label: string;
      segment: string;
      segmentIndex: number;
      value: number;
      isFirst: boolean;
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
        <span className="text-sm text-muted-foreground">{data.respondents} respondents</span>
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
              margin={{ top: 0, right: 50, left: 0, bottom: 0 }}
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
                      <div className="bg-popover border border-border p-3 rounded shadow-lg text-sm">
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
                  position="right"
                  formatter={(val: any) => `${val}%`}
                  style={{ fill: mutedForegroundColor, fontSize: '12px', fontWeight: 'bold' }}
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
              margin={{ top: 0, right: 50, left: 0, bottom: 0 }}
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
                      <div className="bg-popover border border-border p-3 rounded shadow-lg text-sm">
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
                fill={primaryColor}
                fillOpacity={0.9}
                radius={[4, 4, 4, 4]}
                onMouseEnter={(_, idx) => setHoveredIndex(idx)}
              >
                {sortedData.map((_, i) => {
                  const isHovered = hoveredIndex === i;
                  const opacity = hoveredIndex === null ? 0.9 : (isHovered ? 1 : 0.3);
                  return (
                    <Cell
                      key={`cell-${i}`}
                      fill={primaryColor}
                      fillOpacity={opacity}
                    />
                  );
                })}
                <LabelList
                  dataKey="percentage"
                  position="right"
                  formatter={(val: any) => `${val}%`}
                  style={{ fill: mutedForegroundColor, fontSize: '14px', fontWeight: 'bold' }}
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
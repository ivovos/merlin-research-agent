import React, { useState, useMemo } from 'react';
import type { QuestionResult, SelectedSegment, SelectedSegments } from '@/types';
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

interface QuestionCardProps {
  data: QuestionResult;
  index: number;
  canvasId?: string;
  onEditQuestion?: (questionId: string, newText: string, segments: string[]) => void;
  onBarSelect?: (segment: SelectedSegment, canvasId: string) => void;
  selectedSegments?: SelectedSegments;
}

// Helper to get computed CSS variable value
const getCSSVariable = (varName: string): string => {
  if (typeof window === 'undefined') return '#000000';
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return value ? `hsl(${value})` : '#000000';
};

export const QuestionCard: React.FC<QuestionCardProps> = ({ data, index, canvasId, onEditQuestion, onBarSelect, selectedSegments }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Get computed colors for Recharts
  const primaryColor = useMemo(() => getCSSVariable('--primary'), []);
  const mutedForegroundColor = useMemo(() => getCSSVariable('--muted-foreground'), []);

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
  
  // Sort data for better visualization (descending)
  const sortedData = useMemo(() => {
    if (!data.options || data.options.length === 0) return [];
    // Ensure options have valid structure
    return [...data.options]
      .filter(opt => opt && typeof opt.label === 'string')
      .sort((a, b) => {
        const aVal = a.percentage || 0;
        const bVal = b.percentage || 0;
        return bVal - aVal;
      });
  }, [data.options]);

  // Fallback colors for multi-segment charts
  const segmentColors = ['#3b82f6', '#9CA3AF', '#D1D5DB', '#F59E0B', '#10B981'];

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
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={sortedData}
              margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
              barSize={data.segments && data.segments.length > 0 ? 18 : 32}
              barGap={4}
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
                tick={{ fill: mutedForegroundColor, fontSize: 14 }}
                interval={0}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-popover border border-border p-3 rounded shadow-lg text-sm space-y-1">
                        <p className="font-semibold text-popover-foreground mb-1">{payload[0].payload.label}</p>
                        {payload.map((entry: any, i: number) => (
                          <p key={i} className="flex justify-between gap-4" style={{ color: entry.color }}>
                            <span>{entry.name}:</span>
                            <span>{entry.value}%</span>
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {data.segments && data.segments.length > 0 && sortedData.length > 0 && sortedData[0][data.segments[0]] !== undefined ? (
                // Multi-segment rendering - only if options have segment data
                data.segments.map((seg, i) => (
                  <Bar
                    key={seg}
                    dataKey={seg}
                    name={seg}
                    fill={i === 0 ? primaryColor : segmentColors[i % segmentColors.length]}
                    radius={[0, 4, 4, 0]}
                    onClick={(entry) => handleBarClick(entry)}
                    cursor={onBarSelect ? 'pointer' : undefined}
                  >
                    <LabelList
                      dataKey={seg}
                      position="right"
                      formatter={(val: any) => `${val}%`}
                      style={{ fill: mutedForegroundColor, fontSize: '14px' }}
                    />
                  </Bar>
                ))
              ) : (
                // Default single bar with selection support
                <Bar
                  dataKey="percentage"
                  fill={primaryColor}
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
                        fill={primaryColor}
                        fillOpacity={opacity}
                        stroke={selected ? primaryColor : undefined}
                        strokeWidth={selected ? 2 : 0}
                      />
                    );
                  })}
                  <LabelList
                    dataKey="percentage"
                    position="right"
                    formatter={(val: any) => `${val}%`}
                    style={{ fill: mutedForegroundColor, fontSize: '14px' }}
                  />
                </Bar>
              )}
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
                  backgroundColor: i === 0 ? primaryColor : segmentColors[i % segmentColors.length]
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
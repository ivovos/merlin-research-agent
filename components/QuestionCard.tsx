import React, { useState, useMemo } from 'react';
import { QuestionResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LabelList } from 'recharts';
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

export const QuestionCard: React.FC<QuestionCardProps> = ({ data, index, onEditQuestion }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Get computed colors for Recharts
  const primaryColor = useMemo(() => getCSSVariable('--primary'), []);
  const mutedForegroundColor = useMemo(() => getCSSVariable('--muted-foreground'), []);
  
  // Sort data for better visualization (descending)
  const sortedData = useMemo(() => {
    if (!data.options || data.options.length === 0) return [];
    return [...data.options].sort((a, b) => {
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
                tick={{ fill: mutedForegroundColor, fontSize: 13 }}
                interval={0}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-popover border border-border p-3 rounded shadow-lg text-xs space-y-1">
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
              {data.segments && data.segments.length > 0 ? (
                // Multi-segment rendering
                data.segments.map((seg, i) => (
                  <Bar
                    key={seg}
                    dataKey={seg}
                    name={seg}
                    fill={i === 0 ? primaryColor : segmentColors[i % segmentColors.length]}
                    radius={[0, 4, 4, 0]}
                  >
                    <LabelList 
                      dataKey={seg} 
                      position="right" 
                      formatter={(val: any) => `${val}%`} 
                      style={{ fill: mutedForegroundColor, fontSize: '12px' }} 
                    />
                  </Bar>
                ))
              ) : (
                // Default single bar
                <Bar 
                  dataKey="percentage" 
                  fill={primaryColor}
                  fillOpacity={0.9}
                  radius={[4, 4, 4, 4]}
                >
                  <LabelList 
                    dataKey="percentage" 
                    position="right" 
                    formatter={(val: any) => `${val}%`} 
                    style={{ fill: mutedForegroundColor, fontSize: '12px' }} 
                  />
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Explicit Legend below chart for comparisons */}
      {data.segments && data.segments.length > 0 && (
        <div className="flex items-center justify-center gap-6 mt-2 text-xs text-muted-foreground">
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
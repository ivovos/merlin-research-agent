import React, { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LabelList,
  Tooltip,
  Legend,
} from 'recharts'
import type { Finding } from '@/types'
import { getBrandColorArray } from '@/lib/brandDefaults'
import { cn } from '@/lib/utils'

interface FindingChartProps {
  finding: Finding
  compact?: boolean
  className?: string
}

// Wrap long labels across lines
function wrapLabel(text: string, maxChars: number = 30): string[] {
  if (text.length <= maxChars) return [text]
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    if (current.length + word.length + 1 > maxChars && current) {
      lines.push(current)
      current = word
    } else {
      current = current ? `${current} ${word}` : word
    }
  }
  if (current) lines.push(current)
  return lines
}

// Custom Y-axis tick that wraps long labels
const WrappedYAxisTick = ({ x, y, payload }: any) => {
  const lines = wrapLabel(payload.value, 25)
  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line: string, i: number) => (
        <text
          key={i}
          x={-8}
          y={0}
          dy={i * 14 - ((lines.length - 1) * 7)}
          textAnchor="end"
          className="fill-muted-foreground"
          fontSize={11}
        >
          {line}
        </text>
      ))}
    </g>
  )
}

export const FindingChart: React.FC<FindingChartProps> = ({
  finding,
  compact = false,
  className,
}) => {
  const brandColors = getBrandColorArray()
  const { chartType, chartData } = finding

  // Determine segment keys for grouped/stacked bar
  const segmentKeys = useMemo(() => {
    if (chartType !== 'grouped_bar' && chartType !== 'stacked_bar') return []
    if (!chartData || chartData.length === 0) return []
    // Keys other than 'name' are segment keys
    return Object.keys(chartData[0]).filter(k => k !== 'name' && k !== 'gap')
  }, [chartType, chartData])

  const chartHeight = useMemo(() => {
    const itemCount = chartData?.length || 0
    if (chartType === 'grouped_bar' && segmentKeys.length > 1) {
      return Math.max(compact ? 200 : 280, itemCount * segmentKeys.length * 18 + 60)
    }
    return Math.max(compact ? 180 : 250, itemCount * 28 + 40)
  }, [chartData, chartType, segmentKeys, compact])

  if (!chartData || chartData.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-8 text-muted-foreground text-sm', className)}>
        No chart data
      </div>
    )
  }

  // Bar chart (single value per item)
  if (chartType === 'bar') {
    return (
      <div className={cn('w-full', className)} style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 40, left: compact ? 80 : 120, bottom: 0 }}
          >
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="name"
              width={compact ? 80 : 120}
              tick={WrappedYAxisTick}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: 'var(--accent)', opacity: 0.5 }}
              contentStyle={{
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: 12,
              }}
            />
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              barSize={compact ? 14 : 18}
              fill={brandColors[0]}
            >
              <LabelList
                dataKey="value"
                position="right"
                formatter={(v: unknown) => `${v}%`}
                className="fill-foreground"
                fontSize={11}
                fontWeight={600}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  // Grouped bar chart (multiple segments per item)
  if (chartType === 'grouped_bar') {
    return (
      <div className={cn('w-full', className)} style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 40, left: compact ? 80 : 120, bottom: 20 }}
          >
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="name"
              width={compact ? 80 : 120}
              tick={WrappedYAxisTick}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: 'var(--accent)', opacity: 0.5 }}
              contentStyle={{
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: 12,
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={24}
              iconType="square"
              iconSize={8}
              wrapperStyle={{ fontSize: 11 }}
            />
            {segmentKeys.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                fill={brandColors[i % brandColors.length]}
                radius={[0, 4, 4, 0]}
                barSize={compact ? 10 : 14}
              >
                <LabelList
                  dataKey={key}
                  position="right"
                  formatter={(v: unknown) => `${v}%`}
                  className="fill-foreground"
                  fontSize={10}
                  fontWeight={500}
                />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  // Stacked bar
  if (chartType === 'stacked_bar') {
    return (
      <div className={cn('w-full', className)} style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 40, left: compact ? 80 : 120, bottom: 20 }}
          >
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="name"
              width={compact ? 80 : 120}
              tick={WrappedYAxisTick}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: 'var(--accent)', opacity: 0.5 }}
              contentStyle={{
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: 12,
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={24}
              iconType="square"
              iconSize={8}
              wrapperStyle={{ fontSize: 11 }}
            />
            {segmentKeys.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="stack"
                fill={brandColors[i % brandColors.length]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  // Fallback for unsupported chart types
  return (
    <div className={cn('flex items-center justify-center py-8 text-muted-foreground text-xs border border-dashed rounded-lg', className)}>
      {chartType} chart (coming soon)
    </div>
  )
}

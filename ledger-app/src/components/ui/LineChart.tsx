"use client";

import { useState } from "react";

interface DataPoint {
  label: string;
  income: number;
  expenses: number;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
}

export default function LineChart({ data, height = 300 }: LineChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Constants for dimensions
  const paddingX = 40;
  const paddingY = 40;
  
  // Wait for client to render to avoid hydration mismatch on width? 
  // No, SVG can use viewBox for auto-scaling.
  const width = 1000; // viewBox width

  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.income, d.expenses))
  );
  
  // Y-axis steps (e.g. 4 steps)
  const steps = 4;
  const stepValue = maxVal / steps;

  // Scale functions
  const scaleX = (index: number) =>
    paddingX + (index * (width - paddingX * 2)) / (data.length - 1 || 1);
  const scaleY = (val: number) =>
    height - paddingY - (val / (maxVal || 1)) * (height - paddingY * 2);

  // Path generators
  const generatePath = (key: 'income' | 'expenses') => {
    return data
      .map((d, i) => {
        const x = scaleX(i);
        const y = scaleY(d[key]);
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  const incomePath = generatePath('income');
  const expensePath = generatePath('expenses');

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        onMouseLeave={() => setHoverIndex(null)}
      >
        {/* Y-Axis Grid Lines */}
        {Array.from({ length: steps + 1 }).map((_, i) => {
          const y = height - paddingY - (i * (height - paddingY * 2)) / steps;
          return (
            <g key={i}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                className="stroke-rule stroke-[1]"
              />
              <text
                x={paddingX - 10}
                y={y + 4}
                className="fill-muted text-[10px] font-mono text-end"
                textAnchor="end"
              >
                {i === 0 ? '₹0' : '00'}
              </text>
            </g>
          );
        })}

        {/* X-Axis Labels */}
        {data.map((d, i) => {
          const x = scaleX(i);
          return (
            <text
              key={i}
              x={x}
              y={height - 10}
              className="fill-muted text-[10px] font-sans"
              textAnchor="middle"
            >
              {d.label}
            </text>
          );
        })}

        {/* Data Lines */}
        <path
          d={incomePath}
          fill="none"
          className="stroke-credit stroke-[2]"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={expensePath}
          fill="none"
          className="stroke-debit stroke-[2]"
          vectorEffect="non-scaling-stroke"
        />

        {/* Hover Interactions */}
        {data.map((d, i) => {
          const x = scaleX(i);
          return (
            <g key={`hover-${i}`}>
              {/* Invisible rect for larger hover target */}
              <rect
                x={x - (width / data.length) / 2}
                y={0}
                width={width / data.length}
                height={height}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(i)}
                className="cursor-crosshair"
              />
              
              {/* Hover Cursor Line */}
              {hoverIndex === i && (
                <line
                  x1={x}
                  y1={paddingY / 2}
                  x2={x}
                  y2={height - paddingY}
                  className="stroke-ink stroke-[1]"
                  vectorEffect="non-scaling-stroke"
                />
              )}

              {/* Hover Dots */}
              {hoverIndex === i && (
                <>
                  <circle
                    cx={x}
                    cy={scaleY(d.income)}
                    r={4}
                    className="fill-credit stroke-paper stroke-[2]"
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle
                    cx={x}
                    cy={scaleY(d.expenses)}
                    r={4}
                    className="fill-debit stroke-paper stroke-[2]"
                    vectorEffect="non-scaling-stroke"
                  />
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* HTML Tooltip (Absolute Positioning) */}
      {hoverIndex !== null && (
        <div
          className="absolute pointer-events-none transition-transform duration-75"
          style={{
            // Approximate position based on percentages
            left: `${(scaleX(hoverIndex) / width) * 100}%`,
            top: `${(Math.min(scaleY(data[hoverIndex].income), scaleY(data[hoverIndex].expenses)) / height) * 100}%`,
            transform: 'translate(-50%, -120%)'
          }}
        >
          <div className="bg-paper border border-rule rounded-xl p-4 shadow-sm min-w-[140px]">
            <p className="text-xs font-semibold text-ink mb-2">
              {data[hoverIndex].label} 2026
            </p>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-muted">Income</span>
              <span className="font-mono text-credit font-medium">
                ₹{data[hoverIndex].income.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted">Expenses</span>
              <span className="font-mono text-debit font-medium">
                ₹{data[hoverIndex].expenses.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

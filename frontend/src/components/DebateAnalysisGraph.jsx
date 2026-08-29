import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid
} from "recharts";
import LoadingSpinner from "./LoadingSpinner";

/**
 * Custom Tooltip component for displaying exact bar scores on hover
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        className="p-3 rounded-lg border border-[var(--line)] shadow-xl text-xs font-mono"
        style={{ backgroundColor: "var(--surface)", color: "var(--ink)" }}
      >
        <p className="font-semibold" style={{ color: data.color }}>
          {data.name}
        </p>
        <p className="mt-1 text-[var(--ink)]">
          Score: <span className="font-bold">{data.score}</span> / 100
        </p>
        {data.description && (
          <p className="mt-1 text-[var(--ink-muted)] italic text-[11px]">
            {data.description}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function DebateAnalysisGraph({
  supportData,
  opposeData,
  judgeData,
  loading = false
}) {
  // Extract or calculate scores from agent outputs
  const supportScore =
    typeof supportData?.score === "number"
      ? supportData.score
      : supportData?.applicable_sections?.length
      ? Math.min(100, Math.max(10, 78 + (supportData.applicable_sections.length * 4)))
      : null;

  const opposeScore =
    typeof opposeData?.score === "number"
      ? opposeData.score
      : opposeData?.applicable_sections?.length
      ? Math.min(100, Math.max(10, 72 + (opposeData.applicable_sections.length * 4)))
      : null;

  const judgeScore =
    typeof judgeData?.score === "number"
      ? judgeData.score
      : typeof judgeData?.overall_confidence === "number"
      ? Math.round(judgeData.overall_confidence * 100)
      : null;

  const hasData = supportScore !== null || opposeScore !== null || judgeScore !== null;

  const chartData = [
    {
      name: "Support Agent",
      score: supportScore || 0,
      color: "#4E9078",
      description: "Petitioner statutory claim strength"
    },
    {
      name: "Oppose Agent",
      score: opposeScore || 0,
      color: "#B25A50",
      description: "Respondent defense exception strength"
    },
    {
      name: "Final Judge",
      score: judgeScore || 0,
      color: "#C9A45E",
      description: "Adjudicated judicial confidence"
    }
  ];

  if (loading) {
    return (
      <div
        className="p-6 rounded-xl border border-[var(--line)] shadow-lg"
        style={{ backgroundColor: "var(--surface)", color: "var(--ink)" }}
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 mb-4">
          <h3 className="text-base font-serif font-semibold text-[var(--ink)] flex items-center gap-2">
            <span>📊</span> Debate Analysis
          </h3>
          <span className="text-xs font-mono text-[var(--brass)]">Score (0–100)</span>
        </div>
        <LoadingSpinner message="Debating legal pipeline & computing agent scores..." />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div
        className="p-6 rounded-xl border border-[var(--line)] shadow-lg space-y-3"
        style={{ backgroundColor: "var(--surface)", color: "var(--ink)" }}
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <h3 className="text-base font-serif font-semibold text-[var(--ink)] flex items-center gap-2">
            <span>📊</span> Debate Analysis
          </h3>
          <span className="text-xs font-mono text-[var(--ink-dim)]">Score (0–100)</span>
        </div>
        <div className="p-8 text-center space-y-2">
          <p className="text-sm font-serif text-[var(--ink-muted)]">No Active Debate Executed</p>
          <p className="text-xs font-mono text-[var(--ink-dim)]">
            File a dispute case query to generate real-time Support → Oppose → Judge reasoning scores.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-6 rounded-xl border border-[var(--line)] shadow-lg space-y-4"
      style={{ backgroundColor: "var(--surface)", color: "var(--ink)" }}
    >
      <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
        <div>
          <h3 className="text-base font-serif font-semibold text-[var(--ink)] flex items-center gap-2">
            <span>📊</span> Debate Analysis
          </h3>
          <p className="text-xs font-mono text-[var(--ink-muted)] mt-0.5">
            Support Agent → Oppose Agent → Final Judicial Bench Reasoning Pipeline
          </p>
        </div>
        <span className="text-xs font-mono text-[var(--brass)] px-2 py-0.5 rounded bg-[var(--brass-light)] border border-[var(--line-bright)]">
          Score (0–100)
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="var(--ink-muted)"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "var(--line)" }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              stroke="var(--ink-muted)"
              fontSize={11}
              axisLine={{ stroke: "var(--line)" }}
              unit=""
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--brass-light)" }} />
            <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={48}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-around text-xs font-mono text-[var(--ink-muted)] pt-2 border-t border-[var(--line)]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: "#4E9078" }}></span>
          Support: <strong style={{ color: "var(--ink)" }}>{supportScore || 0}</strong>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: "#B25A50" }}></span>
          Oppose: <strong style={{ color: "var(--ink)" }}>{opposeScore || 0}</strong>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: "#C9A45E" }}></span>
          Judge: <strong style={{ color: "var(--ink)" }}>{judgeScore || 0}</strong>
        </span>
      </div>
    </div>
  );
}

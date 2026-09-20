import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";
import FeaturesSection from "./FeaturesSection";

const chartData = [
  { metric: "Verifiability", traditional: 0, haqdaar: 100 },
  { metric: "Explainability", traditional: 30, haqdaar: 100 },
  { metric: "Consistency", traditional: 40, haqdaar: 100 }
];

const COLOR_TRADITIONAL = "#c4c4c0";
const COLOR_HAQDAAR = "#65a30d";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e5e0",
        borderRadius: "10px",
        padding: "0.65rem 0.9rem",
        fontSize: "0.82rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
      }}
    >
      <p style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color, margin: 0 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function FeaturesPage({ t }) {
  return (
    <main className="bento-grid">
      {/* Feature Cards Grid */}
      <FeaturesSection t={t} />

      {/* Why This Matters — Chart Section */}
      <section className="bento-card chart-section-card">
        <div className="features-header">
          <span className="features-pill-tag">DATA</span>
          <h3 className="features-title">
            {t.whyMattersHeading || "Why this matters"}
          </h3>
          <p className="features-subtitle">
            {t.whyMattersSubtitle ||
              "Haqdaar replaces opaque AI guesses with deterministic, policy-coded verification."}
          </p>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
              barGap={6}
              barCategoryGap="25%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e0" vertical={false} />
              <XAxis
                dataKey="metric"
                tick={{ fontSize: 13, fill: "#555", fontWeight: 500 }}
                axisLine={{ stroke: "#e5e5e0" }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: "#999" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
              <Legend
                wrapperStyle={{ fontSize: "0.82rem", paddingTop: "0.5rem" }}
                iconType="circle"
                iconSize={10}
              />
              <Bar
                dataKey="traditional"
                name="Traditional AI-guess tools"
                fill={COLOR_TRADITIONAL}
                radius={[6, 6, 0, 0]}
                maxBarSize={52}
              />
              <Bar
                dataKey="haqdaar"
                name="Haqdaar (policy-verified)"
                fill={COLOR_HAQDAAR}
                radius={[6, 6, 0, 0]}
                maxBarSize={52}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="chart-caption">
          {t.chartCaption ||
            "Illustrative comparison based on typical LLM-based eligibility tools vs. Haqdaar's policy-verified approach."}
        </p>
      </section>
    </main>
  );
}

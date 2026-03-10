import { useState } from "react";

interface Props {
  heatmap: number[][]; // 7 days x 24 hours, values = minutes
}

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hourLabels = Array.from({ length: 24 }, (_, i) => {
  if (i === 0) return "12a";
  if (i < 12) return `${i}a`;
  if (i === 12) return "12p";
  return `${i - 12}p`;
});

export default function HeatmapChart({ heatmap }: Props) {
  const [tooltip, setTooltip] = useState<{
    day: number;
    hour: number;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  const maxVal = Math.max(...heatmap.flat());

  function getOpacity(val: number) {
    if (maxVal === 0) return 0.05;
    return 0.05 + (val / maxVal) * 0.85;
  }

  return (
    <div className="relative">
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Hour labels */}
          <div className="flex ml-10 mb-1">
            {hourLabels.map((label, i) => (
              <div
                key={i}
                className="flex-1 text-center"
                style={{
                  fontSize: "9px",
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-faint)",
                }}
              >
                {i % 3 === 0 ? label : ""}
              </div>
            ))}
          </div>

          {/* Grid */}
          {heatmap.map((row, dayIdx) => (
            <div key={dayIdx} className="flex items-center gap-1 mb-1">
              <span
                className="w-9 text-right shrink-0"
                style={{
                  fontSize: "10px",
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-secondary)",
                }}
              >
                {dayLabels[dayIdx]}
              </span>
              <div className="flex flex-1 gap-[2px]">
                {row.map((val, hourIdx) => (
                  <div
                    key={hourIdx}
                    className="flex-1 rounded-sm cursor-pointer transition-transform hover:scale-110"
                    style={{
                      height: "20px",
                      background: `rgba(232, 93, 58, ${getOpacity(val)})`,
                    }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const parent =
                        e.currentTarget.closest(".relative")?.getBoundingClientRect();
                      if (parent) {
                        setTooltip({
                          day: dayIdx,
                          hour: hourIdx,
                          value: val,
                          x: rect.left - parent.left + rect.width / 2,
                          y: rect.top - parent.top - 8,
                        });
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-10 px-3 py-2 rounded-lg"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
            background: "rgba(8, 8, 8, 0.9)",
            border: "1px solid rgba(232, 93, 58, 0.3)",
            fontSize: "11px",
            fontFamily: "var(--font-mono)",
            color: "#f2e8dc",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: "#e85d3a", fontWeight: "bold" }}>
            {tooltip.value} min
          </span>
          <br />
          {dayLabels[tooltip.day]}{" "}
          {tooltip.hour === 0
            ? "12:00 AM"
            : tooltip.hour < 12
              ? `${tooltip.hour}:00 AM`
              : tooltip.hour === 12
                ? "12:00 PM"
                : `${tooltip.hour - 12}:00 PM`}
        </div>
      )}
    </div>
  );
}

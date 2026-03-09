import { useState } from "react";

const CV_OPTIONS = [
  {
    label: "General",
    file: "/docs/Caide_Spriestersbach_CV.pdf",
    description: "Full-stack / Software Engineering",
  },
];

export default function CVDownload() {
  const [isOpen, setIsOpen] = useState(false);

  if (CV_OPTIONS.length === 1) {
    return (
      <a
        href={CV_OPTIONS[0].file}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all"
        style={{
          background: "#e85d3a",
          color: "#080808",
          boxShadow: "0 0 20px rgba(232, 93, 58, 0.3)",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.boxShadow =
            "0 0 30px rgba(232, 93, 58, 0.5)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.boxShadow =
            "0 0 20px rgba(232, 93, 58, 0.3)";
        }}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        Download CV
      </a>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all"
        style={{
          background: "#e85d3a",
          color: "#080808",
          boxShadow: "0 0 20px rgba(232, 93, 58, 0.3)",
        }}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        Download CV
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute top-full mt-2 left-0 rounded-xl overflow-hidden min-w-[200px] z-10"
          style={{
            background: "#141414",
            border: "1px solid rgba(232, 213, 192, 0.12)",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
          }}
        >
          {CV_OPTIONS.map((option) => (
            <a
              key={option.label}
              href={option.file}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-3 transition-colors"
              style={{ color: "#f2e8dc" }}
              onClick={() => setIsOpen(false)}
              onMouseOver={(e) => {
                e.currentTarget.style.background =
                  "rgba(232, 93, 58, 0.1)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <p className="text-sm font-medium">{option.label}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {option.description}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

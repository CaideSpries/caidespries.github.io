interface YearEntry {
  year: number;
  source: string;
  topArtist?: string;
  topTrack?: string;
  totalMinutes?: number;
  uniqueArtists?: number;
}

interface Props {
  years: YearEntry[];
}

export default function YearSelector({ years }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {years.map((entry) => (
        <a
          key={entry.year}
          href={`/wrapped/${entry.year}`}
          className="group block"
          style={{ textDecoration: "none" }}
        >
          <div
            className="retro-card p-5 text-center transition-all duration-300"
            style={{ minWidth: "140px" }}
          >
            <p
              className="text-3xl font-black tracking-tight"
              style={{
                fontFamily: "var(--font-display)",
                color: "#e85d3a",
                textShadow:
                  "0 0 10px rgba(232, 93, 58, 0.3), 0 0 40px rgba(232, 93, 58, 0.1)",
              }}
            >
              {entry.year}
            </p>
            {entry.topArtist && (
              <p
                className="text-xs mt-2 truncate"
                style={{
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {entry.topArtist}
              </p>
            )}
            {entry.totalMinutes ? (
              <p
                className="text-[10px] font-mono mt-1"
                style={{ color: "var(--text-faint)" }}
              >
                {entry.totalMinutes.toLocaleString()} min
              </p>
            ) : (
              <p
                className="text-[10px] font-mono mt-1"
                style={{ color: "var(--text-faint)" }}
              >
                {entry.source === "api_snapshot" ? "API snapshot" : ""}
              </p>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}

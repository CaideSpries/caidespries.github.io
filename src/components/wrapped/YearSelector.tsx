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
          </div>
        </a>
      ))}
    </div>
  );
}

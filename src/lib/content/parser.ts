import type {
  PortfolioDocument,
  PortfolioSection,
  PortfolioMetadata,
} from "./types";

/**
 * Parse **Key:** Value metadata from markdown list items.
 * Handles both `- **Key:** Value` and `**Key:** Value` patterns.
 */
export function parseMetadata(content: string): PortfolioMetadata {
  const metadata: PortfolioMetadata = {};
  const lines = content.split("\n");
  for (const line of lines) {
    const match = line.match(/^\s*-?\s*\*\*(.+?):\*\*\s*(.+)/);
    if (match) {
      const key = match[1].trim();
      // Strip markdown links for the value
      let value = match[2].trim();
      const linkMatch = value.match(/\[(.+?)\]\((.+?)\)/);
      if (linkMatch) {
        value = linkMatch[1];
        metadata[`${key}Url`] = linkMatch[2];
      }
      metadata[key] = value;
    }
  }
  return metadata;
}

/**
 * Parse a markdown document into sections by heading level.
 */
export function parseSections(content: string): PortfolioSection[] {
  const lines = content.split("\n");
  const sections: PortfolioSection[] = [];
  let currentSection: PortfolioSection | null = null;
  let currentSubsection: PortfolioSection | null = null;
  let contentBuffer: string[] = [];

  function flushContent() {
    const text = contentBuffer.join("\n").trim();
    if (currentSubsection) {
      currentSubsection.content = text;
    } else if (currentSection) {
      currentSection.content = text;
    }
    contentBuffer = [];
  }

  for (const line of lines) {
    const h2Match = line.match(/^## (.+)/);
    const h3Match = line.match(/^### (.+)/);

    if (h2Match) {
      flushContent();
      if (currentSubsection && currentSection) {
        currentSection.subsections.push(currentSubsection);
        currentSubsection = null;
      }
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        name: h2Match[1].trim(),
        level: 2,
        content: "",
        subsections: [],
      };
      currentSubsection = null;
    } else if (h3Match) {
      flushContent();
      if (currentSubsection && currentSection) {
        currentSection.subsections.push(currentSubsection);
      }
      currentSubsection = {
        name: h3Match[1].trim(),
        level: 3,
        content: "",
        subsections: [],
      };
    } else if (!line.match(/^# /)) {
      contentBuffer.push(line);
    }
  }

  flushContent();
  if (currentSubsection && currentSection) {
    currentSection.subsections.push(currentSubsection);
  }
  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}

/**
 * Extract the H1 title from a markdown document.
 */
export function parseTitle(content: string): string {
  const match = content.match(/^# (.+)/m);
  return match ? match[1].trim() : "";
}

/**
 * Get a named section from parsed sections.
 */
export function getSection(
  sections: PortfolioSection[],
  name: string,
): PortfolioSection | undefined {
  return sections.find(
    (s) => s.name.toLowerCase() === name.toLowerCase(),
  );
}

/**
 * Parse bullet list items from section content.
 */
export function parseBulletList(content: string): string[] {
  return content
    .split("\n")
    .filter((line) => line.match(/^\s*-\s+/))
    .map((line) => line.replace(/^\s*-\s+/, "").trim());
}

/**
 * Parse a markdown table into an array of objects.
 */
export function parseTable(
  content: string,
): Record<string, string>[] {
  const lines = content
    .split("\n")
    .filter((l) => l.trim().startsWith("|"));
  if (lines.length < 2) return [];

  const headers = lines[0]
    .split("|")
    .map((h) => h.trim())
    .filter(Boolean);
  // Skip the separator line (index 1)
  return lines.slice(2).map((line) => {
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = cells[i] || "";
    });
    return row;
  });
}

/**
 * Parse a full portfolio markdown document.
 */
export function parseDocument(content: string): PortfolioDocument {
  const title = parseTitle(content);
  const sections = parseSections(content);
  const overviewSection = getSection(sections, "Overview");
  const metadata = overviewSection
    ? parseMetadata(overviewSection.content)
    : {};

  return { title, metadata, sections, raw: content };
}

/**
 * Strip inline markdown formatting for display.
 * Removes **bold**, *italic*, and replaces -- with an en dash.
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/\s--\s/g, " – ")
    .replace(/--/g, "–");
}

/**
 * Parse technology strings from "Technologies Used" section.
 * Handles `- **Category:** tool1, tool2` format.
 */
export function parseTechnologies(content: string): string[] {
  const techs: string[] = [];
  const lines = content.split("\n");
  for (const line of lines) {
    const match = line.match(/^\s*-\s+\*\*(.+?):\*\*\s*(.+)/);
    if (match) {
      const items = match[2].split(",").map((t) => t.trim());
      techs.push(...items);
    } else {
      const simpleMatch = line.match(/^\s*-\s+(.+)/);
      if (simpleMatch) {
        techs.push(simpleMatch[1].trim());
      }
    }
  }
  return techs;
}

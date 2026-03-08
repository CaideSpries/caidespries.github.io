import type { SkillCategory, Skill } from "./types";
import { parseSections, parseTable } from "./parser";

/**
 * Parse the skills.md file into categorised skill groups.
 * Handles both table format (| Skill | Proficiency | Context |)
 * and bullet list format.
 */
export function parseSkills(content: string): SkillCategory[] {
  const sections = parseSections(content);
  const categories: SkillCategory[] = [];

  for (const section of sections) {
    if (
      section.name === "Notes" ||
      section.name === "CV-Ready Bullets"
    )
      continue;

    const skills: Skill[] = [];
    const tableRows = parseTable(section.content);

    if (tableRows.length > 0) {
      for (const row of tableRows) {
        skills.push({
          name: row["Skill"] || "",
          proficiency: row["Proficiency"] || undefined,
          context: row["Context"] || "",
        });
      }
    } else {
      // Parse bullet list format
      const lines = section.content.split("\n");
      for (const line of lines) {
        const match = line.match(/^\s*-\s+(.+)/);
        if (match) {
          skills.push({
            name: match[1].trim(),
            context: "",
          });
        }
      }
    }

    if (skills.length > 0) {
      categories.push({ name: section.name, skills });
    }
  }

  return categories;
}

import fs from "node:fs";
import path from "node:path";
import {
  parseDocument,
  getSection,
  parseBulletList,
  parseTechnologies,
  parseMetadata,
  parseTable,
  stripMarkdown,
} from "./parser";
import { parseSkills } from "./skills-parser";
import type {
  Profile,
  Experience,
  Venture,
  Education,
  Project,
  ProjectSubsection,
  SkillCategory,
  Interest,
  Volunteering,
} from "./types";

// Portfolio content lives alongside the website repo in the career-portfolio
// During development: symlink or direct path
// In CI: git submodule at content/portfolio/
function getPortfolioPath(): string {
  const submodulePath = path.resolve("content/portfolio");
  if (fs.existsSync(submodulePath)) return submodulePath;
  // Fallback: parent directory (career-portfolio repo root)
  const parentPath = path.resolve("../../");
  if (fs.existsSync(path.join(parentPath, "profile.md")))
    return parentPath;
  throw new Error(
    "Portfolio content not found. Set up git submodule or symlink at content/portfolio/",
  );
}

function readFile(relativePath: string): string {
  const portfolioPath = getPortfolioPath();
  const fullPath = path.join(portfolioPath, relativePath);
  return fs.readFileSync(fullPath, "utf-8");
}

export function loadProfile(): Profile {
  const content = readFile("profile.md");
  const doc = parseDocument(content);
  const contactSection = getSection(doc.sections, "Contact");
  const contactMeta = contactSection
    ? parseMetadata(contactSection.content)
    : {};
  const titleSection = getSection(doc.sections, "Title");
  const summarySection = getSection(
    doc.sections,
    "Summary Variants",
  );

  const summaries: Record<string, string> = {};
  if (summarySection) {
    for (const sub of summarySection.subsections) {
      summaries[sub.name] = sub.content.trim();
    }
  }

  const notesSection = getSection(doc.sections, "Notes");
  const notes = notesSection
    ? parseBulletList(notesSection.content)
    : [];

  return {
    name: doc.title,
    location: contactMeta["Location"] || "",
    phone: contactMeta["Phone"] || "",
    email: contactMeta["Email"] || "",
    linkedin: contactMeta["LinkedIn"] || "",
    linkedinUrl: contactMeta["LinkedInUrl"] || "",
    github: contactMeta["GitHub"] || "",
    githubUrl: contactMeta["GitHubUrl"] || "",
    website: contactMeta["Website"] || "",
    websiteUrl: contactMeta["WebsiteUrl"] || "",
    title: titleSection ? titleSection.content.trim() : "",
    summaries,
    dateOfBirth:
      notes.find((n) => n.includes("Date of birth"))?.replace("Date of birth: ", "") || "",
    nationality:
      notes.find((n) => n.includes("citizen"))?.trim() || "",
  };
}

function parseExperienceFile(filePath: string): Experience {
  const content = readFile(filePath);
  const doc = parseDocument(content);

  const whatIDidSection = getSection(doc.sections, "What I Did");
  const techSection = getSection(
    doc.sections,
    "Technologies Used",
  );
  const achievementsSection = getSection(
    doc.sections,
    "Key Achievements",
  );
  const cvSection = getSection(doc.sections, "CV-Ready Bullets");
  const linkedinSection = getSection(
    doc.sections,
    "LinkedIn-Ready Description",
  );

  const timelineLines = doc.metadata["Timeline"]
    ? [doc.metadata["Timeline"]]
    : [];
  const overviewSection = getSection(doc.sections, "Overview");
  if (overviewSection) {
    const indentedLines = overviewSection.content
      .split("\n")
      .filter((l) => l.match(/^\s{2,}-\s+/));
    if (indentedLines.length > 0) {
      timelineLines.length = 0;
      timelineLines.push(
        ...indentedLines.map((l) => l.replace(/^\s+-\s+/, "").trim()),
      );
    }
  }

  return {
    title: doc.title,
    role: doc.metadata["Role"] || "",
    dates: stripMarkdown(doc.metadata["Dates"] || ""),
    location: doc.metadata["Location"] || "",
    industry: doc.metadata["Industry"] || "",
    website: doc.metadata["Website"] || doc.metadata["WebsiteUrl"],
    timeline: timelineLines.map(stripMarkdown),
    whatIDid: whatIDidSection ? whatIDidSection.subsections.map(s => ({
      ...s,
      name: stripMarkdown(s.name),
      content: stripMarkdown(s.content),
    })) : [],
    technologies: techSection
      ? parseTechnologies(techSection.content)
      : [],
    keyAchievements: achievementsSection
      ? parseBulletList(achievementsSection.content).map(stripMarkdown)
      : [],
    cvBullets: cvSection
      ? parseBulletList(cvSection.content).map(stripMarkdown)
      : [],
    linkedinDescription: linkedinSection
      ? linkedinSection.content.trim()
      : undefined,
  };
}

export function loadExperiences(): Experience[] {
  const files = [
    "experience/cainmani.md",
    "experience/bushveld-energy.md",
    "experience/cput-training.md",
    "experience/hot-ink.md",
  ];
  return files.map(parseExperienceFile);
}

function parseVentureFile(filePath: string): Venture {
  const content = readFile(filePath);
  const doc = parseDocument(content);

  const whatIDidSection = getSection(doc.sections, "What I Did");
  const techSection = getSection(
    doc.sections,
    "Technologies Used",
  );
  const achievementsSection = getSection(
    doc.sections,
    "Key Achievements",
  );
  const cvSection = getSection(doc.sections, "CV-Ready Bullets");

  return {
    title: doc.title,
    role: doc.metadata["Role"] || "",
    dates: stripMarkdown(doc.metadata["Dates"] || ""),
    entity: doc.metadata["Entity"],
    location: doc.metadata["Location"] || "",
    website: doc.metadata["Website"] || doc.metadata["WebsiteUrl"],
    industry: doc.metadata["Industry"] || "",
    github: doc.metadata["GitHub"],
    whatIDid: whatIDidSection ? whatIDidSection.subsections.map(s => ({
      ...s,
      name: stripMarkdown(s.name),
      content: stripMarkdown(s.content),
    })) : [],
    technologies: techSection
      ? parseTechnologies(techSection.content)
      : [],
    keyAchievements: achievementsSection
      ? parseBulletList(achievementsSection.content).map(stripMarkdown)
      : [],
    cvBullets: cvSection
      ? parseBulletList(cvSection.content).map(stripMarkdown)
      : [],
  };
}

export function loadVentures(): Venture[] {
  return [
    parseVentureFile("ventures/dataflow.md"),
    parseVentureFile("ventures/youcook.md"),
  ];
}

export function loadEducation(): Education[] {
  const uctContent = readFile("education/uct.md");
  const uctDoc = parseDocument(uctContent);
  const uctCvSection = getSection(
    uctDoc.sections,
    "CV-Ready Bullets",
  );
  const researchSection = getSection(
    uctDoc.sections,
    "Research Project",
  );

  const researchMeta = researchSection
    ? parseMetadata(researchSection.content)
    : {};

  const uct: Education = {
    title: uctDoc.title,
    qualification: uctDoc.metadata["Qualification"] || "",
    dates: stripMarkdown(uctDoc.metadata["Dates"] || ""),
    location: "Cape Town, South Africa",
    gpa: stripMarkdown(uctDoc.metadata["GPA"] || ""),
    finalYearAggregate:
      stripMarkdown(uctDoc.metadata["Final-year aggregate"] || ""),
    conferred: stripMarkdown(uctDoc.metadata["Conferred"] || ""),
    cvBullets: uctCvSection
      ? parseBulletList(uctCvSection.content).map(stripMarkdown)
      : [],
    researchProject: researchSection
      ? {
          title: stripMarkdown(researchMeta["Title"] || ""),
          mark: stripMarkdown(researchMeta["Mark"] || ""),
          description: stripMarkdown(researchMeta["Description"] || ""),
        }
      : undefined,
  };

  const bishopsContent = readFile("education/bishops.md");
  const bishopsDoc = parseDocument(bishopsContent);
  const bishopsCvSection = getSection(
    bishopsDoc.sections,
    "CV-Ready Bullets",
  );

  const bishops: Education = {
    title: bishopsDoc.title,
    type: bishopsDoc.metadata["Type"] || "",
    qualification: bishopsDoc.metadata["Qualification"] || "",
    dates: stripMarkdown(bishopsDoc.metadata["Dates"] || ""),
    location: "Cape Town, South Africa",
    finalAggregate:
      stripMarkdown(bishopsDoc.metadata["Final Aggregate"] || ""),
    distinctions: stripMarkdown(bishopsDoc.metadata["Distinctions"] || ""),
    cvBullets: bishopsCvSection
      ? parseBulletList(bishopsCvSection.content).map(stripMarkdown)
      : [],
  };

  const hiltonContent = readFile("education/hilton.md");
  const hiltonDoc = parseDocument(hiltonContent);

  const achievementsSection = getSection(
    hiltonDoc.sections,
    "Achievements & Activities",
  );

  const hilton: Education = {
    title: hiltonDoc.title,
    type: hiltonDoc.metadata["Type"] || "",
    dates: stripMarkdown(hiltonDoc.metadata["Dates"] || ""),
    location: hiltonDoc.metadata["Location"] || "",
    achievements: achievementsSection
      ? parseBulletList(achievementsSection.content).map(stripMarkdown)
      : [],
    cvBullets: [],
  };

  return [uct, bishops, hilton];
}

/**
 * Extract overview narrative text from the raw markdown.
 * The overview is any non-metadata paragraph text within the Overview section,
 * or failing that, the first paragraph after the title and before ## What I Did.
 */
function extractProjectOverview(doc: ReturnType<typeof parseDocument>): string | undefined {
  const overviewSection = getSection(doc.sections, "Overview");
  if (overviewSection) {
    // Get non-metadata lines (lines that aren't bullet-style key:value pairs)
    const narrativeLines = overviewSection.content
      .split("\n")
      .filter((line) => {
        const trimmed = line.trim();
        if (!trimmed) return false;
        // Skip metadata lines (- **Key:** Value)
        if (trimmed.match(/^-?\s*\*\*.+?:\*\*/)) return false;
        return true;
      });
    if (narrativeLines.length > 0) return narrativeLines.join(" ").trim();
  }

  // Fallback: look for a Description or Problem Statement section
  const descSection = getSection(doc.sections, "Description");
  if (descSection) {
    const text = descSection.content.trim();
    if (text) return stripMarkdown(text);
  }

  return undefined;
}

/**
 * Extract subsections from the What I Did section (### level headings).
 */
function extractProjectSubsections(doc: ReturnType<typeof parseDocument>): ProjectSubsection[] | undefined {
  const whatIDidSection = getSection(doc.sections, "What I Did");
  if (!whatIDidSection || whatIDidSection.subsections.length === 0) return undefined;

  return whatIDidSection.subsections.map((sub) => ({
    heading: stripMarkdown(sub.name),
    content: stripMarkdown(
      sub.content
        .split("\n")
        .filter((l) => !l.match(/^\s*-\s+/))
        .join(" ")
        .trim()
    ),
    bullets: parseBulletList(sub.content).map(stripMarkdown),
  }));
}

/**
 * Extract image references from raw markdown content.
 * Matches ![alt](src) and optional caption patterns.
 */
function extractProjectImages(raw: string): { src: string; alt: string; caption?: string }[] {
  const images: { src: string; alt: string; caption?: string }[] = [];
  const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  while ((match = imgRegex.exec(raw)) !== null) {
    images.push({ alt: match[1], src: match[2] });
  }
  return images.length > 0 ? images : [];
}

/**
 * Extract document links from raw markdown (PDFs, papers, reports, GitHub repos).
 */
function extractDocumentLinks(raw: string): { href: string; label: string }[] {
  const links: { href: string; label: string }[] = [];
  // Match PDF/doc links and GitHub repository links
  const linkRegex = /\[([^\]]+)\]\(((?:[^)]+\.(?:pdf|doc|docx|pptx?)|https:\/\/github\.com\/[^)]+))\)/gi;
  let match;
  while ((match = linkRegex.exec(raw)) !== null) {
    links.push({ label: match[1], href: match[2] });
  }
  return links.length > 0 ? links : [];
}

export function loadProjects(): Project[] {
  const projectFiles = [
    "projects/topsis-network-selection.md",
    "projects/iridium-satellite.md",
    "projects/plastic-to-power.md",
    "projects/md5-md6-hashing.md",
    "projects/camera-trap.md",
    "projects/online-filters.md",
  ];

  return projectFiles.map((filePath) => {
    const content = readFile(filePath);
    const doc = parseDocument(content);
    const slug = path.basename(filePath, ".md");

    const whatIDidSection = getSection(doc.sections, "What I Did");
    const techSection = getSection(doc.sections, "Technologies Used");
    const achievementsSection = getSection(doc.sections, "Key Achievements");
    const cvSection = getSection(doc.sections, "CV-Ready Bullets");
    const findingsSection = getSection(doc.sections, "Findings") || getSection(doc.sections, "Results");
    const problemSection = getSection(doc.sections, "Problem Statement");

    const overview = extractProjectOverview(doc);
    const subsections = extractProjectSubsections(doc);
    const images = extractProjectImages(doc.raw);
    const documentLinks = extractDocumentLinks(doc.raw);

    return {
      title: doc.title,
      slug,
      type: doc.metadata["Type"] || "",
      course: doc.metadata["Course"],
      year: doc.metadata["Year"] || doc.metadata["Date"],
      date: doc.metadata["Date"],
      result: stripMarkdown(doc.metadata["Result"] || ""),
      university: doc.metadata["University"] || "",
      overview,
      problemStatement: problemSection
        ? stripMarkdown(problemSection.content.trim())
        : undefined,
      whatIDid: whatIDidSection
        ? parseBulletList(whatIDidSection.content).map(stripMarkdown)
        : [],
      subsections,
      technologies: techSection
        ? parseTechnologies(techSection.content)
        : [],
      keyAchievements: achievementsSection
        ? parseBulletList(achievementsSection.content).map(stripMarkdown)
        : [],
      findings: findingsSection
        ? parseBulletList(findingsSection.content).map(stripMarkdown)
        : undefined,
      cvBullets: cvSection
        ? parseBulletList(cvSection.content).map(stripMarkdown)
        : [],
      images: images.length > 0 ? images : undefined,
      documentLinks: documentLinks.length > 0 ? documentLinks : undefined,
    };
  });
}

export function loadSkills(): SkillCategory[] {
  const content = readFile("skills.md");
  return parseSkills(content);
}

export function loadInterests(): Interest[] {
  const content = readFile("interests.md");
  const doc = parseDocument(content);
  const interests: Interest[] = [];

  for (const section of doc.sections) {
    if (
      section.name === "CV-Ready Line" ||
      section.name === "Notes"
    )
      continue;
    interests.push({
      category: section.name,
      items: parseBulletList(section.content),
    });
  }
  return interests;
}

export function loadVolunteering(): Volunteering[] {
  const content = readFile("volunteering.md");
  const doc = parseDocument(content);
  const volunteering: Volunteering[] = [];

  for (const section of doc.sections) {
    const overviewSub = section.subsections.find(
      (s) => s.name === "Overview",
    );
    const meta = overviewSub
      ? parseMetadata(overviewSub.content)
      : {};
    const whatIDidSub = section.subsections.find(
      (s) => s.name === "What I Did",
    );
    const cvBulletSub = section.subsections.find(
      (s) => s.name === "CV-Ready Bullet",
    );

    volunteering.push({
      title: section.name,
      event: meta["Event"] || section.name,
      role: meta["Role"] || "",
      dates: meta["Dates"] || "",
      location: meta["Location"] || "",
      scale: meta["Scale"] || "",
      whatIDid: whatIDidSub
        ? parseBulletList(whatIDidSub.content)
        : [],
      cvBullet: cvBulletSub
        ? cvBulletSub.content.replace(/^\s*-\s+/, "").trim()
        : "",
      certificate: meta["Certificate"],
    });
  }

  return volunteering;
}

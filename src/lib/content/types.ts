export interface PortfolioMetadata {
  [key: string]: string;
}

export interface PortfolioSection {
  name: string;
  level: number;
  content: string;
  subsections: PortfolioSection[];
}

export interface PortfolioDocument {
  title: string;
  metadata: PortfolioMetadata;
  sections: PortfolioSection[];
  raw: string;
}

export interface Experience {
  title: string;
  role: string;
  dates: string;
  location: string;
  industry: string;
  website?: string;
  timeline?: string[];
  whatIDid: PortfolioSection[];
  technologies: string[];
  keyAchievements: string[];
  cvBullets: string[];
  linkedinDescription?: string;
}

export interface Venture {
  title: string;
  role: string;
  dates: string;
  entity?: string;
  location: string;
  website?: string;
  industry: string;
  github?: string;
  whatIDid: PortfolioSection[];
  technologies: string[];
  keyAchievements: string[];
  cvBullets: string[];
  linkedinDescription?: string;
}

export interface Education {
  title: string;
  type?: string;
  qualification?: string;
  dates: string;
  location?: string;
  gpa?: string;
  finalYearAggregate?: string;
  conferred?: string;
  distinctions?: string;
  finalAggregate?: string;
  courses?: CourseRecord[];
  achievements?: string[];
  cvBullets: string[];
  researchProject?: {
    title: string;
    mark: string;
    description: string;
  };
}

export interface CourseRecord {
  code: string;
  name: string;
  mark: string;
  class?: string;
}

export interface ProjectSubsection {
  heading: string;
  content: string;
  bullets?: string[];
}

export interface Project {
  title: string;
  slug: string;
  type: string;
  course?: string;
  year?: string;
  date?: string;
  result: string;
  university: string;
  overview?: string;
  problemStatement?: string;
  whatIDid: string[];
  subsections?: ProjectSubsection[];
  technologies: string[];
  keyAchievements: string[];
  findings?: string[];
  cvBullets: string[];
  images?: { src: string; alt: string; caption?: string }[];
  documentLinks?: { href: string; label: string }[];
}

export interface SkillCategory {
  name: string;
  skills: Skill[];
}

export interface Skill {
  name: string;
  proficiency?: string;
  context: string;
}

export interface Profile {
  name: string;
  location: string;
  phone: string;
  email: string;
  linkedin: string;
  linkedinUrl: string;
  github: string;
  githubUrl: string;
  website: string;
  websiteUrl: string;
  title: string;
  summaries: { [variant: string]: string };
  dateOfBirth: string;
  nationality: string;
}

export interface Interest {
  category: string;
  items: string[];
}

export interface Volunteering {
  title: string;
  event: string;
  role: string;
  dates: string;
  location: string;
  scale: string;
  whatIDid: string[];
  cvBullet: string;
  certificate?: string;
}

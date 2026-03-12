# caidespriestersbach.co.za

Personal portfolio website for Caide Spriestersbach — Electrical & Computer Engineer based in Cape Town.

**Live site:** [caidespriestersbach.co.za](https://caidespriestersbach.co.za)

## Tech Stack

- **Framework:** [Astro](https://astro.build) with React islands for interactive components
- **Styling:** Tailwind CSS v4
- **Typography:** ITC Benguiat Std Bold (hero), Fraunces (headings), Space Grotesk (body), JetBrains Mono (code)
- **AI Chat:** Cloudflare Worker proxying Gemma 3 27B via Google AI Studio
- **Hosting:** GitHub Pages with custom domain
- **CI/CD:** GitHub Actions — auto-builds on push

## Features

- Painterly African bushveld hero with light/dark mode artwork crossfade
- 735 animated CSS twinkling stars across 3 tiers (dark mode)
- Fire glow pulse and smoke drift animations
- Dark/light mode toggle with mode-specific typography and color schemes
- Dynamic CV download with sector-targeted variants
- AI-powered portfolio chatbot (Gemma 3 27B)
- Spotify listening wall with weekly auto-updates
- Detailed project pages with image galleries and lightbox viewer
- Fully responsive across all viewports

## Project Structure

```
src/
  components/
    interactive/    # React islands (chat widget, CV download, typed hero, etc.)
    sections/       # Astro page sections (Hero, About, Experience, Projects, etc.)
  data/             # Static data (Spotify wrapped history)
  layouts/          # Base page layout
  lib/              # Content loaders and utilities
  pages/            # Astro routes (index, project detail, wrapped)
  styles/           # Global CSS and Tailwind config
public/
  docs/             # Downloadable CVs
  fonts/            # Self-hosted typefaces
  img/              # Hero artwork, project galleries, headshot
worker/             # Cloudflare Worker for AI chat API
```

## Sections

| Section | Description |
|---------|-------------|
| Hero | Bushveld night/morning scene with animated starfield and Benguiat typography |
| About | Bio, headshot, and background |
| Experience | Work history with expandable role details |
| Ventures | Startup projects (DataFlow, YouCook AI) |
| Projects | University project cards linking to detailed pages with galleries |
| Education | Academic record with course details |
| Skills | Categorised technical skills grid |
| Listening | Spotify vinyl wall with weekly auto-refresh |

---
phase: 260408-rcb
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/common/Header.astro
autonomous: true
requirements:
  - RCB-H3
must_haves:
  truths:
    - "Mobile nav menu panel shows a fully opaque background in light mode"
    - "Mobile nav menu panel shows a fully opaque background in dark mode"
    - "Hero image and text do not bleed through the open menu at any scroll position"
    - "Open/close animation mechanics are unchanged"
  artifacts:
    - path: "src/components/common/Header.astro"
      provides: "Solid CSS background on #mobile-menu, JS background redundancy retained"
  key_links:
    - from: "#mobile-menu (CSS)"
      to: "background-color property"
      via: "inline style on element or global.css class"
      pattern: "background.*f2e8dc|background.*0d0d0d"
---

<objective>
Fix the mobile nav menu panel so it always renders with a solid opaque background,
eliminating hero bleed at all scroll positions and regardless of JS timing.

Purpose: The panel currently gets its background only via JS in openMenu(), which
creates a timing window where the transparent header background shows through. The
hero image bleeds visibly through nav links.

Output: #mobile-menu has a solid CSS background baked into the element's inline style
attribute (or a CSS class), covering both light and dark mode, so the fix is
paint-time not script-time.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md

Key facts from code audit:

Root cause: `#mobile-menu` div has no background in CSS. The JS `openMenu()` function
sets `mobileMenu.style.background = getMobileMenuBg()` at click time. But the parent
`<header>` has `background: transparent` when scroll < 50px (set by updateHeader()).
The panel inherits the transparent header background until JS runs — creating a flash
or persistent bleed if timing is off.

Current JS values (correct colors, wrong layer):
  - dark:  rgba(8, 8, 8, 0.97)      → should be #080808 or rgba(8,8,8,1)
  - light: rgba(242, 232, 220, 0.97) → should be #f2e8dc or rgba(242,232,220,1)

CSS color tokens:
  - light body bg: #f2e8dc (cream-200)
  - dark body bg:  #080808 (void-950)
  - --border-subtle: light = rgba(26,26,26,0.12), dark = rgba(232,213,192,0.1)

The `<header>` element itself has `background: transparent` at scroll=0. The menu
panel is a child of the header. Any alpha < 1 on the panel will show the hero through.

Fix strategy: Add `background-color: #f2e8dc` directly to the `#mobile-menu` element
via its inline `style` attribute in the Astro template. Add a `dark:` override via a
CSS class. This is paint-time, not script-time — the panel is always opaque regardless
of scroll state or JS timing. The JS can keep setting background on open (belt and
suspenders) but change opacity to 1 (fully opaque).
</context>

<tasks>

<task type="auto">
  <name>Task 1: Apply solid CSS background to #mobile-menu and harden JS colors</name>
  <files>src/components/common/Header.astro</files>
  <action>
Two changes in Header.astro:

**Change 1 — #mobile-menu element inline style (HTML template, line ~74):**

Current:
```
style="max-height: 0; border-color: var(--border-subtle);"
```

Replace with:
```
style="max-height: 0; border-color: var(--border-subtle); background-color: #f2e8dc;"
```

Also add a Tailwind dark mode class to the div for the dark background. Because this
project uses the `dark` class variant (not media query), add `dark:bg-void-950` class
to the `#mobile-menu` div. Check global.css — `--color-void-950: #080808` is defined
in @theme, so Tailwind should emit `bg-void-950`.

Updated div opening tag:
```html
<div
  id="mobile-menu"
  aria-hidden="true"
  class="md:hidden overflow-hidden border-t transition-[max-height] duration-300 ease-in-out dark:bg-void-950"
  style="max-height: 0; border-color: var(--border-subtle); background-color: #f2e8dc;"
>
```

This ensures:
- Light mode: cream (#f2e8dc) applied via inline style (highest specificity, paint-time)
- Dark mode: #080808 applied via Tailwind dark:bg-void-950 class (overrides inline style
  when .dark is on <html> because @variant dark uses :where(.dark, .dark *) which adds
  specificity — but inline style wins over class. To guarantee dark mode override, use
  a CSS class with !important OR add the dark background via a separate CSS rule.

**Safer approach for dark mode (avoids inline vs class specificity fight):**

In global.css, add to the @layer components block:
```css
/* Mobile nav menu — always opaque, theme-aware */
#mobile-menu {
  background-color: #f2e8dc;
}
.dark #mobile-menu {
  background-color: #080808;
}
```

Use this CSS approach instead of the Tailwind class. Remove `dark:bg-void-950` from
the class list (not needed). Keep the inline style `background-color: #f2e8dc` REMOVED
from the HTML (the CSS handles it). The CSS rule has lower specificity than inline
style, so use only CSS (no inline background on the element) — this lets the CSS
light/dark rules work without specificity conflicts.

**Final HTML for the div (no inline background):**
```html
<div
  id="mobile-menu"
  aria-hidden="true"
  class="md:hidden overflow-hidden border-t transition-[max-height] duration-300 ease-in-out"
  style="max-height: 0; border-color: var(--border-subtle);"
>
```

**Final CSS addition in global.css (@layer components):**
```css
/* Mobile nav menu panel — solid opaque background, theme-aware, paint-time not script-time */
#mobile-menu {
  background-color: #f2e8dc;
}
.dark #mobile-menu {
  background-color: #080808;
}
```

**Change 2 — JS getMobileMenuBg() (script block, line ~119):**

Update to fully opaque (alpha 1.0) so if the JS sets background it also doesn't bleed:
```js
function getMobileMenuBg() {
  return document.documentElement.classList.contains("dark")
    ? "rgba(8, 8, 8, 1)"
    : "rgba(242, 232, 220, 1)";
}
```

This keeps JS as belt-and-suspenders but with no transparency.

**Change 3 — Add bottom border/shadow for visual separation:**

The panel needs a subtle shadow to separate from page content. Add to the CSS rule:
```css
#mobile-menu {
  background-color: #f2e8dc;
  box-shadow: 0 4px 12px rgba(26, 26, 26, 0.12);
}
.dark #mobile-menu {
  background-color: #080808;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}
```

Do NOT change max-height, transition, or any other property. The open/close animation
mechanics (max-height transition from 0 to 500px) remain exactly as-is.
  </action>
  <verify>
    <automated>cd /Users/spries/Documents/Curriculum\ Vitae/website/caidespries.github.io && npm run build 2>&1 | tail -20</automated>
  </verify>
  <done>
    - Build passes with no errors
    - #mobile-menu has background-color rules in compiled CSS for both light and dark
    - JS getMobileMenuBg() returns fully opaque colors
    - No other changes to the header markup or script
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Static HTML/CSS | No dynamic data; styling fix only — no trust boundary concerns |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-RCB-01 | Information Disclosure | Mobile menu | accept | CSS background fix is purely visual; no data exposure involved |
</threat_model>

<verification>
After executing:
1. `npm run build` completes without errors
2. Open dev server (`npm run dev`), resize to mobile viewport
3. Scroll to top (scroll=0, header transparent), open hamburger menu
4. Confirm nav panel shows solid cream background, no hero bleed in light mode
5. Toggle dark mode, open menu — confirm solid #080808 background, no hero bleed
6. Confirm menu open/close animation (max-height slide) is unchanged
</verification>

<success_criteria>
Mobile nav menu panel renders with a fully opaque background in both light and dark
mode, at all scroll positions, with no reliance on JS timing. Build passes.
</success_criteria>

<output>
After completion, create `.planning/quick/260408-rcb-fix-h3-mobile-nav-menu-panel-needs-solid/260408-rcb-01-SUMMARY.md`
</output>

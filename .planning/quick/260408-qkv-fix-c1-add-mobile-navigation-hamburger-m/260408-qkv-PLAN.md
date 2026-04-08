---
phase: quick
plan: 260408-qkv
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/common/Header.astro
autonomous: true
requirements:
  - C1-mobile-nav

must_haves:
  truths:
    - "Mobile users can open a nav menu via the hamburger button"
    - "Menu closes when a link is clicked or when tapping outside"
    - "Menu has a solid background — hero image does not bleed through"
    - "aria-expanded reflects open/closed state"
    - "Menu opens/closes with a smooth slide-down transition"
    - "Desktop nav is unchanged"
    - "Both dark and light mode display correctly"
  artifacts:
    - path: "src/components/common/Header.astro"
      provides: "Fully functional mobile hamburger nav"
      contains: "aria-expanded"
  key_links:
    - from: "#mobile-menu-btn"
      to: "#mobile-menu"
      via: "click handler sets aria-expanded + toggles open class"
    - from: "document click"
      to: "#mobile-menu"
      via: "outside-click handler closes menu"
---

<objective>
Fix the mobile navigation so the hamburger button opens a proper slide-down menu.

Purpose: Mobile users currently have no navigation — only the CS. logo and theme toggle are visible. Every section of the site is unreachable on small screens.

Output: Header.astro updated with a working, accessible, styled mobile menu that closes on link-click and outside-click, with a solid background and smooth transition.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

<!-- Key facts extracted so executor needs no codebase exploration -->
<interfaces>
<!-- From src/components/common/Header.astro (current state) -->

Structure already in place — DO NOT recreate, only modify:
- `#mobile-menu-btn` — hamburger button, visible only on mobile (`md:hidden`)
- `#mobile-menu` — panel div, currently toggled via `.hidden` class
- `.mobile-nav-link` — links inside the panel, already wired to close on click

Existing scroll handler sets header background:
- Scrolled (>50px): `rgba(8,8,8,0.85)` dark / `rgba(242,232,220,0.85)` light
- At top (scroll=0): `background: transparent`

Problem: mobile menu inherits this transparent background at scroll=0, so hero image bleeds through.

CSS palette:
- Light bg: #f2e8dc (cream-200)
- Dark bg: #080808 (void-950)
- Accent: #e85d3a (ember-500)
- Font: Space Grotesk (--font-sans)
- CSS var --border-subtle: rgba(26,26,26,0.12) light / rgba(232,213,192,0.1) dark

Tailwind v4 is in use — standard utility classes apply.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix mobile menu background, aria-expanded, outside-click, and slide transition</name>
  <files>src/components/common/Header.astro</files>
  <action>
Modify ONLY the `#mobile-menu` div and the `<script>` block. Do not touch the desktop nav or ThemeToggle.

**1. Mobile menu panel (`#mobile-menu` div)**

Replace the current class/style with:

```html
<div
  id="mobile-menu"
  aria-hidden="true"
  class="md:hidden overflow-hidden border-t transition-[max-height] duration-300 ease-in-out"
  style="max-height: 0; border-color: var(--border-subtle);"
>
```

- Remove the `hidden` class (open/close is now driven by `max-height` animation, not display toggle).
- `aria-hidden` starts as `"true"` and is toggled by the script.
- `max-height: 0` = closed; script sets `max-height: 500px` = open.
- Background is set explicitly per theme in the script (see below) so it is never transparent.

**2. Script block — replace the mobile menu section entirely**

Keep the existing scroll/theme logic untouched. Replace only the `menuBtn` block at the bottom with:

```js
const menuBtn = document.getElementById("mobile-menu-btn");
const mobileMenu = document.getElementById("mobile-menu");

function getMobileMenuBg() {
  return document.documentElement.classList.contains("dark")
    ? "rgba(8, 8, 8, 0.97)"
    : "rgba(242, 232, 220, 0.97)";
}

function openMenu() {
  if (!mobileMenu || !menuBtn) return;
  mobileMenu.style.maxHeight = "500px";
  mobileMenu.style.background = getMobileMenuBg();
  mobileMenu.setAttribute("aria-hidden", "false");
  menuBtn.setAttribute("aria-expanded", "true");
}

function closeMenu() {
  if (!mobileMenu || !menuBtn) return;
  mobileMenu.style.maxHeight = "0";
  mobileMenu.setAttribute("aria-hidden", "true");
  menuBtn.setAttribute("aria-expanded", "false");
}

menuBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = menuBtn.getAttribute("aria-expanded") === "true";
  isOpen ? closeMenu() : openMenu();
});

document.querySelectorAll(".mobile-nav-link").forEach((link) => {
  link.addEventListener("click", () => closeMenu());
});

document.addEventListener("click", (e) => {
  if (
    menuBtn &&
    mobileMenu &&
    !menuBtn.contains(e.target as Node) &&
    !mobileMenu.contains(e.target as Node)
  ) {
    closeMenu();
  }
});

// Re-apply correct background when theme changes
document.querySelectorAll(".theme-toggle").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    if (menuBtn?.getAttribute("aria-expanded") === "true") {
      mobileMenu!.style.background = getMobileMenuBg();
    }
  });
});
```

**3. Add `aria-expanded="false"` to the hamburger button opening tag:**

```html
<button
  id="mobile-menu-btn"
  type="button"
  aria-label="Toggle menu"
  aria-expanded="false"
  class="p-2 rounded-lg transition-colors hover:text-ember-500"
>
```

Do NOT add a hamburger→X icon swap — keep the three-line SVG as-is. The requirement does not call for it and the CSS already handles `.header-over-hero #mobile-menu-btn` coloring.
  </action>
  <verify>
    <automated>cd /Users/spries/Documents/Curriculum\ Vitae/website/caidespries.github.io && npx astro check 2>&1 | tail -20</automated>
  </verify>
  <done>
- `astro check` passes with no errors on Header.astro
- Mobile menu opens with a smooth slide-down (max-height transition) when hamburger is tapped
- Menu background is solid cream (light) or near-black (dark) — hero never bleeds through
- `aria-expanded` on `#mobile-menu-btn` is `"false"` when closed, `"true"` when open
- Clicking a nav link closes the menu
- Clicking anywhere outside the menu closes it
- Desktop nav (hidden md:flex) is unchanged
  </done>
</task>

</tasks>

<verification>
After task completes, manually verify on a narrow viewport (375px):
1. Load the page — hamburger visible, menu hidden, `aria-expanded="false"`
2. Tap hamburger — menu slides down smoothly, solid background (no hero bleed), `aria-expanded="true"`
3. Tap "About" — menu closes, page scrolls to About section
4. Reopen menu, tap outside — menu closes
5. Switch theme — menu background updates to match new theme
6. Resize to md+ — desktop nav appears, mobile controls hidden, no layout breakage
</verification>

<success_criteria>
Mobile users can navigate all seven site sections. Hamburger button is accessible (aria-expanded). Menu has a solid background in both themes. Existing desktop nav and scroll behaviour are unaffected.
</success_criteria>

<output>
After completion, create `.planning/quick/260408-qkv-fix-c1-add-mobile-navigation-hamburger-m/260408-qkv-SUMMARY.md`
</output>

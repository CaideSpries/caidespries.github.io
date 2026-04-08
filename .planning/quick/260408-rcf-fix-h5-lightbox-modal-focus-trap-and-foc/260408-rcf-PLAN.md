---
phase: quick
plan: 260408-rcf
type: execute
wave: 1
depends_on: []
files_modified:
  - src/pages/projects/[slug].astro
autonomous: true
requirements:
  - H5
must_haves:
  truths:
    - "Tab/Shift+Tab while lightbox is open cycles only within lightbox focusable elements"
    - "Focus moves to the close button when the lightbox opens"
    - "Focus returns to the image thumbnail that triggered the lightbox when it closes"
    - "Escape key continues to close the lightbox"
  artifacts:
    - path: "src/pages/projects/[slug].astro"
      provides: "Updated inline script with focus trap logic in show() and hide()"
      contains: "trapFocus, lastFocused"
  key_links:
    - from: "show()"
      to: "lightbox-close button"
      via: "closeBtn.focus()"
      pattern: "closeBtn\\.focus"
    - from: "hide()"
      to: "lastFocused"
      via: "lastFocused?.focus()"
      pattern: "lastFocused\\?.focus"
    - from: "keydown listener"
      to: "focusable elements list"
      via: "trapFocus handler"
      pattern: "trapFocus"
---

<objective>
Add a lightweight focus trap to the project lightbox modal so keyboard users cannot Tab out of
the modal while it is open, and so focus is returned to the trigger element on close.

Purpose: Closes accessibility gap H5 — modal dialogs must trap focus per WCAG 2.1 SC 2.1.2.
Output: Modified inline script in src/pages/projects/[slug].astro — no new files, no new deps.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
src/pages/projects/[slug].astro (inline script, lines 341-392)

Current script shape (condensed):
```
const lightbox = document.getElementById('lightbox');
// ...
let current = 0;

function show(index) {
  // sets current, updates img/caption/counter
  lightbox.classList.remove('hidden');
  lightbox.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function hide() {
  lightbox.classList.add('hidden');
  lightbox.classList.remove('flex');
  document.body.style.overflow = '';
}

// trigger click -> show()
// close/prev/next buttons
// backdrop click -> hide()

document.addEventListener('keydown', (e) => {
  if (lightbox.classList.contains('hidden')) return;
  if (e.key === 'Escape') hide();
  if (e.key === 'ArrowLeft') show(current - 1);
  if (e.key === 'ArrowRight') show(current + 1);
});
```

Focusable elements inside the lightbox (by DOM order):
  #lightbox-close  (top-right)
  #lightbox-prev   (left nav)
  #lightbox-next   (right nav)
No inputs or links — three buttons total.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add focus trap to lightbox show/hide and keydown handler</name>
  <files>src/pages/projects/[slug].astro</files>
  <action>
Edit the inline `<script>` block (lines 341-392). Make the following precise changes inside
the `if (lightbox && lightboxImg && lightboxCaption && lightboxCounter)` block:

1. Add a variable above `let current = 0;`:

```typescript
let lastFocused: HTMLElement | null = null;
```

2. Add a `trapFocus` function (insert after the `lastFocused` declaration, before `function show`):

```typescript
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

function trapFocus(e: KeyboardEvent) {
  if (e.key !== 'Tab') return;
  const focusable = Array.from(lightbox!.querySelectorAll<HTMLElement>(FOCUSABLE));
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
  } else {
    if (document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
}
```

3. At the end of `function show(index)`, after `document.body.style.overflow = 'hidden';`, add:

```typescript
lastFocused = document.activeElement as HTMLElement;
const closeBtn = document.getElementById('lightbox-close') as HTMLElement | null;
(closeBtn ?? lightbox!.querySelector<HTMLElement>(FOCUSABLE))?.focus();
lightbox!.addEventListener('keydown', trapFocus);
```

4. At the end of `function hide()`, after `document.body.style.overflow = '';`, add:

```typescript
lightbox!.removeEventListener('keydown', trapFocus);
lastFocused?.focus();
lastFocused = null;
```

Do not modify any other part of the script. The existing global `keydown` listener (Escape,
ArrowLeft, ArrowRight) remains untouched — it already guards with `classList.contains('hidden')`.
  </action>
  <verify>
    <automated>cd "/Users/spries/Documents/Curriculum Vitae/website/caidespries.github.io" && npx astro check 2>&1 | tail -20</automated>
  </verify>
  <done>
- `astro check` reports no type errors in [slug].astro
- `lastFocused`, `trapFocus`, and `FOCUSABLE` are present in the inline script
- `show()` saves `document.activeElement`, focuses close button, attaches trapFocus listener
- `hide()` removes trapFocus listener and restores focus to `lastFocused`
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| keyboard events | All keydown events are user-generated; no external input crosses this boundary |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-rcf-01 | Tampering | focus restoration | accept | lastFocused is set from document.activeElement at open time — no user-controlled string involved, reference stays in closure scope |
</threat_model>

<verification>
Manual keyboard test after deploy:
1. Open any project page that has images
2. Tab to a thumbnail, press Enter — lightbox opens
3. Verify focus is on the close button
4. Press Tab repeatedly — confirm focus cycles: close -> prev -> next -> close (wraps)
5. Press Shift+Tab from close button — confirm focus goes to next (last element)
6. Press Escape — lightbox closes, focus returns to the thumbnail that opened it
7. Click a thumbnail with mouse, then Tab — same trap behaviour applies
</verification>

<success_criteria>
- Keyboard users cannot Tab out of the open lightbox to background content
- Focus lands on the close button immediately when the lightbox opens
- Focus is returned to the originating thumbnail when the lightbox closes (Escape, close button, or backdrop click)
- `astro check` passes with no new errors
</success_criteria>

<output>
After completion, create `.planning/quick/260408-rcf-fix-h5-lightbox-modal-focus-trap-and-foc/260408-rcf-SUMMARY.md`
</output>

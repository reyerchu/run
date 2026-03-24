---
name: RY-UI-skill
description: Professional UI/frontend design principles for web pages. Use when building landing pages, marketing sites, dashboards, or any frontend UI with Tailwind CSS. Applies Steve Schoger's design techniques and Reyer's lessons learned to elevate AI-generated output from generic to professional. Triggers on: landing page, hero section, pricing page, marketing site, UI polish, design refinement, Tailwind styling, web design, RY-UI-skill.
---

# RY-UI-skill — Professional Frontend Design Principles

Based on Steve Schoger's (Tailwind Labs designer) workflow + Reyer's production lessons.

## Core Philosophy

AI-generated UI defaults are recognizable: indigo colors, everything centered, solid borders with shadows = muddy. The gap between AI output and professional design is **design judgment**, not code. Apply these principles iteratively (~50 rounds of refinement is normal).

## Workflow

1. Generate initial layout with all sections specified
2. Apply these principles one by one
3. Review in browser at each step
4. Maintain style consistency across all sections

## Quick Reference — 20 Design Rules

### Icons & Visual Elements
1. **Lucide icons > emoji** — Never use emoji icons (🏃‍♂️📊👤 etc.) in UI. Always use Lucide React icons (`lucide-react`). Emoji looks unprofessional and renders inconsistently across platforms. Use proper sizing: `h-4 w-4` inline, `h-5 w-5` cards, `h-6 w-6` empty states. For empty states, wrap icon in a container: `<div className="w-12 h-12 rounded-2xl bg-gray-100 ring-1 ring-inset ring-gray-950/5 flex items-center justify-center"><Icon className="h-6 w-6 text-gray-400" /></div>`
2. **Color contrast — never trust dynamic Tailwind classes** — When colors come from JS variables/functions (e.g., status badges), Tailwind JIT cannot detect them → classes won't be compiled into CSS → invisible text. **Always use inline `style={{ backgroundColor: color }}` with hex values** for dynamic colors. Never pass Tailwind class names like `bg-green-500` from functions. This is a common, hard-to-debug bug.

### Borders & Shadows
3. **Outer ring > solid border** — Never combine shadow + border. Use `ring-1 ring-gray-950/10` instead. Applies to cards, buttons, navbar, containers.
4. **Concentric radius** — Inner element radius = outer radius - padding. Prevents awkward nested corners.
5. **Inset ring for edge definition** — Use `ring-1 ring-inset ring-gray-950/5` on light containers instead of border.

### Typography
6. **Inter variable font** — Download from rsms.me/inter (not Google Fonts). Enables intermediate weights like 550. Disable `ss02` (tailed lowercase L).
7. **Tighten tracking on large text** — 24px+ headings need `tracking-tight` or tighter. Large text amplifies letter gaps.
8. **Eyebrow text = monospace** — Use Geist Mono, `uppercase tracking-wider text-xs text-gray-600` for section labels.
9. **text-pretty vs text-balance** — `text-pretty` prevents orphan words; `text-balance` distributes lines evenly. Test both per block.
10. **Double line-height for small text** — `text-sm` (14px) with 28px line-height gives breathing room for descriptions.

### Layout
11. **Left-align, don't center** — Split hero: title left (3/5), description right (2/5), top-aligned. Breaks the "AI default" look.
12. **Inline section headings** — Title (dark, bold) + subtitle (gray, medium) on same line. Works with longer copy. Inspired by Apple/Linear/Stripe.
13. **max-width in ch units** — Use `max-w-[40ch]` for text blocks. Maintains comfortable reading width regardless of font size.

### Elements
14. **Button height 36-38px** — Use padding (not fixed height). Pill-shaped (`rounded-full`). `text-sm`. Remove default icons.
15. **Equal button heights with ring** — Button with ring is 2px taller. Fix: wrap in `<span>` with `inline-flex p-px` and calc.
16. **Well-styled containers** — Use `bg-gray-950/[2.5%]` to `bg-gray-950/5` background. No border. Bottom-crop screenshots (zero bottom padding, no bottom radius). Add inset ring.
17. **Screenshots as hero visuals** — High-res app screenshots (3x) are the easiest way to add visual impact. Better than generic illustrations.

### Decoration
18. **Canvas grid** — Decorative border lines between sections. Horizontal lines = full viewport width. Vertical = container width. Instantly removes template feel. (Stripe/Tailwind style)
19. **Background image testimonials** — AI-generated portrait as card background + dark gradient overlay + white text. More impactful than avatar + quote.
20. **Logo cloud** — No title needed. Real SVG logos, `text-gray-950` (no opacity), fill container width. Don't over-design.

## Prompt Strategy

- Use design language, not CSS: "make it feel lighter", "tighten the spacing"
- Specific values when you know them: "38px height", "gray-950"
- Ask "how is this implemented?" to audit before fixing
- "Apply this style to all sections below" for consistency
- Build temporary tools (e.g., drag-to-position) then remove after use

## Detailed Reference

For full explanations and examples of each technique, see [references/design-techniques.md](references/design-techniques.md).

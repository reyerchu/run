# Design Techniques — Full Reference

## 1. Outer Ring vs Solid Border

When an element has both `shadow` and `border`, the transition between them looks muddy/dirty.

**Bad:**
```html
<div class="shadow-lg border border-gray-200 rounded-xl">
```

**Good:**
```html
<div class="shadow-lg ring-1 ring-gray-950/10 rounded-xl">
```

Apply to: screenshot containers, buttons, navbar, feature cards — any element with shadow.

## 2. Concentric Radius

When nesting rounded elements (e.g., screenshot inside a card):

```
inner-radius = outer-radius - padding
```

If outer is `rounded-2xl` (16px) with `p-4` (16px), inner should be `rounded-none` or very small.
If outer is `rounded-2xl` with `p-2` (8px), inner should be `rounded-xl` (12px).

## 3. Inset Ring for Edge Definition

For light-colored containers that need subtle edge definition:

```html
<div class="bg-gray-50 ring-1 ring-inset ring-gray-950/5 rounded-xl">
```

More subtle than border, doesn't compete with content.

## 4. Inter Variable Font

Download from https://rsms.me/inter/ (not Google Fonts).

Benefits:
- Intermediate weights: 450, 550, 650 etc.
- Better rendering control

Setup in CSS:
```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/InterVariable.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
}
```

Disable tailed L variant:
```css
font-feature-settings: 'ss02' off;
```

## 5. Tracking on Large Text

```html
<!-- 24px+ headings -->
<h1 class="text-4xl font-bold tracking-tight">...</h1>
<h2 class="text-3xl font-semibold tracking-tight">...</h2>

<!-- Body text: leave default -->
<p class="text-base">...</p>
```

## 6. Eyebrow Text Formula

```html
<p class="font-mono uppercase tracking-wider text-xs text-gray-600">
  Everything you need
</p>
```

Use Geist Mono or any monospace. Creates a technical, refined feel above section headings.

## 7. text-pretty vs text-balance

```html
<!-- Prevents orphan word at end of paragraph -->
<p class="text-pretty">Long paragraph text...</p>

<!-- Distributes lines more evenly (good for headings) -->
<h2 class="text-balance">A heading that wraps to two lines</h2>
```

Test both per element — there's no universal rule.

## 8. Small Text Line Height

```html
<!-- Double line-height for descriptions -->
<p class="text-sm leading-7">Subtitle or description text here...</p>
<!-- text-sm = 14px, leading-7 = 28px = 2x -->
```

Sounds extreme but reads much better for secondary text.

## 9. Left-Aligned Hero Layout

```html
<div class="flex items-start gap-16">
  <!-- Left: 3/5 width -->
  <div class="w-3/5">
    <h1 class="text-5xl font-bold tracking-tight">Main headline</h1>
  </div>
  <!-- Right: 2/5 width -->
  <div class="w-2/5">
    <p class="text-lg text-gray-600 leading-relaxed">
      Description text that explains the product...
    </p>
    <div class="mt-6 flex gap-3">
      <button>Primary CTA</button>
      <button>Secondary CTA</button>
    </div>
  </div>
</div>
```

Reference: Tailwind Plus homepage layout.

## 10. Inline Section Heading

```html
<h2>
  <span class="font-semibold text-gray-950">Feature name.</span>
  <span class="font-medium text-gray-600">
    A longer description that flows naturally after the title,
    explaining what this feature does and why it matters.
  </span>
</h2>
```

Works best with 2+ lines of subtitle text. Inspired by Apple, Linear, Stripe.

## 11. Max-Width with ch Units

```html
<p class="max-w-[40ch] text-gray-600">
  This text block will be approximately 40 characters wide...
</p>
```

`ch` = width of the `0` character in current font. Stays comfortable regardless of font-size changes. Test values: 35ch, 40ch, 45ch.

## 12. Button Sizing

```html
<button class="px-4 py-2 text-sm font-medium rounded-full bg-gray-950 text-white ring-1 ring-gray-950/10 shadow-sm">
  Get started
</button>
```

- Height: 36-38px via padding (not `h-*`)
- Shape: `rounded-full` (pill)
- Font: `text-sm` (14px)
- No icons unless essential

## 13. Equal Height Buttons with Ring

When one button has ring/border and another doesn't, they differ by 2px.

Fix (Adam Wathan's technique):
```html
<!-- Outlined button wrapped to match height -->
<span class="inline-flex p-px">
  <button class="px-4 py-[calc(0.5rem-1px)] text-sm font-medium rounded-full ring-1 ring-gray-300">
    Secondary
  </button>
</span>

<!-- Solid button -->
<button class="px-4 py-2 text-sm font-medium rounded-full bg-gray-950 text-white">
  Primary
</button>
```

## 14. Well-Styled Screenshot Container

```html
<div class="relative rounded-2xl bg-gray-950/[2.5%] ring-1 ring-inset ring-gray-950/5 p-4 pb-0">
  <img
    src="/screenshot.png"
    class="rounded-t-xl shadow-2xl ring-1 ring-gray-950/10"
    alt="App screenshot"
  />
</div>
```

- Extremely faint background (2.5% to 5% opacity)
- No border, use inset ring
- Screenshot cropped at bottom (pb-0 + no bottom radius on image)
- Screenshot has its own shadow + ring

## 15. High-Resolution Screenshots

Always capture at 3x resolution for retina displays:
```html
<!-- If screenshot is displayed at 600px wide, source should be 1800px -->
<img
  src="/screenshot-3x.png"
  width="600"
  class="..."
  alt="App screenshot"
/>
```

## 16. Canvas Grid Decoration

Decorative lines between sections:
```html
<!-- Full-width horizontal line -->
<div class="border-t border-gray-200" />

<!-- Container-width vertical lines (pseudo-elements on section wrapper) -->
<div class="relative">
  <div class="absolute inset-y-0 left-0 w-px bg-gray-200" />
  <div class="absolute inset-y-0 right-0 w-px bg-gray-200" />
  <!-- Section content -->
</div>
```

Horizontal = viewport width. Vertical = container width. Creates a refined grid frame.

## 17. Background Image Testimonials

```html
<div class="relative rounded-2xl overflow-hidden h-96">
  <img src="/testimonial-person.jpg" class="absolute inset-0 w-full h-full object-cover" />
  <div class="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-transparent" />
  <div class="relative h-full flex flex-col justify-end p-8">
    <blockquote class="text-white text-lg font-medium">"Quote text here..."</blockquote>
    <p class="text-white/70 text-sm mt-3">— Name, Title</p>
  </div>
</div>
```

## 18. Logo Cloud

```html
<div class="flex items-center justify-between gap-8">
  <!-- Real SVG logos, no title, no opacity tricks -->
  <img src="/logos/company1.svg" class="h-8 text-gray-950" alt="Company 1" />
  <img src="/logos/company2.svg" class="h-8 text-gray-950" alt="Company 2" />
  <!-- ... -->
</div>
```

No section title. Fill the full width. Use actual SVG logos (not text). Direct color, no opacity.

## Source

Based on Steve Schoger's "Designing with Claude Code" video and workflow.
Steve Schoger is a designer at Tailwind Labs, co-creator of Refactoring UI.
Reference: https://ui.sh

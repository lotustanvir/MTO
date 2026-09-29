# Button — component guideline

Intent: Provide the single conversion action for MTO Job Accelerator marketing surface, reusing one pattern across 28 instances.

## 1. Overview

Purpose: Trigger one explicit action per instance, such as apply now, enrol in Standard, or download course brochure.

When to use:
- Primary conversion action in header, hero, pricing, and apply sections.
- One action per card or section.

When not to use:
- Do not use for navigation lists with more than two sibling actions. Use links.
- Do not use for in-text references. Use text links.
- Do not use for form field selection. Use inputs and selects.

Density reference: 28 buttons, 32 links, 4 inputs, 1 form on the reference page. Buttons are scarce relative to lists and images, so each button must carry clear conversion intent.

## 2. Tokens and foundations

All values reference tokens. No raw hex, px, or font values in implementation.

Colors:
- color-3 background for secondary fill and primary label.
- color-1 text primary for primary fill, secondary label, borders, and focus ring.
- color-2 text light for disabled label and disabled border only.

Typography:
- Family: Inter for label. Poppins reserved for headings, not buttons.
- Size: text-sm for label. No other sizes.
- Weight: 600 for label. No other weights.
- Line height: 20px paired with text-sm.

Spacing, all from scale:
- Padding vertical: space-5.
- Padding horizontal: space-9.
- Gap icon to label: space-3.
- Section gap above action row: space-9.
- Gap between sibling buttons: space-7.

Shapes, pinned set only:
- Button container: radius-xl.
- Pill badge adjacent to buttons: radius-md. Do not apply radius-md to buttons.

Elevation:
- Default: shadow-sm.
- Hover primary: shadow-lg.
- Active: shadow-sm.
- Disabled and loading: no shadow.

Motion:
- duration-fast for transform on hover and active.
- duration-base for color transitions.
- Respect prefers-reduced-motion: disable translate on hover.

## 3. Anatomy and variants

Named parts:
- Container: carries background, border, radius, shadow, padding.
- Label: sentence case text, single line, truncated with ellipsis on overflow.
- Optional leading icon: 16px paired with text-sm, inherits current color. No trailing icon variant to preserve consistency.

Variant matrix:
- Primary: color-1 fill, color-3 label, color-1 border. Used for apply now and enrol in Premium. One primary per viewport section.
- Secondary: color-3 fill, color-1 label, color-1 border. Used for download course brochure, see curriculum, enrol in Standard.
- Disabled and loading are states, not variants.

Responsive behavior:
- Smallest breakpoint 360px: full-width stacked buttons, label truncates, container does not overflow viewport. Action row wraps.
- Largest breakpoint 1280px: inline buttons in hero-actions row, max one primary plus one secondary side by side.
- Touch target minimum 44px height met via space-5 vertical padding plus 20px line height.

Edge cases:
- Long content: truncate to one line with ellipsis, title attribute exposes full text.
- Maximum length: 24 characters including spaces.
- Empty label: never render. Button without label fails QA.
- Overflow container: buttons wrap, never cause horizontal scroll.

## 4. States and interactions

Full state table:

- Default primary: color-1 fill, color-3 label, shadow-sm.
- Default secondary: color-3 fill, color-1 label, shadow-sm.
- Hover primary: shadow-lg plus translateY minus 1px. Color unchanged.
- Hover secondary: fill swaps to color-1, label swaps to color-3.
- Focus-visible: 3px solid color-1 outline with 3px offset, visible on both variants. Must meet 3:1 contrast against adjacent background.
- Active: translateY 0, shadow-sm. Provides press feedback.
- Disabled: color-3 fill, color-2 label, color-2 border, no shadow, cursor not-allowed. Uses aria-disabled for links styled as buttons.
- Loading: pointer-events none, 70 percent opacity, label replaced by status text such as submitting. Preserves width to avoid layout shift.
- Error: not a button style. Surface form errors in field-error text paired with inputs.

Keyboard, pointer, touch:
- Tab reaches every button in visual order. Enter and Space activate native button elements.
- Links styled as buttons use anchor elements, Enter activates, no nested button inside link.
- Escape does not activate. No arrow key behavior.
- Pointer: entire container is hit area. No nested interactive elements.
- Touch: no hover dependency. Active state provides feedback.

## 5. Accessibility

- Use native button for actions, anchor for navigation. Never nest interactive elements.
- Accessible name matches visible label. No icon-only buttons in this system.
- Contrast: color-1 on color-3 and color-3 on color-1 both exceed 4.5:1 for text-sm 600 weight. color-2 on color-3 is not approved for labels, disabled state only, and disabled elements are excluded from contrast requirement but must have aria-disabled and clear visual difference.
- Focus: focus ring must be visible at 3:1 contrast. Pass if 3px outline is distinguishable on white and black fills without pointer.
- Screen reader: announces role button or link plus label. Loading state announces busy via aria-busy and updated label. Disabled state exposes aria-disabled.
- Focus order: header apply now first, then hero primary, hero secondary, section actions in document order.
- Reduced motion: disable hover translate when prefers-reduced-motion is set.

Testable checks:
- Keyboard only completes apply now flow without pointer. Pass or fail.
- Focus ring visible on both variants against background. Pass or fail.
- No critical violations in contrast, ARIA, or focus order audit. Pass or fail.

## 6. Content guidelines

- Write in sentence case. Reserve all caps for acronyms only. Example: Apply now, Enrol in Premium, not Apply Now in all caps body.
- Tone: concise, confident, implementation-focused. Avoid filler preambles.
- Length: 2 to 3 words preferred, 24 characters maximum.
- Approved labels: Apply now, Enrol in Standard, Enrol in Premium, See curriculum, Compare packages, Download course brochure.
- Placeholder rules: never use lorem, click here, submit, or learn more alone. Each label names its outcome.
- Do not use full-uppercase text for button labels.

## 7. Anti-patterns

- Do not introduce colors outside the palette for emphasis, such as green enrol buttons. Reason: breaks consistency over novelty and token discipline.
- Do not use arbitrary spacing or radius, such as 7px padding or 8px radius. Reason: violates spacing scale and pinned radius set.
- Do not mix radius values across buttons in one section. Reason: creates visual inconsistency. Use radius-xl for all buttons.
- Do not nest a button inside a link or link inside a button. Reason: breaks keyboard and screen reader behavior.
- Do not ship a button with only hover defined and missing focus-visible and disabled. Reason: fails accessibility baseline.
- Do not use all caps labels such as APPLY NOW. Reason: violates capitalisation rule and reduces readability.
- Do not use a button for low-emphasis inline references. Reason: dilutes conversion focus. Use links.

Qa checklist — definition of done:
- [ ] Renders correctly in default primary and secondary states.
- [ ] All states visually verified: default, hover, focus-visible, active, disabled, loading.
- [ ] Zero hardcoded values. All visual values use tokens.
- [ ] Keyboard navigation works without pointer, Tab order matches visual order.
- [ ] No critical accessibility violations for contrast, ARIA, focus order.
- [ ] Tested at 360px and 1280px. No overflow, truncation works.
- [ ] Anti-patterns section lists concrete misuse examples.
- [ ] Documentation covers purpose, usage, props and limitations.

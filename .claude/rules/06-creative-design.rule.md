# 06. Creative Design — Visual Craft for Every Screen

This rule adds to the design skills (`frontend-design`, `ui-ux-pro-max`, `ui-ux-reviewer`); it does not replace them. Skills give correctness (contrast, spacing, accessibility). This rule forces visual identity. A screen that passes the skills but is mostly text on a plain background FAILS this rule.

## 1. Scope

Applies to every new or redesigned page-level screen, and MUST be applied at full strength to: landing, homepage, dashboard, account/profile, marketplace, empty states, and onboarding. Small edits (a button label, a bug fix) are exempt.

## 2. Brand Anchor

FRESH O! is fresh produce, farms, harvest timing. Visuals MUST draw from that world: leaves, crops, soil, sun, seasons, crates, harvest calendar, farm-to-table route. Generic SaaS visuals (gray cards, blue gradients, stock dashboards) are not acceptable. Use the tokens in `src/app/tokens.css` and the display font in `src/app/components/displayFont.ts`; never introduce a second palette or font family per screen.

## 3. Mandatory Visual Elements (countable minimums)

Every page-level screen MUST contain all of:

1. **Signature visual**: at least 1 illustration, SVG scene, pattern, or shaped image tied to the brand anchor (reuse or extend `landing/LandingArt.tsx` / `HeroScene.tsx` style). Emoji-only or icon-only does not count.
2. **Type contrast**: at least 1 display-size heading (>= 2.5x body size) using the display font, plus at least 1 short accent element (badge, number, eyebrow label).
3. **Layout variety**: at least 2 different section layouts on the same page (e.g. split hero, bento grid, overlapping cards, offset columns, horizontal strip). A stack of identical full-width cards counts as 1 layout.
4. **Depth**: at least 2 of: layered shapes, soft gradient or tinted background bands, overlapping elements, organic curved dividers, subtle texture.
5. **Motion**: at least 1 purposeful motion (scroll reveal, hover lift, number count-up, progress fill). It MUST respect `prefers-reduced-motion`.
6. **Data as visual**: any figure a user cares about (money, quantity, harvest progress, trust_score) is shown as a visual (progress ring/bar, stat tile, timeline, chart), not only as a text row.

## 4. Text-Density Limit

- No viewport-height section may be text only. Each section holds at least 1 non-text element (illustration, image, icon cluster, chart, shape).
- No more than 3 consecutive text-only blocks (headings + paragraphs + lists) without a visual break.
- Account/settings screens: group fields into cards with a header visual (avatar with trust_score ring, role badge, section icon); a flat form list is not acceptable.

## 5. Process Gate (before writing UI code)

State in the reply, in at most 5 lines, before writing code for a screen covered by §1:

- The visual concept in one sentence (the "big idea").
- The signature visual and where it appears.
- The 2+ layouts used.
- The motion element.

Then build. After building, run the app (see the `run` skill) and check the screen against §3 and §4 item by item; report any item not met instead of claiming completion. Use `ui-ux-reviewer` as an independent pass for new page-level screens.

## 6. Anti-Patterns (FAIL on sight)

| Avoid | Prefer |
|---|---|
| Page = heading + paragraph + button repeated | Alternate layouts and visuals per section |
| Uniform card grid with identical cards | Vary card size, one featured card, or bento |
| Flat white background for the full page | Tinted bands, curves, layered shapes |
| Icons as the only imagery | Brand-world illustration or scene |
| Numbers only as text | Ring, bar, timeline, or stat tile |
| Copying a default template look | A concept tied to the harvest/farm theme |

## 7. Constraints That Still Apply

Creativity never overrides: `01-coding-standards.rule.md` (one function per job, no code comments, file/folder limits), accessibility contrast from the design skills, mobile-first PWA layout, and the incremental-generation cap of about 3 new files per pass (build the visual in units: art, then section, then styles).

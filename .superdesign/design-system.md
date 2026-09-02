# Lex Corporativo PAW Design System

## Direction

Institutional-operational and editorial-premium in equal measure: this is a serious Mexican legal productivity tool, not a generic dashboard. Prioritize clarity and trust while retaining controlled editorial character.

## Brand invariants

- Use the actual Lex Corporativo logos from `src/assets/logo-mark.png` and `src/assets/logo-lockup-transparent.png`; never replace them with initials, emoji, or invented marks.
- Fonts: Manrope Variable for UI and Playfair Display Variable for editorial/legal headings only.
- Core colors: shell `#070b13`, slate `#0f172a`/`#1e293b`/`#334155`, canvas `#f8fafc`, white paper, legal gold `#c5a059` with `#b38d47` hover.
- Blue is reserved for normative/legal-search state; green for verified/local-success states; amber/gold for primary product actions.
- Avoid purple, neon colors, glass-heavy decoration, oversized gradients, and consumer-SaaS visual tropes.

## Layout and behavior

- Mobile-first; 390px must be a first-class design, not a compressed desktop layout.
- Touch targets at least 44×44px. Inputs are at least 16px on mobile. Respect safe-area insets.
- Mobile global navigation uses a bottom bar. Secondary context uses bottom sheets.
- Desktop content max width approximately 1152–1280px, except the document workspace which may use more horizontal room.
- Cards use 12–20px radii, subtle slate borders, and restrained shadows.
- Legal documents render as white paper with strong typographic hierarchy and generous readable line height.
- Always show source, corpus/offline state, save state, and destructive-action confirmation where relevant.

## Product surfaces

- Home: clear module choice with Estudio as a first-class web capability and Desktop retained as an unchanged secondary destination.
- Legislación: compact query/filter controls, scan-friendly results, official-source prominence, and an action to send a result to Estudio.
- Licitaciones: dense but calm operational filters, deadlines, stage, and source integrity.
- Estudio: catalog → workspace; desktop split layout, mobile staged workflow; document canvas, Fundamentador panel, citation library, drafts, import/export.
- DesktopPresentation content is excluded from redesign; only the shared shell around it can change.

## Copy and trust

- Spanish (Mexico), concise and professional.
- Never claim legal validation, encryption, cloud sync, AI reasoning, or exact DOCX/PDF fidelity.
- State that documents remain on-device and require professional review.
- Use exact corpus excerpts and official links; never fabricate legal sources.

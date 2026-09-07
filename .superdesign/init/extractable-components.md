# Extractable Components

## AppShell
- Source: `src/components/AppShell.tsx`
- Category: layout
- Description: Global brand header, module navigation, sheets, notifications, install prompt, and mobile bottom bar.
- Extractable props: `activeTab`, `onTabChange`, `onGoHome`.
- Hardcoded: brand logo, navigation labels, icon choices, coverage/info actions, Tailwind classes.

## ProductIntroduction
- Source: `src/components/Introduction.tsx`
- Category: layout
- Description: Dark editorial landing surface with product modules and trust statements.
- Extractable props: active entry action through `onOpenStation`.
- Hardcoded: logo, module copy, current product claims, icons, brand presentation.

## ResponsiveSheet
- Sources: `src/components/CoverageSourcesSheet.tsx`, `src/components/SearchInfoSheet.tsx`
- Category: basic
- Description: Modal/bottom-sheet pattern used for contextual information.
- Extractable props: `open`, `onClose`, content/title values.
- Hardcoded: overlay behavior, close affordance, responsive placement.

## LegalResultCard
- Source: `src/components/BuscadorLegal.tsx`
- Category: basic
- Description: Expandable legal article result with official-source, copy, and share actions.
- Extractable props: article data, expanded state, copied state, action handlers.
- Hardcoded: legal metadata order and official-source affordance.

## TenderResultCard
- Source: `src/components/BuscadorLicitaciones.tsx`
- Category: basic
- Description: Procurement result with stage, deadlines, source integrity, and detail disclosure.
- Extractable props: tender data, selected/expanded state, actions.
- Hardcoded: procedure labels and brand styling.

## TemplateCard
- Source target: `src/components/DraftingStudio.tsx`
- Category: basic
- Description: Searchable legal-template catalog item with matter badge and drafting action.
- Extractable props: template metadata, selected state, action handler.
- Hardcoded: matter icons and catalog semantics.

## LegalCitationCard
- Source target: integrated Fundamentador in the redesigned Studio.
- Category: basic
- Description: Verifiable legal citation with law, article, excerpt, source, and insert/link actions.
- Extractable props: citation data, linked state, insert mode, actions.
- Hardcoded: official-source hierarchy and no-AI positioning.

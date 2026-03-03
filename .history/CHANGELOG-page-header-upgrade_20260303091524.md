# PageHeader System Upgrade — Changelog

## Files Changed

### Core Rewrite
| File | Action | Description |
|------|--------|-------------|
| `src/components/page-header.tsx` | **Rewritten** | Upgraded from 12 exports (568 lines) to 25+ exports. Absorbed best capabilities from section.tsx, page-container.tsx, info-panel.tsx, and card.tsx. Fixed PageHeader layout to match conventions. Added DetailPageHeader, InfoPanel, TipBox, ActionLink, FormSection, DetailSection, DetailList/DetailItem, TwoColumnLayout, CardHeader/CardBody/CardFooter/CardDivider/CardGrid. |

### Page Adoptions (PageHeader)
| File | Action | Description |
|------|--------|-------------|
| `src/pages/dashboard.tsx` | **Modified** | Replaced inline Heading+Text+IconButton with `<PageHeader>` |
| `src/pages/campaigns/list.tsx` | **Modified** | Replaced inline Heading+Text+IconButton with `<PageHeader>` |
| `src/pages/enrollments/list.tsx` | **Modified** | Replaced inline Heading+Text+Button with `<PageHeader>` |
| `src/pages/listings/list.tsx` | **Modified** | Replaced inline Heading+Text+IconButton with `<PageHeader>` |
| `src/pages/invoices/list.tsx` | **Modified** | Replaced inline Heading+Text with `<PageHeader>` |
| `src/pages/wallet/layout.tsx` | **Modified** | Replaced inline Heading+Text+Buttons with `<PageHeader>` |
| `src/pages/team/layout.tsx` | **Modified** | Replaced inline Heading+Text with `<PageHeader>` |
| `src/pages/support/index.tsx` | **Modified** | Replaced inline Heading+Text with `<PageHeader>` |

### Page Adoptions (DetailPageHeader)
| File | Action | Description |
|------|--------|-------------|
| `src/pages/enrollments/show.tsx` | **Modified** | Replaced back button + header block with `<DetailPageHeader>` |
| `src/pages/wallet/transaction.tsx` | **Modified** | Replaced back button + header block with `<DetailPageHeader>` |

### Card Migration
| File | Action | Description |
|------|--------|-------------|
| `src/pages/enrollments/show.tsx` | **Modified** | `Card` → `ContentCard` import |
| `src/pages/dashboard.tsx` | **Modified** | `Card` → `ContentCard` import |
| `src/pages/wallet/transaction.tsx` | **Modified** | `Card` → `ContentCard` import |
| `src/pages/support/index.tsx` | **Modified** | `Card` → `ContentCard` import |
| `src/pages/listings/show.tsx` | **Modified** | `Card` → `ContentCard` import |

### Infrastructure
| File | Action | Description |
|------|--------|-------------|
| `src/components/shared/index.ts` | **Modified** | Removed re-exports for section, page-container, stats-row, info-panel. Added re-export for page-header. Updated card.tsx re-export to only StatCard/MiniStat. |
| `src/routes/_app/$orgSlug/code-audit.tsx` | **Modified** | Updated imports to use new unified page-header exports |

### Cleanup (Dead Files)
| File | Action | Description |
|------|--------|-------------|
| `src/components/shared/section.tsx` | **Deleted** | Absorbed into page-header.tsx (Section→PageSection, FormSection, DetailSection, DetailList, DetailItem) |
| `src/components/shared/page-container.tsx` | **Deleted** | Absorbed into page-header.tsx (ContentGrid, GridItem, TwoColumnLayout) |
| `src/components/shared/stats-row.tsx` | **Deleted** | Zero production usage, StatCard grid is the pattern |
| `src/components/shared/info-panel.tsx` | **Deleted** | Absorbed into page-header.tsx (InfoPanel, AlertBanner, TipBox, EmptyMessage, ActionLink) |
| `src/pages/component-demo.tsx` | **Deleted** | Not a route, only demonstrated dead components |

### Not Changed (intentional)
| File | Reason |
|------|--------|
| `src/pages/listings/show.tsx` (header) | Image gallery pattern, too custom for DetailPageHeader |
| `src/pages/campaigns/show.tsx` | Custom card-based header with internal actions bar |
| `src/components/shared/card.tsx` | Kept for StatCard + MiniStat (not absorbed) |




Junk & Bloat Report
DEAD FILES — Delete Entirely (~3,400 lines)
File	Lines	Why Dead
types/index.ts	~123	Zero importers. Encore types used instead
lib/theme.ts	~387	Zero importers. design-tokens.ts replaced it
lib/error-utils.ts	~264	Zero importers. api-client.ts has the used versions
components/page-header.tsx	~568	Zero importers
components/stat.tsx	~17	Zero importers. StatCard used instead
components/pagination.tsx	~98	Zero importers
components/alert.tsx	~95	Zero importers
components/description-list.tsx	~20	Zero importers
components/radio.tsx	~40	Zero importers
components/listbox.tsx	~150	Zero importers
components/table.tsx	~120	Zero importers
components/virtual-list.tsx	~50	Zero importers
components/shared/info-panel.tsx	~50	Zero importers
components/shared/section.tsx	~253	Zero importers
components/shared/stats-row.tsx	~340	Zero importers
components/shared/page-container.tsx	~201	Zero importers
UNUSED NPM PACKAGES — Remove from package.json
Package	Why
@fontsource-variable/geist	Fonts loaded from public/fonts/ directly
@fontsource/instrument-serif	Same — loaded from public/fonts/
react-icons	Only 2 icons used — replace with @heroicons/react
@tanstack/react-virtual	Only imported by dead virtual-list.tsx
@testing-library/dom	No test files exist
@testing-library/react	No test files exist
jsdom	No test files exist
COPY-PASTED CODE — 10x ErrorState, 7x formatDate, 5x LoadingSkeleton
ErrorState — identical error UI copy-pasted in 10 pages. Should be one shared component.
formatDate/formatDateTime — redefined locally in 7 files despite existing in design-tokens.ts.
LoadingSkeleton — defined locally in 5 detail pages. Should be shared.
WizardStepper — duplicated in create-campaign-modal.tsx and create-listing-modal.tsx.
getInitials — defined in 2 files (identical one-liner).
formatPrice — duplicates formatCurrency from design-tokens.
UNUSED EXPORTS in design-tokens.ts (~300 lines)
typography, spacing, cardStyles, iconSizes, gridPatterns, getStatusColor, formatStatus, containerStyles, interactive, iconBg, getProgressColor, getProgressTrack, card, infoBox, formatNumber, formatCompactNumber, getCurrentDateFormatted — none are imported anywhere.

DEAD CSS in App.css (~180 lines)
pt-safe/pb-safe/etc safe-area utilities, text-glaze animation, animate-scale-in, animate-pulse-soft, animate-slide-up, scanner animation — all zero references.

MISC JUNK
15 console.error/warn statements across pages (debug leftovers)
7 "use client" directives — meaningless in TanStack Start (Next.js leftover)
Duplicate filter components — filter-bar.tsx vs filter-chip.tsx overlap with aliased re-exports
Total removable bloat: ~3,400 lines of dead files + ~800 lines of duplication + ~180 lines dead CSS + 7 unused packages.

Want me to start cleaning this up?
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

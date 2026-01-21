# Hypedrive Brand - Complete Migration Plan
## Next.js 15 → Vite + Refine v5 + Catalyst UI + Custom Multitenancy (Full CSR)

---

## 📋 Executive Summary

### Source Project Analysis (Next.js - `Hypedrive Brand/`)

**Tech Stack:**
- Next.js 15+ with App Router (SSR/ISR/Streaming)
- AlignUI Design System (Radix UI + Tailwind CSS)
- TanStack Query v5 for data fetching
- React Hook Form + Zod for forms
- Encore Backend (typed API client via `brand-client.ts`)
- Better-Auth for authentication
- Sonner for toasts, nuqs for URL state
- Phosphor Icons

**Features (12 modules):**
1. **Auth** - Sign in/up, forgot password, 2FA, session management
2. **Organizations** - Multi-tenancy, onboarding wizard, GST verification
3. **Campaigns** - CRUD, status workflow, deliverables, multi-step create form
4. **Enrollments** - List/detail, bulk approve/reject, status transitions
5. **Products** - CRUD, categories, bulk import
6. **Invoices** - List/detail, PDF generation
7. **Wallet** - Balance, transactions, withdrawals, credit requests
8. **Team** - Members, invitations, roles, permissions
9. **Settings** - Organization profile, bank accounts
10. **Notifications** - Novu integration, preferences
11. **Integrations** - Third-party connections
12. **Storage** - File uploads

### Target Project (Vite + Refine - `hypedrive-brand/`)

**Tech Stack:**
- Vite 7 + React 19 (Full CSR)
- Catalyst UI Kit (Headless UI + Tailwind CSS v4)
- Refine v5 (headless mode)
- React Router v7
- Custom Multitenancy Provider (URL-based `/:tenantId/*`)
- TanStack Table for data tables
- React Hook Form + Zod for forms

---

## 🏗️ Architecture Comparison

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    SOURCE (Next.js)                TARGET (Vite + Refine)       │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Rendering: SSR/ISR/Streaming              →       Full CSR                     │
│  UI: AlignUI (Radix + Tailwind)            →       Catalyst (Headless UI)       │
│  Data: TanStack Query + custom hooks       →       Refine v5 hooks              │
│  Forms: React Hook Form + Zod              →       useForm (Refine) + Zod       │
│  Auth: Better-Auth + custom                →       Refine authProvider          │
│  Routing: Next.js App Router               →       React Router v7              │
│  API: Encore typed client                  →       Refine dataProvider          │
│  State: nuqs (URL state)                   →       syncWithLocation             │
│  Toasts: Sonner                            →       Refine notificationProvider  │
│  Icons: Phosphor Icons                     →       Heroicons                    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Complete Feature Mapping

### Source Features → Target Resources

| Source Feature | Source Hooks | Target Resource | Refine Hooks |
|----------------|--------------|-----------------|--------------|
| **campaigns** | `useCampaigns`, `useCampaign`, `useCreateCampaign`, `useUpdateCampaign`, `useDeleteCampaign`, `useCampaignStats`, `useCampaignDeliverables` | `campaigns` | `useList`, `useOne`, `useCreate`, `useUpdate`, `useDelete`, `useCustom` |
| **enrollments** | `useEnrollments`, `useEnrollment`, `useBulkApproveEnrollments`, `useBulkRejectEnrollments`, `useEnrollmentStats` | `enrollments` | `useList`, `useOne`, `useUpdate`, `useCustomMutation` |
| **products** | `useProducts`, `useProduct`, `useCreateProduct`, `useUpdateProduct`, `useDeleteProduct`, `useBulkImportProducts` | `products` | `useList`, `useOne`, `useCreate`, `useUpdate`, `useDelete`, `useCustomMutation` |
| **invoices** | `useInvoices`, `useInvoice`, `useGenerateInvoicePDF` | `invoices` | `useList`, `useOne`, `useCustomMutation` |
| **wallet** | `useWallet`, `useWalletTransactions`, `useWithdrawals`, `useRequestWithdrawal`, `useFundWallet` | `wallet`, `transactions` | `useOne`, `useList`, `useCustomMutation` |
| **team** | `useTeamMembers`, `useTeamInvitations`, `useInviteMember`, `useRemoveMember`, `useUpdateMemberRole` | `team-members`, `invitations` | `useList`, `useCreate`, `useDelete`, `useUpdate` |
| **organizations** | `useOrganizations`, `useOrganization`, `useUpdateOrganization`, `useDashboardOverview` | `organizations` | `useList`, `useOne`, `useUpdate`, `useCustom` |
| **settings** | `useSettings`, `useBankAccount`, `useUpdateBankAccount` | `settings`, `bank-accounts` | `useOne`, `useUpdate` |

---

## 📁 Source Project Structure Analysis

### Routes (Next.js App Router)

```
app/
├── (auth)/                          # Auth group
│   ├── sign-in/page.tsx
│   ├── sign-up/page.tsx
│   └── verify/page.tsx
├── (dashboard)/
│   └── dashboard/
│       └── [organizationId]/        # Multi-tenancy via URL
│           ├── page.tsx             # Dashboard home
│           ├── campaigns/
│           │   ├── page.tsx         # List
│           │   ├── create/page.tsx  # Create (multi-step wizard)
│           │   └── [id]/page.tsx    # Detail + tabs
│           ├── enrollments/
│           │   ├── page.tsx         # List with bulk actions
│           │   └── [id]/page.tsx    # Detail
│           ├── products/
│           │   ├── page.tsx         # List
│           │   ├── new/page.tsx     # Create
│           │   └── [id]/page.tsx    # Detail
│           ├── invoices/page.tsx    # List
│           ├── wallet/page.tsx      # Balance + transactions
│           ├── team/page.tsx        # Members + invitations
│           ├── settings/page.tsx    # Organization settings
│           ├── profile/page.tsx     # User profile
│           └── help/page.tsx        # Help & support
├── (onboarding)/
│   └── onboarding/
│       ├── page.tsx                 # Multi-step wizard
│       ├── pending/page.tsx         # Awaiting approval
│       └── banned/page.tsx          # Account banned
├── forgot-password/page.tsx
├── reset-password/page.tsx
└── verify-email/page.tsx
```

### Features Module Structure

```
features/
├── auth/
│   ├── actions/                     # Server actions
│   ├── hooks/                       # useSession, useSignOut
│   ├── types/                       # User, Session types
│   └── index.ts                     # Public API
├── campaigns/
│   ├── actions/campaigns.ts         # createCampaign, updateCampaign, etc.
│   ├── hooks/use-campaigns.ts       # All campaign hooks
│   ├── types/index.ts               # Campaign, CampaignStats, etc.
│   ├── ssr.ts                       # Server-side data fetching
│   └── index.ts                     # Public API
├── enrollments/
│   ├── actions/enrollments.ts
│   ├── hooks/use-enrollments.ts
│   ├── types/index.ts
│   ├── ssr.ts
│   └── index.ts
├── products/
│   ├── actions/products.ts
│   ├── hooks/use-products.ts
│   ├── types/index.ts
│   ├── ssr.ts
│   └── index.ts
├── invoices/
│   ├── actions/invoices.ts
│   ├── hooks/use-invoices.ts
│   ├── types/index.ts
│   ├── ssr.ts
│   └── index.ts
├── wallet/
│   ├── actions/wallet.ts
│   ├── hooks/use-wallet.ts
│   ├── types/index.ts
│   ├── ssr.ts
│   └── index.ts
├── team/
│   ├── actions/team.ts
│   ├── hooks/use-team.ts
│   ├── types/index.ts
│   ├── ssr.ts
│   └── index.ts
├── organizations/
│   ├── actions/organizations.ts
│   ├── hooks/use-organizations.ts
│   ├── types/index.ts
│   ├── ssr.ts
│   └── index.ts
├── settings/
│   ├── actions/settings.ts
│   ├── hooks/use-settings.ts
│   ├── types/index.ts
│   └── index.ts
├── notifications/
│   ├── actions/notifications.ts
│   ├── hooks/use-notifications.ts
│   ├── types/index.ts
│   └── index.ts
├── integrations/
│   └── ...
└── storage/
    └── ...
```

### UI Components Structure (AlignUI)

```
components/ui/
├── branding/
│   ├── logo.tsx
│   ├── social-icons.tsx
│   └── payment-icons.tsx
├── data-display/
│   ├── badge.tsx
│   ├── card.tsx
│   ├── charts.tsx
│   ├── data-table.tsx              # TanStack Table wrapper
│   ├── metric.tsx
│   ├── status-badge.tsx
│   ├── table.tsx
│   ├── tag.tsx
│   └── tracker.tsx
├── feedback/
│   ├── alert.tsx
│   ├── callout.tsx
│   ├── empty-state.tsx
│   ├── loading-indicator.tsx
│   └── notification.tsx
├── forms/
│   ├── checkbox.tsx
│   ├── currency-input.tsx
│   ├── datepicker.tsx
│   ├── file-dropzone.tsx
│   ├── form-field.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── radio.tsx
│   ├── select.tsx
│   ├── slider.tsx
│   ├── switch.tsx
│   └── textarea.tsx
├── layout/
│   ├── accordion.tsx
│   ├── divider.tsx
│   ├── drawer.tsx
│   ├── dropdown.tsx
│   ├── modal.tsx
│   ├── popover.tsx
│   ├── side-panel.tsx
│   └── tooltip.tsx
├── navigation/
│   ├── breadcrumb.tsx
│   ├── command-menu.tsx
│   ├── pagination.tsx
│   ├── sidebar-navigation.tsx
│   └── tab-menu-horizontal.tsx
└── primitives/
    ├── avatar.tsx
    ├── button.tsx
    ├── button-group.tsx
    ├── progress-bar.tsx
    ├── skeleton.tsx
    └── stepper.tsx
```

---

## 🔄 Hook Migration Guide

### TanStack Query → Refine v5 Patterns

#### List Query Migration

```typescript
// SOURCE: Next.js with TanStack Query
export function useCampaigns(orgId: string, params?: { skip?: number; take?: number; status?: CampaignStatus }) {
  return useQuery({
    queryKey: campaignKeys.list(orgId, params),
    queryFn: () => client.organizations.listCampaigns(orgId, {
      skip: params?.skip ?? 0,
      take: params?.take ?? PAGE_SIZE.MEDIUM,
      status: params?.status,
    }),
    enabled: !!orgId,
    staleTime: STALE_TIME.SHORT,
    gcTime: GC_TIME.MEDIUM,
    ...DEFAULT_RETRY_CONFIG,
  });
}

// TARGET: Refine v5
export function useTenantCampaigns(params?: { status?: CampaignStatus }) {
  const { tenant } = useMultitenancy();
  
  const { result, query } = useList<Campaign>({
    resource: "campaigns",
    pagination: { current: 1, pageSize: 50 },
    filters: params?.status ? [{ field: "status", operator: "eq", value: params.status }] : [],
    sorters: [{ field: "createdAt", order: "desc" }],
    meta: { tenantId: tenant?.id },
  });
  
  return {
    campaigns: result.data ?? [],
    total: result.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
```

#### Detail Query Migration

```typescript
// SOURCE: Next.js
export function useCampaign(orgId: string, id: string) {
  return useQuery({
    queryKey: campaignKeys.detail(orgId, id),
    queryFn: () => client.organizations.getCampaign(orgId, id),
    enabled: !!orgId && !!id,
    staleTime: STALE_TIME.SHORT,
  });
}

// TARGET: Refine v5
export function useTenantCampaign(id: string) {
  const { tenant } = useMultitenancy();
  
  const { result, query } = useOne<Campaign>({
    resource: "campaigns",
    id,
    meta: { tenantId: tenant?.id },
  });
  
  return {
    campaign: result.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
```

#### Mutation Migration

```typescript
// SOURCE: Next.js with TanStack Query
export function useCreateCampaign(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => actions.createCampaign({ ...data, organizationId: orgId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: campaignKeys.lists(orgId) }),
    onError: createMutationErrorHandler("create campaign"),
  });
}

// TARGET: Refine v5
export function useTenantCreateCampaign() {
  const { tenant } = useMultitenancy();
  
  const { mutate, mutation } = useCreate<Campaign>();
  
  const createCampaign = (data: CreateCampaignInput) => {
    mutate({
      resource: "campaigns",
      values: data,
      meta: { tenantId: tenant?.id },
    }, {
      onSuccess: () => { /* auto-invalidates */ },
      onError: (error) => toast.error(error.message),
    });
  };
  
  return {
    createCampaign,
    isPending: mutation.isPending,
  };
}
```

#### Form Migration (React Hook Form + Zod)

```typescript
// SOURCE: Next.js
const {
  register,
  control,
  handleSubmit,
  formState: { errors },
} = useForm<CampaignFormInput>({
  resolver: zodResolver(campaignFormSchema),
  mode: "onChange",
  defaultValues: { type: "cashback", isPublic: true },
});

// TARGET: Refine useForm with React Hook Form
const {
  refineCore: { onFinish, formLoading },
  register,
  control,
  handleSubmit,
  formState: { errors },
} = useForm<CampaignFormInput>({
  resolver: zodResolver(campaignFormSchema),
  mode: "onChange",
  defaultValues: { type: "cashback", isPublic: true },
  refineCoreProps: {
    resource: "campaigns",
    action: "create",
    meta: { tenantId },
    redirect: "show",
  },
});
```

---

## 📝 Type Definitions (From Source)

### Campaign Types

```typescript
// From features/campaigns/types/index.ts
export type Campaign = campaigns.Campaign;
export type CampaignWithStats = organizations.CampaignWithStats;
export type CampaignStats = organizations.CampaignStats;
export type CampaignStatus = shared.CampaignStatus;
export type CampaignType = shared.CampaignType; // "cashback" | "barter" | "hybrid"

export const CAMPAIGN_STATUS_ACTIONS = [
  "submit", "activate", "cancel", "pause", "resume", 
  "end", "complete", "archive", "unarchive"
] as const;

export type CampaignStatusAction = (typeof CAMPAIGN_STATUS_ACTIONS)[number];
```

### Enrollment Types

```typescript
// From features/enrollments/types/index.ts
export type Enrollment = enrollments.Enrollment;
export type EnrollmentWithRelations = organizations.EnrollmentWithRelations;
export type EnrollmentStatus = shared.EnrollmentStatus;
// "awaiting_submission" | "awaiting_review" | "changes_requested" | 
// "approved" | "permanently_rejected" | "withdrawn" | "expired"
```

### Product Types

```typescript
// From features/products/types/index.ts
export type Product = organizations.Product;
export type ProductWithStats = organizations.ProductWithStats;
export type ProductImageItem = organizations.ProductImageItem;
```

### Wallet Types

```typescript
// From features/wallet/types/index.ts
export type OrganizationWallet = organizations.OrganizationWalletResponse;
export type WalletTransaction = organizations.WalletTransaction;
export type Withdrawal = organizations.Withdrawal;
export type WithdrawalStatus = shared.WithdrawalStatus;
```

### Team Types

```typescript
// From features/team/types/index.ts
export type Member = auth.MemberResponse;
export type Invitation = auth.InvitationResponse;
export type UserRole = "owner" | "admin" | "manager" | "viewer";
export type TeamMemberRole = "owner" | "admin" | "member";
```

### Organization Types

```typescript
// From features/organizations/types/index.ts
export type Organization = organizations.Organization;
export type ApprovalStatus = shared.ApprovalStatus; // "draft" | "pending" | "approved" | "rejected" | "banned"
export type BusinessType = "pvt_ltd" | "llp" | "partnership" | "proprietorship" | "public_ltd" | "trust" | "society" | "other";
export type IndustryCategory = "electronics" | "fashion" | "fmcg" | "beauty" | "home_appliances" | "sports" | "automotive" | "other";
```

---

## 🔐 Validation Schemas (From Source)

### Campaign Form Schema

```typescript
// From lib/utils/validations.ts
export const campaignFormSchema = z.object({
  productId: z.string().min(1, "Please select a product"),
  title: z.string().min(3).max(255),
  description: z.string().max(5000).optional(),
  type: z.enum(["cashback", "barter", "hybrid"]),
  isPublic: z.boolean(),
  startDate: z.date(),
  endDate: z.date(),
  maxEnrollments: z.number().int().min(1).max(1000000),
  submissionDeadlineDays: z.number().int().min(1).max(90),
  deliverables: z.array(z.object({
    id: z.string(),
    type: z.string().min(1),
    title: z.string().min(1).max(200),
    isRequired: z.boolean(),
    instructions: z.string().max(500).optional(),
  })).min(1),
  terms: z.array(z.string()).optional(),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});
```

### Product Form Schema

```typescript
export const productFormSchema = z.object({
  name: z.string().min(2).max(500),
  description: z.string().max(5000).optional(),
  brand: z.string().min(2).max(100).optional(),
  categoryId: z.string().optional(),
  platformId: z.string().optional(),
  productLink: z.string().url().max(2048).optional(),
  price: z.number().min(0).optional(),
  sku: z.string().min(1).max(100).optional(),
});
```

### Onboarding Form Schema

```typescript
export const onboardingFormSchema = z.object({
  _ui: z.object({
    currentStep: z.number().min(1).max(3),
    termsAccepted: z.boolean(),
  }),
  basicInfo: z.object({
    name: z.string().min(2).max(255),
    description: z.string().max(2000).optional(),
    website: z.string().url().max(2048).optional(),
  }),
  businessDetails: z.object({
    businessType: z.enum(BUSINESS_TYPES),
    industryCategory: z.string().min(1).max(100),
    contactPerson: z.string().min(2).max(255),
    phone: z.string().regex(/^(\+91)?[6-9]\d{9}$/),
    address: z.string().min(5).max(500),
    city: z.string().min(2).max(100),
    state: z.string().min(1).max(100),
    pinCode: z.string().regex(/^[1-9]\d{5}$/),
  }),
  verification: z.object({
    gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/),
    gstVerified: z.boolean(),
    gstLegalName: z.string().optional(),
    cinNumber: z.string().max(21).optional(),
  }).refine((data) => data.gstVerified === true, {
    message: "GST verification is mandatory",
    path: ["gstVerified"],
  }),
});
```

### Bank Account Schema

```typescript
export const bankAccountBodySchema = z.object({
  bankName: z.string().min(2).max(255),
  accountNumber: z.string().min(5).max(30).regex(/^\d+$/),
  accountHolderName: z.string().min(2).max(255),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/),
  accountType: z.enum(["current", "savings"]),
  isDefault: z.boolean(),
});
```

---

## 🎨 UI Component Mapping

### AlignUI → Catalyst Mapping

| AlignUI Component | Catalyst Equivalent | Notes |
|-------------------|---------------------|-------|
| `Button.Root` | `Button` | Similar API, different variants |
| `Input.Root` | `Input` | Add wrapper for icons |
| `Select.Root/Trigger/Content/Item` | `Select/Listbox` | Use Headless UI Listbox |
| `Modal.Root/Content/Header/Body/Footer` | `Dialog` | Headless UI Dialog |
| `Dropdown.Root/Trigger/Content/Item` | `Dropdown` | Headless UI Menu |
| `Badge.Root` | `Badge` | Map color variants |
| `Avatar.Root` | `Avatar` | Similar API |
| `Table.Root/Header/Body/Row/Cell` | `Table` | Similar structure |
| `Tooltip.Root/Trigger/Content` | Headless UI Tooltip | Custom implementation |
| `Checkbox.Root` | `Checkbox` | Headless UI Checkbox |
| `Switch.Root` | `Switch` | Headless UI Switch |
| `Tabs` (Tab Menu) | Headless UI Tabs | Custom styling |
| `Popover.Root` | Headless UI Popover | Similar API |
| `Drawer` | Headless UI Dialog | Side panel variant |

### Status Badge Mapping

```typescript
// Source: AlignUI StatusBadge
<StatusBadge.Root status="success" variant="light">Active</StatusBadge.Root>

// Target: Catalyst Badge
<Badge color="lime">Active</Badge>

// Status → Color mapping
const statusColorMap = {
  success: "lime",
  warning: "amber", 
  error: "red",
  info: "sky",
  neutral: "zinc",
};
```

### Icon Mapping (Phosphor → Heroicons)

| Phosphor Icon | Heroicons Equivalent |
|---------------|---------------------|
| `House` | `HomeIcon` |
| `Megaphone` | `MegaphoneIcon` |
| `UserPlus` | `UserPlusIcon` |
| `ShoppingBag` | `ShoppingBagIcon` |
| `Wallet` | `WalletIcon` |
| `FileText` | `DocumentTextIcon` |
| `UsersThree` | `UserGroupIcon` |
| `Gear` | `Cog6ToothIcon` |
| `Plus` | `PlusIcon` |
| `MagnifyingGlass` | `MagnifyingGlassIcon` |
| `ArrowRight` | `ArrowRightIcon` |
| `Check` | `CheckIcon` |
| `X` | `XMarkIcon` |
| `Warning` | `ExclamationTriangleIcon` |
| `Clock` | `ClockIcon` |
| `Play` | `PlayIcon` |
| `Pause` | `PauseIcon` |

---

## 📁 Target Project Structure

```
src/
├── App.tsx                              # Refine setup with all providers
├── index.tsx                            # Entry point
├── vite-env.d.ts
│
├── components/
│   ├── ui/                              # Catalyst UI components
│   │   ├── alert.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── checkbox.tsx
│   │   ├── combobox.tsx
│   │   ├── dialog.tsx
│   │   ├── divider.tsx
│   │   ├── dropdown.tsx
│   │   ├── fieldset.tsx
│   │   ├── heading.tsx
│   │   ├── input.tsx
│   │   ├── link.tsx
│   │   ├── listbox.tsx
│   │   ├── pagination.tsx
│   │   ├── radio.tsx
│   │   ├── select.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── text.tsx
│   │   └── textarea.tsx
│   │
│   ├── layout/
│   │   ├── app-layout.tsx               # Main dashboard layout
│   │   ├── auth-layout.tsx              # Auth pages layout
│   │   ├── sidebar.tsx                  # Navigation sidebar
│   │   ├── sidebar-layout.tsx           # Sidebar container
│   │   ├── navbar.tsx                   # Top navigation
│   │   └── logo.tsx                     # Brand logo
│   │
│   ├── dashboard/
│   │   ├── stat-card.tsx                # Stats display
│   │   ├── metrics-grid.tsx             # Dashboard metrics
│   │   ├── campaigns-section.tsx        # Top campaigns
│   │   ├── enrollment-trend.tsx         # Enrollment chart
│   │   ├── priority-queue.tsx           # Pending enrollments
│   │   └── alert-bar.tsx                # Status alerts
│   │
│   └── shared/
│       ├── data-table.tsx               # Refine + TanStack Table
│       ├── form-field.tsx               # Form field wrapper
│       ├── status-badge.tsx             # Status indicators
│       ├── empty-state.tsx              # Empty states
│       ├── loading-skeleton.tsx         # Loading states
│       ├── confirmation-modal.tsx       # Delete/action confirmations
│       └── tenant-switcher.tsx          # Organization switcher
│
├── pages/
│   ├── auth/
│   │   ├── index.ts
│   │   ├── layout.tsx                   # Auth layout wrapper
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   └── verify-email.tsx
│   │
│   ├── onboarding/
│   │   ├── index.tsx                    # Multi-step wizard
│   │   ├── pending.tsx                  # Awaiting approval
│   │   └── banned.tsx                   # Account banned
│   │
│   ├── dashboard/
│   │   └── index.tsx                    # Dashboard overview
│   │
│   ├── campaigns/
│   │   ├── index.ts
│   │   ├── list.tsx                     # Campaign list with filters
│   │   ├── show.tsx                     # Campaign details + tabs
│   │   ├── create.tsx                   # Multi-step create wizard
│   │   └── edit.tsx                     # Edit campaign
│   │
│   ├── enrollments/
│   │   ├── index.ts
│   │   ├── list.tsx                     # Enrollment list + bulk actions
│   │   └── show.tsx                     # Enrollment details
│   │
│   ├── products/
│   │   ├── index.ts
│   │   ├── list.tsx                     # Product list
│   │   ├── show.tsx                     # Product details
│   │   ├── create.tsx                   # Create product
│   │   └── edit.tsx                     # Edit product
│   │
│   ├── invoices/
│   │   ├── index.ts
│   │   ├── list.tsx                     # Invoice list
│   │   └── show.tsx                     # Invoice details
│   │
│   ├── wallet/
│   │   └── index.tsx                    # Balance + transactions
│   │
│   ├── team/
│   │   └── index.tsx                    # Members + invitations
│   │
│   └── settings/
│       └── index.tsx                    # Organization settings
│
├── providers/
│   ├── index.ts                         # Export all providers
│   ├── data-provider.ts                 # Tenant-aware data provider
│   ├── auth-provider.ts                 # Authentication provider
│   ├── notification-provider.ts         # Toast notifications
│   ├── access-control-provider.ts       # Role-based access
│   └── multitenancy/
│       ├── index.ts
│       ├── context.tsx                  # Multitenancy context
│       ├── provider.tsx                 # MultitenancyProvider
│       ├── hooks.ts                     # useMultitenancy, useRouterAdapter
│       └── with-tenant.tsx              # WithTenant wrapper
│
├── hooks/
│   ├── index.ts
│   ├── use-tenant-meta.ts               # Auto-inject tenantId
│   ├── use-tenant-navigation.ts         # Tenant-aware navigation
│   ├── use-dashboard-stats.ts           # Dashboard aggregations
│   ├── use-debounce.ts                  # Debounce utility
│   └── use-local-storage.ts             # LocalStorage hook
│
├── types/
│   ├── index.ts                         # Re-export all types
│   ├── campaign.ts                      # Campaign types
│   ├── enrollment.ts                    # Enrollment types
│   ├── product.ts                       # Product types
│   ├── invoice.ts                       # Invoice types
│   ├── wallet.ts                        # Wallet types
│   ├── team.ts                          # Team types
│   ├── organization.ts                  # Organization types
│   └── auth.ts                          # Auth types
│
├── lib/
│   ├── api-client.ts                    # Axios instance
│   ├── utils.ts                         # Helper functions (cn, formatDate, etc.)
│   ├── validations.ts                   # Zod schemas
│   ├── constants.ts                     # App constants
│   └── routes.ts                        # Route definitions
│
└── config/
    ├── resources.ts                     # Refine resources config
    └── navigation.ts                    # Sidebar navigation config
```

---

## 🔧 Provider Implementations

### Data Provider (Tenant-Aware)

```typescript
// providers/data-provider.ts
import { DataProvider, HttpError } from "@refinedev/core";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Add auth token interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const dataProvider: DataProvider = {
  getApiUrl: () => API_URL,

  getList: async ({ resource, pagination, sorters, filters, meta }) => {
    const { tenantId } = meta || {};
    const { current = 1, pageSize = 10 } = pagination || {};
    
    const params = new URLSearchParams({
      skip: String((current - 1) * pageSize),
      take: String(pageSize),
    });
    
    // Add filters
    filters?.forEach(filter => {
      if ('field' in filter && filter.value !== undefined) {
        params.append(filter.field, String(filter.value));
      }
    });
    
    // Add sorters
    if (sorters?.length) {
      params.append('sortBy', sorters[0].field);
      params.append('sortOrder', sorters[0].order);
    }
    
    const url = tenantId 
      ? `/organizations/${tenantId}/${resource}?${params}`
      : `/${resource}?${params}`;
    
    const { data } = await axiosInstance.get(url);
    
    return {
      data: data.items || data.data || data,
      total: data.total || data.length,
    };
  },

  getOne: async ({ resource, id, meta }) => {
    const { tenantId } = meta || {};
    const url = tenantId 
      ? `/organizations/${tenantId}/${resource}/${id}`
      : `/${resource}/${id}`;
    
    const { data } = await axiosInstance.get(url);
    return { data };
  },

  create: async ({ resource, variables, meta }) => {
    const { tenantId } = meta || {};
    const url = tenantId 
      ? `/organizations/${tenantId}/${resource}`
      : `/${resource}`;
    
    const { data } = await axiosInstance.post(url, variables);
    return { data };
  },

  update: async ({ resource, id, variables, meta }) => {
    const { tenantId } = meta || {};
    const url = tenantId 
      ? `/organizations/${tenantId}/${resource}/${id}`
      : `/${resource}/${id}`;
    
    const { data } = await axiosInstance.patch(url, variables);
    return { data };
  },

  deleteOne: async ({ resource, id, meta }) => {
    const { tenantId } = meta || {};
    const url = tenantId 
      ? `/organizations/${tenantId}/${resource}/${id}`
      : `/${resource}/${id}`;
    
    const { data } = await axiosInstance.delete(url);
    return { data };
  },

  custom: async ({ url, method, payload, query, meta }) => {
    const { tenantId } = meta || {};
    const fullUrl = tenantId 
      ? `/organizations/${tenantId}${url}`
      : url;
    
    const params = query ? `?${new URLSearchParams(query as Record<string, string>)}` : '';
    
    const { data } = await axiosInstance({
      method,
      url: `${fullUrl}${params}`,
      data: payload,
    });
    
    return { data };
  },
};
```

### Auth Provider

```typescript
// providers/auth-provider.ts
import { AuthProvider } from "@refinedev/core";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      return {
        success: true,
        redirectTo: "/",
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          name: "LoginError",
          message: error.response?.data?.message || "Invalid credentials",
        },
      };
    }
  },

  logout: async () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    return {
      success: true,
      redirectTo: "/login",
    };
  },

  check: async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      return {
        authenticated: false,
        redirectTo: "/login",
        logout: true,
      };
    }
    return { authenticated: true };
  },

  getIdentity: async () => {
    const user = localStorage.getItem("user");
    if (user) {
      return JSON.parse(user);
    }
    return null;
  },

  getPermissions: async () => {
    const user = localStorage.getItem("user");
    if (user) {
      return JSON.parse(user).role;
    }
    return null;
  },

  onError: async (error) => {
    if (error?.statusCode === 401 || error?.statusCode === 403) {
      return { logout: true, redirectTo: "/login" };
    }
    return {};
  },

  register: async ({ email, password, name }) => {
    try {
      await axios.post(`${API_URL}/auth/register`, { email, password, name });
      return {
        success: true,
        redirectTo: "/login",
        successNotification: {
          message: "Registration successful",
          description: "Please check your email to verify your account",
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          name: "RegisterError",
          message: error.response?.data?.message || "Registration failed",
        },
      };
    }
  },

  forgotPassword: async ({ email }) => {
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      return {
        success: true,
        successNotification: {
          message: "Password reset email sent",
          description: "Please check your email for reset instructions",
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          name: "ForgotPasswordError",
          message: error.response?.data?.message || "Failed to send reset email",
        },
      };
    }
  },

  updatePassword: async ({ password, confirmPassword }) => {
    try {
      const token = new URLSearchParams(window.location.search).get("token");
      await axios.post(`${API_URL}/auth/reset-password`, { token, password, confirmPassword });
      return {
        success: true,
        redirectTo: "/login",
        successNotification: {
          message: "Password updated",
          description: "You can now login with your new password",
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          name: "UpdatePasswordError",
          message: error.response?.data?.message || "Failed to update password",
        },
      };
    }
  },
};
```

### Multitenancy Provider

```typescript
// providers/multitenancy/provider.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useParams, useNavigate } from "react-router";

export interface Tenant {
  id: string;
  name: string;
  logo?: string;
  approvalStatus?: string;
}

interface MultitenancyContextValue {
  tenant: Tenant | null;
  tenants: Tenant[];
  setTenant: (tenant: Tenant) => void;
  isLoading: boolean;
}

const MultitenancyContext = createContext<MultitenancyContextValue | null>(null);

interface MultitenancyProviderProps {
  children: ReactNode;
  fetchTenants: () => Promise<{ tenants: Tenant[]; defaultTenant?: Tenant }>;
}

export function MultitenancyProvider({ children, fetchTenants }: MultitenancyProviderProps) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenant, setTenantState] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();

  // Fetch tenants on mount
  useEffect(() => {
    fetchTenants()
      .then(({ tenants, defaultTenant }) => {
        setTenants(tenants);
        
        // Find tenant from URL or use default
        const currentTenant = tenantId 
          ? tenants.find(t => t.id === tenantId)
          : defaultTenant;
        
        if (currentTenant) {
          setTenantState(currentTenant);
        } else if (defaultTenant) {
          navigate(`/${defaultTenant.id}`, { replace: true });
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Sync tenant with URL changes
  useEffect(() => {
    if (tenantId && tenants.length > 0) {
      const found = tenants.find(t => t.id === tenantId);
      if (found && found.id !== tenant?.id) {
        setTenantState(found);
      }
    }
  }, [tenantId, tenants]);

  const setTenant = (newTenant: Tenant) => {
    setTenantState(newTenant);
    navigate(`/${newTenant.id}`, { replace: true });
  };

  return (
    <MultitenancyContext.Provider value={{ tenant, tenants, setTenant, isLoading }}>
      {children}
    </MultitenancyContext.Provider>
  );
}

export function useMultitenancy() {
  const context = useContext(MultitenancyContext);
  if (!context) {
    throw new Error("useMultitenancy must be used within MultitenancyProvider");
  }
  return context;
}
```

---

## 🎯 Implementation Phases

### Phase 1: Foundation (3-4 days)

#### 1.1 Project Setup
- [ ] Clean up existing mock data files
- [ ] Update package.json with correct dependencies
- [ ] Configure Vite for production CSR
- [ ] Setup path aliases (@/)
- [ ] Configure Tailwind v4 with Catalyst tokens
- [ ] Setup Biome for linting

#### 1.2 Providers Implementation
- [ ] **Data Provider** - Tenant-aware with full CRUD
- [ ] **Auth Provider** - Login, logout, register, forgot/reset password
- [ ] **Multitenancy Provider** - URL-based routing, tenant switching
- [ ] **Notification Provider** - Toast notifications
- [ ] **Access Control Provider** - Role-based permissions

#### 1.3 Type Definitions
- [ ] Copy all entity types from source project
- [ ] Create Zod schemas for validation
- [ ] Setup API response types

#### 1.4 Utility Functions
- [ ] `cn()` - Class name merger
- [ ] `formatCurrency()` - Currency formatting
- [ ] `formatDate()` - Date formatting
- [ ] `getInitial()` - Avatar initials
- [ ] `getTimeAgo()` - Relative time

---

### Phase 2: Authentication & Onboarding (2-3 days)

#### 2.1 Auth Pages
- [ ] **Login Page** - Email/password form, remember me, social login buttons
- [ ] **Register Page** - Registration form with validation
- [ ] **Forgot Password** - Email input, success message
- [ ] **Reset Password** - New password form with token
- [ ] **Verify Email** - Email verification page

#### 2.2 Onboarding Wizard
- [ ] **Step 1: Basic Info** - Organization name, description, website
- [ ] **Step 2: Business Details** - Business type, industry, contact, address
- [ ] **Step 3: Verification** - GST number, GST verification API
- [ ] **Pending Page** - Awaiting approval state
- [ ] **Banned Page** - Account banned state

---

### Phase 3: Dashboard & Layout (2-3 days)

#### 3.1 Layout Components
- [ ] **App Layout** - Sidebar + main content area
- [ ] **Sidebar** - Navigation, tenant switcher, user menu
- [ ] **Header** - Page title, actions
- [ ] **Tenant Switcher** - Organization dropdown with status badges

#### 3.2 Dashboard Page
- [ ] **Metrics Grid** - Wallet balance, pending enrollments, approval rate
- [ ] **Alert Bar** - Overdue enrollments, low balance warnings
- [ ] **Campaigns Section** - Top campaigns with stats
- [ ] **Enrollment Trend** - Chart + tracker
- [ ] **Priority Queue** - Pending enrollments list

---

### Phase 4: Campaigns Module (3-4 days)

#### 4.1 Campaigns List
- [ ] **Status Tabs** - All, Draft, Pending, Active, Completed
- [ ] **Search** - Debounced search input
- [ ] **Campaign Cards** - Grid layout with stats
- [ ] **Actions** - View, Edit, Pause, Resume, End, Archive, Delete
- [ ] **Export** - Excel export

#### 4.2 Campaign Detail
- [ ] **Header** - Title, status badge, actions
- [ ] **Stats Cards** - Enrollments, submissions, spend
- [ ] **Tabs** - Overview, Deliverables, Settings
- [ ] **Deliverables Tab** - List of required deliverables
- [ ] **Settings Tab** - Edit campaign settings

#### 4.3 Campaign Create (Multi-step Wizard)
- [ ] **Step 1: Basic Info** - Product selection, title, type
- [ ] **Step 2: Schedule** - Start/end dates, max enrollments
- [ ] **Step 3: Deliverables** - Add/remove deliverables
- [ ] **Step 4: Review** - Summary before submission
- [ ] **Save Draft** - Save without submitting
- [ ] **Submit for Approval** - Submit to admin

---

### Phase 5: Enrollments Module (2-3 days)

#### 5.1 Enrollments List
- [ ] **Status Tabs** - All, Awaiting Review, Approved, Rejected
- [ ] **Campaign Filter** - Filter by campaign
- [ ] **Search** - Search by order ID, shopper
- [ ] **Data Table** - TanStack Table with sorting, pagination
- [ ] **Bulk Actions** - Bulk approve/reject
- [ ] **Overdue Alert** - Highlight overdue enrollments
- [ ] **View Toggle** - List/compact view

#### 5.2 Enrollment Detail
- [ ] **Header** - Order ID, status, actions
- [ ] **Shopper Info** - Avatar, name, contact
- [ ] **Order Details** - Value, date, campaign
- [ ] **Submissions** - Deliverable submissions with images
- [ ] **Actions** - Approve, Reject, Request Changes
- [ ] **Timeline** - Status transition history

---

### Phase 6: Products Module (2 days)

#### 6.1 Products List
- [ ] **Grid/List View** - Toggle between views
- [ ] **Category Filter** - Filter by category
- [ ] **Search** - Search by name, SKU
- [ ] **Product Cards** - Image, name, price, campaigns count
- [ ] **Bulk Import** - CSV/Excel import

#### 6.2 Product Detail
- [ ] **Image Gallery** - Multiple product images
- [ ] **Details** - Name, description, price, SKU
- [ ] **Campaigns** - Associated campaigns list
- [ ] **Edit/Delete** - Actions

#### 6.3 Product Create/Edit
- [ ] **Form** - Name, description, brand, category, platform
- [ ] **Image Upload** - Drag & drop, multiple images
- [ ] **Price & SKU** - Numeric inputs
- [ ] **Product Link** - URL validation

---

### Phase 7: Secondary Features (3-4 days)

#### 7.1 Invoices Module
- [ ] **List** - Date filters, status badges
- [ ] **Detail** - Line items, totals
- [ ] **PDF Download** - Generate and download

#### 7.2 Wallet Module
- [ ] **Balance Card** - Available, held, credit
- [ ] **Transactions List** - Credits, debits, holds
- [ ] **Add Funds** - Payment flow
- [ ] **Withdrawal** - Request withdrawal
- [ ] **Credit Request** - Request credit increase

#### 7.3 Team Module
- [ ] **Members List** - Avatar, name, role, status
- [ ] **Invite Member** - Email, role selection
- [ ] **Role Management** - Update member roles
- [ ] **Remove Member** - Confirmation modal
- [ ] **Invitations** - Pending invitations list

#### 7.4 Settings Module
- [ ] **Organization Profile** - Name, description, logo
- [ ] **Business Details** - Contact, address
- [ ] **Bank Account** - Add/edit bank details
- [ ] **Notifications** - Preferences

---

### Phase 8: Polish & Integration (2-3 days)

#### 8.1 UI/UX Refinements
- [ ] Loading skeletons for all pages
- [ ] Empty states with illustrations
- [ ] Error boundaries
- [ ] Toast notifications
- [ ] Responsive design testing
- [ ] Dark mode support

#### 8.2 Advanced Features
- [ ] Global search (RefineKbar)
- [ ] Keyboard shortcuts
- [ ] Export to CSV/Excel
- [ ] Bulk actions

#### 8.3 Performance
- [ ] Code splitting
- [ ] Image optimization
- [ ] Bundle analysis
- [ ] Lighthouse audit (target: 90+)

---

## 📊 Constants & Configuration

### Status Configurations

```typescript
// lib/constants.ts

// Campaign Statuses
export const CAMPAIGN_STATUSES = [
  "draft", "pending_approval", "rejected", "approved", "active",
  "paused", "ended", "expired", "completed", "cancelled", "archived"
] as const;

export const CAMPAIGN_STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "pending_approval", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

// Enrollment Statuses
export const ENROLLMENT_STATUSES = [
  "awaiting_submission", "awaiting_review", "changes_requested",
  "approved", "permanently_rejected", "withdrawn", "expired"
] as const;

export const ENROLLMENT_STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "awaiting_review", label: "Pending Review" },
  { value: "approved", label: "Approved" },
  { value: "permanently_rejected", label: "Rejected" },
];

// Business Types
export const BUSINESS_TYPE_OPTIONS = [
  { value: "pvt_ltd", label: "Private Limited" },
  { value: "public_ltd", label: "Public Limited" },
  { value: "llp", label: "LLP" },
  { value: "partnership", label: "Partnership" },
  { value: "proprietorship", label: "Proprietorship" },
  { value: "trust", label: "Trust" },
  { value: "society", label: "Society" },
  { value: "other", label: "Other" },
];

// Industry Categories
export const INDUSTRY_CATEGORY_OPTIONS = [
  { value: "electronics", label: "Electronics" },
  { value: "fashion", label: "Fashion & Apparel" },
  { value: "fmcg", label: "FMCG" },
  { value: "beauty", label: "Beauty & Personal Care" },
  { value: "home_appliances", label: "Home Appliances" },
  { value: "sports", label: "Sports & Fitness" },
  { value: "automotive", label: "Automotive" },
  { value: "other", label: "Other" },
];

// Campaign Types
export const CAMPAIGN_TYPE_OPTIONS = [
  { value: "cashback", label: "Cashback", description: "Shoppers get cashback on purchase" },
  { value: "barter", label: "Barter", description: "Shoppers get free product" },
  { value: "hybrid", label: "Hybrid", description: "Combination of cashback and barter" },
];

// Deliverable Types
export const DELIVERABLE_TYPE_OPTIONS = [
  { value: "order_screenshot", label: "Order Screenshot" },
  { value: "delivery_photo", label: "Delivery Photo" },
  { value: "product_review", label: "Product Review" },
  { value: "social_media_post", label: "Social Media Post" },
  { value: "unboxing_video", label: "Unboxing Video" },
  { value: "custom", label: "Custom" },
];

// Role Options
export const ROLE_OPTIONS = [
  { value: "owner", label: "Owner", description: "Full access to all features" },
  { value: "admin", label: "Admin", description: "Manage team and settings" },
  { value: "member", label: "Member", description: "View and manage campaigns" },
];
```

### Query Configuration

```typescript
// lib/query-config.ts

export const STALE_TIME = {
  REALTIME: 30 * 1000,      // 30 seconds
  SHORT: 60 * 1000,         // 1 minute
  MEDIUM: 5 * 60 * 1000,    // 5 minutes
  LONG: 10 * 60 * 1000,     // 10 minutes
};

export const PAGE_SIZE = {
  DEFAULT: 10,
  SMALL: 20,
  MEDIUM: 50,
  LARGE: 100,
};

export const DEFAULT_RETRY_CONFIG = {
  retry: 2,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
};
```

### Routes Configuration

```typescript
// lib/routes.ts

export const routes = {
  auth: {
    signIn: "/login",
    signUp: "/register",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    verifyEmail: "/verify-email",
  },
  dashboard: {
    root: "/",
    home: (tenantId: string) => `/${tenantId}`,
    campaigns: {
      list: (tenantId: string) => `/${tenantId}/campaigns`,
      create: (tenantId: string) => `/${tenantId}/campaigns/create`,
      detail: (tenantId: string, id: string) => `/${tenantId}/campaigns/${id}`,
      edit: (tenantId: string, id: string) => `/${tenantId}/campaigns/${id}/edit`,
    },
    enrollments: {
      list: (tenantId: string) => `/${tenantId}/enrollments`,
      detail: (tenantId: string, id: string) => `/${tenantId}/enrollments/${id}`,
    },
    products: {
      list: (tenantId: string) => `/${tenantId}/products`,
      create: (tenantId: string) => `/${tenantId}/products/create`,
      detail: (tenantId: string, id: string) => `/${tenantId}/products/${id}`,
    },
    invoices: (tenantId: string) => `/${tenantId}/invoices`,
    wallet: (tenantId: string) => `/${tenantId}/wallet`,
    team: (tenantId: string) => `/${tenantId}/team`,
    settings: (tenantId: string) => `/${tenantId}/settings`,
  },
  onboarding: {
    root: "/onboarding",
    pending: "/onboarding/pending",
    banned: "/onboarding/banned",
  },
};
```

---

## ✅ Acceptance Criteria

### Functional Requirements
- [ ] User can login/logout/register
- [ ] User can complete onboarding wizard with GST verification
- [ ] User can switch between organizations (tenants)
- [ ] All CRUD operations work for campaigns
- [ ] Multi-step campaign creation wizard works
- [ ] Enrollments can be viewed and bulk approved/rejected
- [ ] Products can be created, edited, and bulk imported
- [ ] Invoices can be viewed and downloaded as PDF
- [ ] Wallet balance and transactions are displayed
- [ ] Team members can be invited and managed
- [ ] Settings can be updated
- [ ] Data is properly filtered by tenant

### Non-Functional Requirements
- [ ] Page load < 2 seconds
- [ ] Lighthouse performance > 90
- [ ] No TypeScript errors
- [ ] Responsive on mobile/tablet/desktop
- [ ] WCAG 2.1 AA compliant
- [ ] Bundle size < 500KB (gzipped)

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run typecheck

# Lint
npm run lint
```

---

## 📚 References

- [Refine v5 Documentation](https://refine.dev/docs)
- [Catalyst UI Kit](https://catalyst.tailwindui.com)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [React Router v7](https://reactrouter.com)
- [TanStack Table](https://tanstack.com/table)
- [Zod Validation](https://zod.dev)
- [Headless UI](https://headlessui.com)

# Hypedrive Brand Dashboard - Refine v5 Rebuild Plan

## Project Overview

**Goal:** Rebuild the Hypedrive Brand influencer marketing platform using Vite + Tailwind CSS + Catalyst UI + Refine v5 + Custom Multitenancy with Encore.dev backend.

**Source Project:** `C:\Users\Shivam Gupta\Downloads\BACKEND+FRONTEND\Hypedrive Brand` (Next.js 15 + Encore)
**Target Project:** `c:\Users\Shivam Gupta\Downloads\catalyst-ui-kit\catalyst-ui-kit\demo\typescript\hypedrive-brand`

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vite + React 19 + TypeScript |
| UI | Catalyst UI (Headless UI) + Tailwind CSS v4 |
| Admin Framework | Refine v5 (headless mode) |
| Routing | React Router v7 |
| Tables | TanStack React Table + @refinedev/react-table |
| Forms | React Hook Form + @refinedev/react-hook-form |
| Backend | Encore.dev (existing) |
| Auth | Cookie-based sessions via Encore auth service |
| Multitenancy | Custom provider (organization-based) |

---

## Phase 1: Setup Encore Client

### Encore Client (ALREADY EXISTS)
```
Location: src/lib/api-client.ts (Encore v1.53.4 generated client)
Services: admin, auth, campaigns, coupons, enrollments, integrations,
          notifications, organizations, platforms, products, shared,
          shoppers, storage, wallets, webhooks
```

### Create Encore Client Singleton
**File:** `src/lib/encore-client.ts`

```typescript
import Client, { Local, Environment } from "./api-client";

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.PROD) return Environment("production");
  return Local;
};

export const encoreClient = new Client(getBaseUrl(), {
  requestInit: {
    credentials: "include", // Cookie-based auth
    mode: "cors",
  },
});
```

### Environment Variables
**File:** `.env.local`
```
VITE_API_URL=http://localhost:4000
```

---

## Phase 2: Encore Data Provider

### Create Resource Mapping
**File:** `src/providers/resource-mapping.ts`

Define how Refine resources map to Encore API:

| Resource | Service | List Method | Get Method | Create | Update | Delete |
|----------|---------|-------------|------------|--------|--------|--------|
| campaigns | organizations | listCampaigns | getCampaign | createCampaign | updateCampaign | deleteCampaign |
| enrollments | organizations | listOrganizationEnrollments | getEnrollmentById | - | - | - |
| products | organizations | listOrganizationProducts | getOrganizationProduct | createProduct | updateProduct | deleteProduct |
| invoices | organizations | listInvoices | getInvoice | - | - | - |
| wallet | organizations | getOrganizationWalletTransactions | getOrganizationWallet | - | - | - |
| team | auth | listMembersAuth | - | - | - | - |
| deliverables | campaigns | listDeliverables | getDeliverable | - | - | - |

### Create Data Provider
**File:** `src/providers/encore-data-provider.ts`

Key implementation points:
1. `getList()` - Convert Refine pagination (current/pageSize) to Encore (skip/take)
2. `getOne()` - Pass organizationId from meta.tenantId
3. `create/update/delete` - All scoped to organization
4. `custom()` - Handle special operations (status changes, bulk actions)

### Custom Operations via custom() method
```typescript
// Status changes
"/campaigns/:id/pause" → organizations.pauseCampaign
"/campaigns/:id/resume" → organizations.resumeCampaign
"/campaigns/:id/activate" → organizations.activateCampaign
"/campaigns/:id/end" → organizations.endCampaign

// Bulk operations
"/enrollments/batch" → organizations.batchEnrollments

// Dashboard
"/dashboard" → organizations.getDashboardOverview

// Wallet
"/wallet/fund" → organizations.fundOrganizationWallet
"/wallet/withdraw" → organizations.createOrganizationWithdrawal
```

---

## Phase 3: Auth Provider

### Create Auth Provider
**File:** `src/providers/auth-provider.ts`

| Method | Encore API | Notes |
|--------|------------|-------|
| login | auth.signInEmail | Handle 2FA redirect |
| logout | auth.signOut | Clear session |
| check | auth.getSession | Validate cookie session |
| getIdentity | auth.getSession → user | Return user info |
| getPermissions | auth.getPermissions | CASL rules |
| register | auth.signUpEmail | Redirect to onboarding |
| forgotPassword | auth.forgotPassword | Send reset email |
| updatePassword | auth.resetPassword / changePassword | Handle both cases |
| onError | - | 401 → logout, 403 → show error |

### Two-Factor Auth Flow
1. Login returns `twoFactorRedirect: true` + `twoFactorToken`
2. Store token in sessionStorage
3. Redirect to `/two-factor`
4. User enters TOTP/OTP/backup code
5. Verify via `auth.twoFactorVerifyTotp`
6. On success, fetch organizations and redirect

---

## Phase 4: Update Multitenancy

### Update fetchTenants
**File:** `src/App.tsx`

```typescript
const fetchTenants = async () => {
  const { organizations } = await encoreClient.auth.listOrganizations();

  const tenants = organizations.map((org) => ({
    id: org.id,
    name: org.name,
    logo: org.logo || org.name.charAt(0),
  }));

  const me = await encoreClient.auth.me();
  const activeOrg = tenants.find((t) => t.id === me.activeOrganizationId);

  return { tenants, defaultTenant: activeOrg || tenants[0] };
};
```

### Update setTenant
When switching organizations, also call:
```typescript
await encoreClient.auth.setActiveOrganization({ organizationId: newTenant.id });
```

---

## Phase 5: Route Configuration

### Auth Routes (No tenant prefix)
```
/login                    → LoginPage
/register                 → RegisterPage
/forgot-password          → ForgotPasswordPage
/reset-password/:token    → ResetPasswordPage
/two-factor               → TwoFactorPage (NEW)
/verify                   → VerifyEmailPage (NEW)
```

### Protected Routes (Organization-scoped)
```
/:organizationId                      → DashboardPage
/:organizationId/campaigns            → CampaignListPage
/:organizationId/campaigns/create     → CampaignCreatePage
/:organizationId/campaigns/:id        → CampaignShowPage
/:organizationId/campaigns/:id/edit   → CampaignEditPage
/:organizationId/enrollments          → EnrollmentListPage
/:organizationId/enrollments/:id      → EnrollmentShowPage
/:organizationId/products             → ProductListPage
/:organizationId/products/new         → ProductCreatePage
/:organizationId/products/:id         → ProductShowPage
/:organizationId/products/:id/edit    → ProductEditPage
/:organizationId/invoices             → InvoiceListPage
/:organizationId/invoices/:id         → InvoiceShowPage
/:organizationId/wallet               → WalletPage
/:organizationId/team                 → TeamPage
/:organizationId/settings             → SettingsPage
```

### Refine Resources Array
```typescript
resources: [
  { name: "dashboard", list: "/:organizationId" },
  { name: "campaigns", list: "/:organizationId/campaigns", create: "/:organizationId/campaigns/create", show: "/:organizationId/campaigns/:id", edit: "/:organizationId/campaigns/:id/edit" },
  { name: "enrollments", list: "/:organizationId/enrollments", show: "/:organizationId/enrollments/:id" },
  { name: "products", list: "/:organizationId/products", create: "/:organizationId/products/new", show: "/:organizationId/products/:id", edit: "/:organizationId/products/:id/edit" },
  { name: "invoices", list: "/:organizationId/invoices", show: "/:organizationId/invoices/:id" },
  { name: "wallet", list: "/:organizationId/wallet" },
  { name: "team", list: "/:organizationId/team" },
  { name: "settings", list: "/:organizationId/settings" },
]
```

---

## Phase 6: Page Implementation

### Dashboard Page
**File:** `src/pages/dashboard/index.tsx`

Components:
- 4 Stat cards (Balance, Pending Enrollments, Approval Rate, Active Campaigns)
- Campaign performance section
- Enrollment trend chart
- Priority queue
- Quick actions

Data hooks:
```typescript
useCustom({ url: "/dashboard", method: "get", meta: { tenantId } })
useList({ resource: "campaigns", filters: [{ field: "status", operator: "eq", value: "active" }] })
```

### Campaign List Page
**File:** `src/pages/campaigns/list.tsx`

Features:
- Search input
- Status filter tabs (all, draft, active, paused, completed, archived)
- Data table with columns: Image, Title, Status, Type, Dates, Enrollments, Actions
- Create button
- Pagination

Hook:
```typescript
const { tableProps } = useTable({
  resource: "campaigns",
  pagination: { pageSize: 10 },
  sorters: { initial: [{ field: "createdAt", order: "desc" }] },
});
```

### Campaign Create Page
**File:** `src/pages/campaigns/create.tsx`

Multi-step wizard:
1. Basic Info (title, description, type)
2. Products (select from organization products)
3. Deliverables (add deliverable requirements)
4. Pricing & Schedule (dates, max enrollments, payout config)
5. Review & Submit

Hook:
```typescript
const { formProps, saveButtonProps } = useForm({
  resource: "campaigns",
  action: "create",
  redirect: "show",
});
```

### Campaign Show Page
**File:** `src/pages/campaigns/show.tsx`

Tabs:
- Overview (status, dates, stats)
- Products (linked products)
- Deliverables (requirements list)
- Performance (charts)
- Enrollments (mini table)

Hook:
```typescript
const { result, query } = useShow({ resource: "campaigns", id });
```

### Enrollment List Page
**File:** `src/pages/enrollments/list.tsx`

Features:
- Status filter tabs
- Campaign filter dropdown
- Search by creator name
- Bulk approve/reject buttons
- Table with: Creator (avatar, name), Campaign, Status, Deadline, Value, Actions

Bulk action:
```typescript
const { mutate } = useCustomMutation();
mutate({ url: "/enrollments/batch", method: "post", values: { action: "approve", ids: selectedIds } });
```

### Enrollment Show Page
**File:** `src/pages/enrollments/show.tsx`

Sections:
- Creator info card
- Campaign info
- Deliverables status table
- Approval workflow (Approve/Reject buttons with dialog)
- Timeline/history

### Products Pages
**Files:** `src/pages/products/{list,create,show,edit}.tsx`

List: Grid view with product cards (image, name, price, campaign count)
Create/Edit: Form with image upload, category select, pricing fields
Show: Product details with associated campaigns

### Invoices Page
**File:** `src/pages/invoices/list.tsx`

Table columns: Invoice #, Period, Amount, GST, Status, Actions
Actions: View PDF, Download, Print

### Wallet Page
**File:** `src/pages/wallet/index.tsx`

Sections:
- Balance cards (Available, Pending, Credit)
- Transaction history table
- Withdrawal requests
- Add funds / Withdraw buttons with dialogs

### Team Page
**File:** `src/pages/team/index.tsx`

Sections:
- Members table (Name, Email, Role, Joined, Actions)
- Pending invitations
- Invite member dialog

### Settings Page
**File:** `src/pages/settings/index.tsx`

Form fields:
- Organization name
- Description/bio
- Contact email
- Currency selection
- Address fields (optional)

---

## Phase 7: Sidebar Navigation Update

**File:** `src/components/app-layout.tsx`

Navigation items:
```typescript
const navItems = [
  { name: "Home", href: basePath, icon: HomeIcon },
  { name: "Campaigns", href: `${basePath}/campaigns`, icon: MegaphoneIcon },
  { name: "Enrollments", href: `${basePath}/enrollments`, icon: UserPlusIcon },
  { name: "Products", href: `${basePath}/products`, icon: ShoppingBagIcon },
  { name: "Invoices", href: `${basePath}/invoices`, icon: DocumentTextIcon },
  { name: "Wallet", href: `${basePath}/wallet`, icon: WalletIcon },
  { name: "Team", href: `${basePath}/team`, icon: UsersIcon },
  { name: "Settings", href: `${basePath}/settings`, icon: Cog6ToothIcon },
];
```

---

## File Structure (Final)

```
src/
├── lib/
│   ├── api-client.ts              # Encore generated client (COPY)
│   └── encore-client.ts           # Singleton instance (NEW)
│
├── providers/
│   ├── index.ts                   # Exports (MODIFY)
│   ├── multitenancy.tsx           # Multitenancy (EXISTS - minor update)
│   ├── data-provider.ts           # REPLACE with encore-data-provider
│   ├── encore-data-provider.ts    # Encore data provider (NEW)
│   ├── resource-mapping.ts        # Resource config (NEW)
│   └── auth-provider.ts           # Encore auth (NEW)
│
├── pages/
│   ├── auth/
│   │   ├── login.tsx              # MODIFY
│   │   ├── register.tsx           # MODIFY
│   │   ├── forgot-password.tsx    # MODIFY
│   │   ├── reset-password.tsx     # NEW
│   │   ├── two-factor.tsx         # NEW
│   │   └── layout.tsx             # EXISTS
│   │
│   ├── dashboard/
│   │   └── index.tsx              # MODIFY - use Refine hooks
│   │
│   ├── campaigns/
│   │   ├── index.ts               # Exports
│   │   ├── list.tsx               # MODIFY - useTable
│   │   ├── create.tsx             # NEW - wizard form
│   │   ├── show.tsx               # NEW - tabs
│   │   └── edit.tsx               # NEW
│   │
│   ├── enrollments/
│   │   ├── index.ts               # Exports
│   │   ├── list.tsx               # MODIFY - useTable + bulk actions
│   │   └── show.tsx               # NEW - approval workflow
│   │
│   ├── products/
│   │   ├── index.ts               # NEW
│   │   ├── list.tsx               # NEW - grid/list view
│   │   ├── create.tsx             # NEW - with image upload
│   │   ├── show.tsx               # NEW
│   │   └── edit.tsx               # NEW
│   │
│   ├── invoices/
│   │   ├── index.ts               # NEW
│   │   └── list.tsx               # NEW
│   │
│   ├── wallet/
│   │   └── index.tsx              # NEW
│   │
│   ├── team/
│   │   └── index.tsx              # NEW
│   │
│   └── settings/
│       └── index.tsx              # MODIFY - full form
│
├── components/
│   ├── app-layout.tsx             # MODIFY - new nav items
│   ├── page-header.tsx            # NEW - reusable header
│   ├── empty-state.tsx            # NEW
│   ├── loading-state.tsx          # NEW
│   └── [existing Catalyst components...]
│
├── types/
│   ├── index.ts                   # EXPAND with all entity types
│   └── encore-types.ts            # Re-export Encore types (NEW)
│
├── hooks/
│   ├── use-validate-organization.ts  # NEW
│   └── use-debounced-search.ts       # NEW
│
├── App.tsx                        # MODIFY - routes + resources
├── authProvider.ts                # REPLACE with new auth
└── index.tsx                      # EXISTS
```

---

## Implementation Order

### Week 1: Foundation
1. Copy `brand-client.ts` to `src/lib/api-client.ts`
2. Create `encore-client.ts` singleton
3. Create `resource-mapping.ts`
4. Create `encore-data-provider.ts`
5. Create `auth-provider.ts`
6. Update `App.tsx` with new providers and routes

### Week 2: Auth & Core Pages
7. Update auth pages (login, register, forgot-password)
8. Create reset-password and two-factor pages
9. Update dashboard page with Refine hooks
10. Update campaigns list with useTable
11. Create campaign show page

### Week 3: CRUD Pages
12. Create campaign create wizard
13. Create campaign edit page
14. Update enrollments list with bulk actions
15. Create enrollment show page
16. Create products pages (list, create, show, edit)

### Week 4: Remaining Pages
17. Create invoices list page
18. Create wallet page
19. Create team page
20. Update settings page
21. Update sidebar navigation
22. Testing and polish

---

## Critical Files to Modify

| File | Action | Priority |
|------|--------|----------|
| `src/App.tsx` | Update routes, resources, providers | HIGH |
| `src/providers/index.ts` | Export new providers | HIGH |
| `src/lib/api-client.ts` | Copy from source | HIGH |
| `src/authProvider.ts` | Replace with Encore auth | HIGH |
| `src/components/app-layout.tsx` | Update navigation | MEDIUM |
| `src/pages/campaigns/list.tsx` | Convert to useTable | MEDIUM |
| `src/pages/dashboard/index.tsx` | Convert to Refine hooks | MEDIUM |

---

## Testing Checklist

### Authentication
- [ ] Email/password login
- [ ] 2FA flow (TOTP, OTP, backup)
- [ ] Registration
- [ ] Password reset
- [ ] Session persistence
- [ ] Logout

### Multitenancy
- [ ] Organizations load after login
- [ ] Organization switching via dropdown
- [ ] URL reflects current organization
- [ ] Data scoped to organization

### CRUD Operations
- [ ] Campaigns: list, create, view, edit, delete
- [ ] Enrollments: list, view, approve, reject, bulk actions
- [ ] Products: list, create, view, edit, delete
- [ ] Invoices: list, view, download PDF
- [ ] Wallet: view balance, transactions
- [ ] Team: list members, invite, remove

### UI/UX
- [ ] Loading states
- [ ] Empty states
- [ ] Error handling
- [ ] Mobile responsiveness
- [ ] Dark mode (if applicable)

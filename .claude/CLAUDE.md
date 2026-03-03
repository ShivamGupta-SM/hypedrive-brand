# Hypedrive Brand Dashboard

## Project Stack

- **Framework:** TanStack Start (React 19 + Vite 7) — full-stack SSR meta-framework
- **Routing:** TanStack Router v1 (file-based, type-safe, nested)
- **Server State:** TanStack Query v5
- **Client State:** Zustand 5 (persistent auth + org stores)
- **Backend:** Encore.ts (auto-generated TypeScript client at `src/lib/brand-client.ts`)
- **UI:** Catalyst (Headless UI wrappers) + Tailwind CSS 4
- **Forms:** react-hook-form 7 + Zod 4
- **Tables:** @tanstack/react-table v8 + @tanstack/react-virtual
- **Charts:** Recharts 3
- **Toasts:** Sonner
- **Icons:** @heroicons/react (solid + outline)
- **Linting:** Biome (format + lint)

## Commands

```bash
pnpm dev          # Start dev server (also regenerates routeTree.gen.ts)
pnpm build        # Production build
pnpm start        # Run production server (node .output/server/index.mjs)
pnpm test         # Run tests (vitest)
pnpm test:watch   # Tests in watch mode
pnpm format       # Format with Biome
pnpm lint         # Lint with Biome
pnpm check        # Biome check (format + lint)
```

## File Structure

```
src/
├── routes/                    # TanStack Router file-based routes
│   ├── __root.tsx             # Root layout (html/head/body, QueryClientProvider, Toaster)
│   ├── _app.tsx               # Authenticated layout (beforeLoad auth check)
│   ├── _app/$orgSlug.tsx      # Org-scoped layout (validates org, sets context)
│   ├── _app/$orgSlug/         # Org pages: index, campaigns, enrollments, wallet, etc.
│   ├── _app/index.tsx         # Redirect to current org
│   ├── _auth.tsx              # Auth layout (login, register)
│   ├── _approval.tsx          # Pending/rejected org states
│   └── _onboarding.tsx        # New user onboarding
├── components/                # UI components (Catalyst wrappers + shared)
│   ├── shared/                # Card, EmptyState, FilterBar, StatsRow, InfoPanel, etc.
│   └── icons/                 # Platform-specific icons
├── hooks/                     # Custom React hooks (TanStack Query wrappers)
│   ├── api-client.ts          # Encore client setup, queryKeys, error utils
│   ├── index.ts               # Barrel export + useInvalidateQueries helper
│   ├── use-auth.ts            # 2FA, session, device management
│   ├── use-campaigns.ts       # Campaign CRUD
│   ├── use-enrollments.ts     # Enrollment hooks
│   ├── use-wallet.ts          # Wallet, transactions, withdrawals
│   ├── use-invoices.ts        # Invoice hooks
│   ├── use-listings.ts        # Product/listing hooks
│   ├── use-organization.ts    # Org profile, settings, activity
│   ├── use-team.ts            # Team members, invitations
│   ├── use-dashboard.ts       # Dashboard stats
│   └── use-org-slug.ts        # Get current orgSlug from route params
├── store/                     # Zustand stores (persistent)
│   ├── auth-store.ts          # Auth state, login/logout/register, cookie sync
│   ├── organization-store.ts  # Current org, org list
│   └── permissions-store.ts   # RBAC permission state
├── providers/
│   └── ability-provider.tsx   # Permission checks (Can component, useCan hook)
├── lib/
│   ├── brand-client.ts        # Auto-generated Encore SDK (DO NOT EDIT)
│   ├── server-auth.ts         # Server functions for cookie auth (get/set/clear)
│   ├── design-tokens.ts       # Typography, colors, spacing, card styles
│   └── permissions/           # Access control definitions
├── router.tsx                 # Router + QueryClient factory (getRouter)
├── client.tsx                 # Client entry point
├── server.tsx                 # SSR entry point
└── routeTree.gen.ts           # Auto-generated route tree (DO NOT EDIT)
```

---

## TanStack Start

### Vite Configuration (CRITICAL)

```typescript
// vite.config.ts — Plugin order matters!
plugins: [
  tsconfigPaths(),           // 1. Path aliases (@/ → src/)
  tanstackStart({ ... }),    // 2. MUST come BEFORE react()
  react(),                   // 3. MUST come AFTER tanstackStart()
  tailwindcss(),             // 4. Tailwind CSS
]
```

**Never** enable `verbatimModuleSyntax` in tsconfig — it leaks server bundles into client bundles.

### Code Execution Patterns (CRITICAL)

TanStack Start has three execution environments:

| Environment | Where it runs | Example |
|-------------|---------------|---------|
| **Server-only** | Server only | `createServerFn()`, `createServerOnlyFn()` |
| **Client-only** | Client only | `createClientOnlyFn()`, `useEffect`, `localStorage` |
| **Isomorphic** | Both SSR + Client | Route `loader`, `beforeLoad`, components |

**The most common mistake:** Route `loader`s are **isomorphic** — they run on the server for initial SSR but on the **CLIENT** during navigation. Never put server-only code (env vars, DB queries) directly in a loader.

```typescript
// ❌ WRONG — loader runs on client too, exposes secrets
export const Route = createFileRoute('/dashboard')({
  loader: () => {
    const secret = process.env.SECRET; // Exposed to client!
    return fetch(`/api?key=${secret}`);
  },
});

// ✅ CORRECT — wrap in createServerFn
const getData = createServerFn().handler(async () => {
  const secret = process.env.SECRET; // Server-only
  return fetch(`/api?key=${secret}`);
});

export const Route = createFileRoute('/dashboard')({
  loader: () => getData(),
});
```

### Server Functions

Server functions are created with `createServerFn()`. They run on the server but can be called from anywhere (loaders, components, hooks, event handlers). On the client, calls become `fetch` requests.

```typescript
import { createServerFn } from "@tanstack/react-start";

// Basic server function (GET by default)
export const getData = createServerFn().handler(async () => {
  return { message: "Hello from server" };
});

// POST with input validation
export const saveData = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string }) => data)
  .handler(async ({ data }) => {
    return { saved: data.name };
  });

// With Zod validation
export const createItem = createServerFn({ method: "POST" })
  .inputValidator(z.object({ name: z.string().min(1), price: z.number() }))
  .handler(async ({ data }) => {
    // data is typed and validated
  });
```

**Calling server functions:**

```typescript
// In a loader
loader: () => getData()

// In a component (wrap with useServerFn for React patterns)
const getPosts = useServerFn(getServerPosts);
const { data } = useQuery({ queryKey: ['posts'], queryFn: () => getPosts() });

// With parameters — always pass as { data: ... }
await saveData({ data: { name: "test" } });
```

**Server context utilities** (from `@tanstack/react-start/server`):

```typescript
import { getRequest, getRequestHeader, getCookie, setCookie, deleteCookie,
         setResponseHeader, setResponseHeaders, setResponseStatus } from "@tanstack/react-start/server";
```

**Redirects and errors in server functions:**

```typescript
import { redirect, notFound } from "@tanstack/react-router";

export const requireAuth = createServerFn().handler(async () => {
  const user = await getCurrentUser();
  if (!user) throw redirect({ to: "/login" });
  return user;
});

export const getPost = createServerFn()
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const post = await db.findPost(data.id);
    if (!post) throw notFound();
    return post;
  });
```

**Static imports are safe** — the build replaces server function implementations with RPC stubs in client bundles. **Avoid dynamic imports** (`await import(...)`) for server functions.

### Server Function File Organization

```
src/utils/
├── users.functions.ts   # createServerFn wrappers (safe to import anywhere)
├── users.server.ts      # Server-only helpers (DB, internal logic)
└── schemas.ts           # Shared validation schemas (client-safe)
```

### Middleware

Middleware customizes server requests and server functions. Two types:

**Request middleware** — runs for all requests (SSR, server routes, server functions):

```typescript
import { createMiddleware } from "@tanstack/react-start";

const loggingMiddleware = createMiddleware().server(async ({ next, context, request }) => {
  console.log("Request:", request.url);
  const result = await next();
  return result;
});
```

**Server function middleware** — extra features: `inputValidator`, `.client()`:

```typescript
const authMiddleware = createMiddleware({ type: "function" })
  .server(async ({ next }) => {
    const user = await getUser();
    if (!user) throw redirect({ to: "/login" });
    return next({ context: { user } }); // Pass context to downstream
  });

const fn = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    // context.user is available and typed
  });
```

**Global middleware** — create `src/start.ts`:

```typescript
import { createStart, createMiddleware } from "@tanstack/react-start";

export const startInstance = createStart(() => ({
  requestMiddleware: [loggingMiddleware],    // Every request
  functionMiddleware: [authMiddleware],      // Every server function
}));
```

**Context flow:**
- `next({ context: { ... } })` — pass context to downstream middleware
- `next({ sendContext: { ... } })` — send context across client↔server boundary (must validate!)

**Execution order:** global middleware → dependency middleware → local middleware → handler.

### Server Routes (API Endpoints)

Define HTTP endpoints using `server.handlers` on routes:

```typescript
export const Route = createFileRoute("/api/users")({
  server: {
    middleware: [authMiddleware], // Optional: applies to all handlers
    handlers: {
      GET: async ({ request, params, context }) => {
        return Response.json({ users: [] });
      },
      POST: async ({ request }) => {
        const body = await request.json();
        return Response.json({ created: body }, { status: 201 });
      },
    },
  },
  // Can ALSO have a component — same file serves API + page
  component: UsersPage,
});
```

Server routes follow the same file-naming conventions as regular routes.

---

## TanStack Router

### File Naming Conventions

Routes live in `src/routes/`. The route tree auto-generates into `routeTree.gen.ts` — **never edit it manually**.

| File | URL | Type |
|------|-----|------|
| `__root.tsx` | (always rendered) | Root layout |
| `index.tsx` | `/` | Index route |
| `about.tsx` | `/about` | Static route |
| `posts.tsx` | `/posts` | Layout route (renders children via `<Outlet />`) |
| `posts/index.tsx` | `/posts` | Index route for `/posts` |
| `posts/$postId.tsx` | `/posts/:postId` | Dynamic route |
| `posts_.$postId.tsx` | `/posts/:postId` | Flat (non-nested) dynamic route |
| `_app.tsx` | (no URL segment) | Pathless layout route |
| `_app/$orgSlug.tsx` | `/:orgSlug` | Pathless parent + dynamic child |
| `settings_.account.tsx` | `/settings/account` | Break-out from `settings` layout |
| `file/$.tsx` | `/file/*` | Wildcard/splat route |
| `my-script[.]js.tsx` | `/my-script.js` | Escaped dot |

**Key conventions:**
- `$paramName` → Dynamic segment
- `_prefix` → Pathless layout (no URL segment, but wraps children)
- `suffix_` → Break-out from parent layout nesting
- `.` (dot) → Path separator in flat file names (`posts.$postId` = `posts/$postId`)
- `-prefix` on files/folders → Ignored (for co-located non-route files)

### Route Definition

```typescript
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$orgSlug/campaigns")({
  // The path string is auto-managed by the router plugin — don't worry about it
  component: CampaignsPage,

  // Runs before loader, can redirect/provide context
  beforeLoad: ({ context, params, location }) => {
    if (!context.auth) throw redirect({ to: "/login" });
    return { someContext: "value" }; // Merged into context for children
  },

  // Data loading (isomorphic — use server functions for server-only code)
  loader: ({ params, context, deps }) => fetchCampaigns(params.orgSlug),

  // Declare deps from search params to properly key the cache
  loaderDeps: ({ search: { page } }) => ({ page }),

  // Validate search params (typed + safe)
  validateSearch: z.object({
    page: z.number().catch(1),
    filter: z.string().catch(""),
  }),

  // Document head management
  head: () => ({
    meta: [{ title: "Campaigns" }],
  }),

  // Error/pending UI
  errorComponent: ErrorPage,
  pendingComponent: LoadingSkeleton,
  pendingMs: 1000,     // Show pending after 1s (default)
  pendingMinMs: 500,   // Show pending for at least 500ms
});
```

### Root Route (this project)

Uses `createRootRouteWithContext<RouterContext>()` to pass `queryClient` and org data down:

```typescript
export interface RouterContext {
  queryClient: QueryClient;
  organization?: Organization | null;
  orgSlug?: string;
}
```

Root renders `<html>`, `<head>` with `<HeadContent />`, `<body>` with `<Scripts />`, `<QueryClientProvider>`, `<Toaster>`, and `<AbilityProvider>`.

### Navigation

```typescript
import { Link, useNavigate, useParams } from "@tanstack/react-router";

// Link component (type-safe)
<Link to="/$orgSlug/campaigns/$id" params={{ orgSlug, id: campaign.id }}>
  {campaign.name}
</Link>

// With search params
<Link to="/$orgSlug/campaigns" params={{ orgSlug }} search={{ page: 2 }}>
  Page 2
</Link>

// Programmatic navigation
const navigate = useNavigate();
navigate({ to: "/$orgSlug/campaigns", params: { orgSlug } });
navigate({ to: "..", replace: true }); // Go back, replace history

// Route-scoped params (type-safe)
const { orgSlug } = Route.useParams();
const { page } = Route.useSearch();
const data = Route.useLoaderData();
```

### Accessing Route API from deep components

```typescript
import { getRouteApi } from "@tanstack/react-router";

// Avoids circular imports — preferred over importing Route directly
const routeApi = getRouteApi("/_app/$orgSlug/campaigns");
const params = routeApi.useParams();
const search = routeApi.useSearch();
```

### Search Params

TanStack Router treats search params as **JSON-first** — supports numbers, booleans, arrays, nested objects.

```typescript
// Define with validateSearch (Zod recommended)
import { zodValidator } from "@tanstack/zod-adapter";

export const Route = createFileRoute("/_app/$orgSlug/campaigns")({
  validateSearch: zodValidator(z.object({
    page: fallback(z.number(), 1).default(1),
    filter: fallback(z.string(), "").default(""),
    sort: fallback(z.enum(["newest", "oldest"]), "newest").default("newest"),
  })),
});

// Read in components
const { page, filter, sort } = Route.useSearch();

// Update search params
navigate({ search: (prev) => ({ ...prev, page: prev.page + 1 }) });
```

**Use `loaderDeps`** to extract search params into loader deps (controls cache key):

```typescript
loaderDeps: ({ search: { page, filter } }) => ({ page, filter }),
loader: ({ deps: { page, filter } }) => fetchCampaigns({ page, filter }),
```

### Route Loading Lifecycle

1. **Route Matching** (top-down): `params.parse` → `validateSearch`
2. **Pre-Loading** (serial): `beforeLoad` → `onError`
3. **Loading** (parallel): `component.preload` + `loader` → `pendingComponent` → `component`

### Data Loading Caching

Built-in SWR cache keyed on pathname + `loaderDeps`:

| Option | Default | Description |
|--------|---------|-------------|
| `staleTime` | `0` | How long data stays fresh (ms) |
| `preloadStaleTime` | `30_000` | How long preloaded data stays fresh |
| `gcTime` | `30 min` | When unused cache is garbage collected |
| `shouldReload` | `true` | Whether to refetch on route re-match |

When using TanStack Query as external cache, set `defaultPreloadStaleTime: 0` on the router.

### Document Head Management

```typescript
// Per-route head tags — child routes override parent by name/property
export const Route = createFileRoute("/campaigns")({
  head: () => ({
    meta: [
      { title: "Campaigns - Hypedrive" },
      { name: "description", content: "Manage campaigns" },
    ],
    links: [{ rel: "canonical", href: "/campaigns" }],
  }),
});
```

Required components in root: `<HeadContent />` in `<head>`, `<Scripts />` in `<body>`.

### Authenticated Routes Pattern (this project)

Uses pathless layout `_app.tsx` with `beforeLoad` that calls a server function:

```typescript
// _app.tsx
beforeLoad: async () => {
  const { isAuthenticated } = await getServerAuth(); // Server function reads cookie
  if (!isAuthenticated) throw redirect({ to: "/login" });
},
```

Auth cookie (`hd_auth`) synced via server functions in `src/lib/server-auth.ts`:
- `getServerAuth()` — reads cookie, returns `{ isAuthenticated, token }`
- `setServerAuthCookie({ data: { token } })` — sets cookie after login
- `clearServerAuthCookie()` — deletes cookie on logout

---

## Encore API Client

### Setup

```typescript
// src/hooks/api-client.ts
import Client, { Local } from "@/lib/brand-client"; // Auto-generated — DO NOT EDIT

const API_URL = import.meta.env.VITE_API_URL || Local;
export const apiClient = new Client(API_URL);

export function getAuthenticatedClient(): Client {
  const token = getAuthToken() || getAuthTokenFromCookie();
  if (!token) return apiClient;
  return apiClient.with({
    requestInit: { headers: { Authorization: `Bearer ${token}` } },
  });
}
```

### Services

`auth`, `brand`, `catalog`, `ledger`, `admin`, `audit`, `storage`, `notifications`, `core`

```typescript
const client = getAuthenticatedClient();
await client.brand.listCampaigns({ organizationId, page, limit });
await client.brand.getCampaign({ id });
await client.auth.signInEmail({ email, password });
```

---

## TanStack Query Patterns

### Query Client Config (in router.tsx)

```typescript
staleTime: 30_000          // 30 seconds
gcTime: 5 * 60_000         // 5 minutes
retry: (count, error) => { if (401) handleAuthError(); return count < 1; }
refetchOnWindowFocus: false
```

### Query Keys (centralized in hooks/api-client.ts)

```typescript
queryKeys.campaigns(orgId, params)     // ["campaigns", orgId, params]
queryKeys.campaign(orgId, campaignId)  // ["campaigns", orgId, campaignId]
queryKeys.wallet(orgId)                // ["wallet", orgId]
queryKeys.dashboard(orgId)             // ["dashboard", orgId]
queryKeys.members(orgId)               // ["members", orgId]
// etc.
```

### Hook Patterns

```typescript
// Query hook
export function useCampaigns(orgId: string, params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.campaigns(orgId, params),
    queryFn: () => getAuthenticatedClient().brand.listCampaigns({ organizationId: orgId, ...params }),
    enabled: !!orgId,
  });
}

// Mutation hook
export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCampaignInput) =>
      getAuthenticatedClient().brand.createCampaign(data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns", vars.organizationId] });
    },
  });
}
```

### Cache Invalidation

```typescript
const { invalidateCampaigns, invalidateWallet, invalidateAll } = useInvalidateQueries();
invalidateCampaigns(orgId);
```

---

## Authentication

### Auth Store (Zustand + persist + cookie sync)

Auth state persisted in localStorage. On login/register, token also synced to an HTTP cookie via `setServerAuthCookie()` for SSR auth checks.

```typescript
const { mutate: login, isPending } = useLogin();
const { mutate: logout } = useLogout();
const { mutate: register, isPending } = useRegister();
const { mutate: forgotPassword, isPending } = useForgotPassword();
const { mutate: socialLogin, isPending } = useSocialLogin();

login({ email, password }, {
  onSuccess: () => navigate({ to: "/" }),
  onError: (error) => toast.error(error.message),
});
```

### 401 Handling

`handleAuthError()` in `auth-store.ts`: clears cookie → clears QueryClient → clears auth store.

---

## Multi-Tenancy

All app routes scoped under `/$orgSlug`. The `_app/$orgSlug.tsx` layout validates the org and sets router context.

```typescript
const { orgSlug } = useOrgSlug();
const { currentOrg, organizations } = useOrganizationStore();
```

**Org approval flow:**
- `approved` → normal access
- `draft`/`pending` → redirect to `/_approval/pending-approval`
- `rejected`/`banned` → redirect to `/_approval/rejected`

---

## RBAC

```typescript
<Can resource="campaign" action="read"><CampaignList /></Can>
const canEdit = useCan("campaign", "update");
```

---

## UI Patterns

### Design Tokens (`lib/design-tokens.ts`)

Colors: Emerald (success/revenue), Amber (warning/pending), Sky (info/processing), Red (error/rejected), Zinc (neutral).

```typescript
import { typography, statusColors, cardStyles } from "@/lib/design-tokens";
```

### Components (Catalyst / Headless UI)

Button, Dialog, Dropdown, Select, Input, Checkbox, Radio, Switch, Sidebar, SidebarLayout, AppLayout, PageHeader, Card, EmptyState, FilterBar, StatsRow, InfoPanel, Section.

### Forms

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

### Toasts

```typescript
import { toast } from "sonner";
toast.success("Campaign created");
toast.error("Something went wrong");
```

---

## Error Handling

```typescript
import { isAPIError, getAPIErrorMessage } from "@/hooks/api-client";

onError: (error) => toast.error(getAPIErrorMessage(error, "Failed to create campaign"));
```

---

## TypeScript

- Path alias: `@/` → `src/`
- `interface` for object shapes, `type` for unions
- Utility types over `any` (`Record`, `Partial`, `Pick`, `Omit`)
- ES6+ imports only, never `require()`
- Types from Encore client where possible

## Naming Conventions

- **Files:** kebab-case (`use-campaigns.ts`, `filter-bar.tsx`)
- **Components:** PascalCase (`CampaignList`, `FilterBar`)
- **Hooks:** `use` prefix camelCase (`useCampaigns`)
- **Types:** PascalCase (`Campaign`, `ListParams`)
- **Constants:** UPPER_SNAKE_CASE (`DEFAULT_PAGE_SIZE`)
- **Functions:** camelCase (`getAuthenticatedClient`)

## Git Rules

- Never `git restore` without permission
- No destructive git operations that cause data loss
- No force push to main/master

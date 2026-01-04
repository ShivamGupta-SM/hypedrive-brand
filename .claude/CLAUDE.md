# Refine.dev v5 Admin Panel

<llm_info>Generic CLAUDE.md for any Refine.dev v5 project. Copy to project root and customize project_stack section.</llm_info>

<project_stack>
- Framework: Next.js 14+ with App Router
- Admin: Refine.dev v5 (headless mode)
- Styling: Tailwind CSS
- Backend: Custom API
- Auth: Custom Auth Provider
</project_stack>

## TypeScript Style Guide

- Use interface/type for complex objects
- Prefer built-in utility types (Record, Partial, Pick) over any
- Always ES6+ syntax and import, never require
- Use built-in fetch for HTTP

## Refine v5 Breaking Changes

### Hook Return Values (CRITICAL)

| Hook | v4 Return | v5 Return |
|------|-----------|-----------|
| useList/useOne/useMany | `{ data, isLoading }` | `{ result, query: { isLoading } }` |
| useShow | `{ queryResult }` | `{ result, query }` |
| useCreate/useUpdate/useDelete | `{ mutate, isLoading }` | `{ mutate, mutation: { isPending } }` |
| useLogin/useRegister | `{ mutate, isLoading }` | `{ mutate, isPending }` (direct!) |
| useCustom | `{ data, isLoading }` | `{ result, query: { isLoading } }` |
| useCustomMutation | `{ mutate, isLoading }` | `{ mutate, mutation: { isPending } }` |
| useSelect | `{ options, queryResult }` | `{ options, query }` |
| useTable (core) | `{ tableQueryResult }` | `{ tableQuery }` |
| useForm | `{ queryResult, mutationResult }` | `{ query, mutation }` |
| useInfiniteList | `{ data, fetchNextPage }` | `{ result, query: { fetchNextPage } }` |

### Key Pattern: `result` vs `data`

```typescript
// v4
const { data, isLoading } = useList();
const products = data?.data;  // Nested

// v5 PREFERRED
const { result, query: { isLoading } } = useList();
const products = result.data;  // Cleaner
```

### Filters Format

```typescript
filters: {
  initial: [],      // Applied ONLY on first load
  permanent: [],    // ALWAYS applied - use for dynamic filters from state
}

// Dynamic filters pattern
const refineFilters = useMemo(() => {
  return filters.filter(f => f.value).map(f => ({ field: f.field, operator: f.operator, value: f.value }));
}, [filters]);
refineCoreProps: { filters: { permanent: refineFilters } }
```

### Auth vs Data Hooks Return Type

```typescript
// DATA MUTATION HOOKS - wrapped in mutation
const { mutate, mutation: { isPending } } = useCreate();

// AUTH MUTATION HOOKS - direct (NOT wrapped!)
const { mutate: login, isPending } = useLogin();
```

### Navigation

```typescript
// v5
const go = useGo();
go({ to: "/posts" });                    // push
go({ to: "/posts", type: "replace" });   // replace
// goBack: use Next.js router
import { useRouter } from "next/navigation";
router.back();
```

### Parameter Renames

| Old (v4) | New (v5) |
|----------|----------|
| metaData | meta |
| sort/sorter | sorters |
| initialSorter/permanentSorter | sorters: { initial, permanent } |
| initialFilter/permanentFilter | filters: { initial, permanent } |
| hasPagination: false | pagination: { mode: "off" } |
| initialCurrent | pagination: { currentPage } |
| setCurrent | setCurrentPage |
| queryResult | query |
| mutationResult | mutation |
| isLoading (mutations) | isPending |

### Type/Import Renames

```typescript
// v4 → v5
AuthBindings → AuthProvider
RouterBindings → RouterProvider
resources options → resources meta
ThemedLayoutV2 → ThemedLayout
```

### Removed in v5

- legacyRouterProvider, legacyAuthProvider
- v3LegacyAuthProviderCompatible flag
- Direct push, goBack, replace from useNavigation

## Data Provider

### Required Methods

- **getList**: Fetch paginated, sorted, filtered list
- **getOne**: Fetch single record by ID
- **create**: Create new record
- **update**: Update existing record
- **deleteOne**: Delete single record
- **getApiUrl**: Return API base URL

### Optional Methods

getMany, createMany, updateMany, deleteMany, custom

### Implementation

```typescript
import { DataProvider, HttpError } from "@refinedev/core";

export const dataProvider = (apiUrl: string): DataProvider => ({
  getApiUrl: () => apiUrl,
  getList: async ({ resource, pagination, sorters, filters }) => {
    const { current = 1, pageSize = 10 } = pagination ?? {};
    const query: Record<string, any> = { page: current, limit: pageSize };
    if (sorters?.length) query.sort = sorters.map(s => `${s.field}:${s.order}`).join(",");
    filters?.forEach((filter) => {
      if ("field" in filter) {
        if (filter.operator === "eq") query[filter.field] = filter.value;
        else if (filter.operator === "contains") query[`${filter.field}_like`] = filter.value;
      }
    });
    const response = await fetch(`${apiUrl}/${resource}?${new URLSearchParams(query)}`);
    const data = await response.json();
    return { data: data.items || data, total: data.total || data.length };
  },
  getOne: async ({ resource, id }) => {
    const response = await fetch(`${apiUrl}/${resource}/${id}`);
    return { data: await response.json() };
  },
  create: async ({ resource, variables }) => {
    const response = await fetch(`${apiUrl}/${resource}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(variables),
    });
    return { data: await response.json() };
  },
  update: async ({ resource, id, variables }) => {
    const response = await fetch(`${apiUrl}/${resource}/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(variables),
    });
    return { data: await response.json() };
  },
  deleteOne: async ({ resource, id }) => {
    const response = await fetch(`${apiUrl}/${resource}/${id}`, { method: "DELETE" });
    return { data: await response.json() };
  },
  custom: async ({ url, method, payload, query }) => {
    const response = await fetch(`${apiUrl}${url}?${new URLSearchParams(query)}`, {
      method, headers: { "Content-Type": "application/json" }, body: payload ? JSON.stringify(payload) : undefined,
    });
    return { data: await response.json() };
  },
});
```

## Auth Provider

### Required Methods

- **login**: returns `{ success, redirectTo?, error? }`
- **check**: returns `{ authenticated, redirectTo?, logout?, error? }`
- **logout**: returns `{ success, redirectTo? }`
- **onError**: returns `{ logout?, redirectTo?, error? }`

### Optional Methods

getIdentity, getPermissions, register, forgotPassword, updatePassword

### Implementation

```typescript
import { AuthProvider } from "@refinedev/core";

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    const response = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.token) {
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      return { success: true, redirectTo: "/" };
    }
    return { success: false, error: { name: "LoginError", message: "Invalid credentials" } };
  },
  check: async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return { authenticated: false, redirectTo: "/login", logout: true };
    return { authenticated: true };
  },
  logout: async () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    return { success: true, redirectTo: "/login" };
  },
  onError: async (error) => {
    if (error?.statusCode === 401 || error?.statusCode === 403) return { logout: true, redirectTo: "/login" };
    return {};
  },
  getIdentity: async () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
  getPermissions: async () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user).role : null;
  },
};
```

### Auth Hooks Usage

```typescript
// Auth hooks return { mutate, isPending } directly (NOT wrapped in mutation!)
const { mutate: login, isPending } = useLogin();
const { mutate: logout, isPending: isLoggingOut } = useLogout();
const { mutate: register, isPending: isRegistering } = useRegister();
const { data: authData, isLoading } = useIsAuthenticated();
const { data: identity } = useGetIdentity();
```

## Notification Provider

```typescript
import { NotificationProvider } from "@refinedev/core";
import { toast } from "react-toastify";

export const notificationProvider: NotificationProvider = {
  open: ({ key, message, type }) => {
    if (type === "success") toast.success(message, { toastId: key });
    else if (type === "error") toast.error(message, { toastId: key });
    else toast.info(message, { toastId: key });
  },
  close: (key) => toast.dismiss(key),
};
```

## Resources & Routing

### Next.js App Router Setup

```typescript
import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/nextjs-router";

const resources = [
  { name: "products", list: "/products", show: "/products/:id", edit: "/products/:id/edit", meta: { label: "Products" } },
  { name: "users", list: "/users", show: "/users/:id", create: "/users/create", meta: { label: "Users", canDelete: true } },
];

<Refine routerProvider={routerProvider} dataProvider={dataProvider(API_URL)} authProvider={authProvider} resources={resources} options={{ syncWithLocation: true }}>
  {children}
</Refine>
```

### Navigation Hooks

```typescript
import { useNavigation, useGo } from "@refinedev/core";
const { list, create, edit, show } = useNavigation();
list("products"); create("products"); edit("products", "123"); show("products", "123");

const go = useGo();
go({ to: "/custom-path", query: { search: "test" } });
```

## Data Hooks

### useList

```typescript
const { result, query: { isLoading, isError } } = useList({
  resource: "products",
  pagination: { current: 1, pageSize: 10 },
  sorters: [{ field: "createdAt", order: "desc" }],
  filters: [{ field: "status", operator: "eq", value: "active" }],
});
const products = result.data ?? [];
```

### useOne

```typescript
const { result: product, query: { isLoading } } = useOne({ resource: "products", id: "123" });
```

### useCreate/useUpdate/useDelete

```typescript
const { mutate, mutation: { isPending } } = useCreate();
mutate({ resource: "products", values: { name: "Product", price: 100 } }, {
  onSuccess: (data) => console.log("Created:", data),
  onError: (error) => console.error(error),
});

const { mutate: update } = useUpdate();
mutate({ resource: "products", id: "123", values: { name: "Updated" } });

const { mutate: remove } = useDelete();
mutate({ resource: "products", id: "123" });
```

### useCustom/useCustomMutation

```typescript
const { result, query: { isLoading } } = useCustom({ url: "/admin/stats", method: "get", config: { query: { period: "monthly" } } });

const { mutate } = useCustomMutation();
mutate({ url: "/products/123/publish", method: "post", values: { publishedAt: new Date().toISOString() } });
```

### useMany/useInfiniteList

```typescript
const { result, query: { isLoading } } = useMany({ resource: "products", ids: ["1", "2", "3"] });

const { result, query: { hasNextPage, fetchNextPage } } = useInfiniteList({ resource: "products", pagination: { pageSize: 20 } });
```

## Forms & Tables

### useForm

```typescript
const { query, mutation, onFinish, formLoading } = useForm({
  resource: "products", action: "edit", id: "123", redirect: "list",
  autoSave: { enabled: true, debounce: 2000 },
});
const product = query?.data?.data;

<form onSubmit={(e) => { e.preventDefault(); onFinish(Object.fromEntries(new FormData(e.currentTarget))); }}>
  <input name="name" defaultValue={product?.name} />
  <button disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save"}</button>
</form>
```

### useTable (core)

```typescript
const { tableQuery, currentPage, setCurrentPage, sorters, setSorters, filters, setFilters } = useTable({
  resource: "products",
  pagination: { pageSize: 10 },
  sorters: { initial: [{ field: "createdAt", order: "desc" }] },
  filters: { initial: [], permanent: [] },
  syncWithLocation: true,
});
const { data, isLoading } = tableQuery;
```

### useSelect

```typescript
const { options, query: { isLoading } } = useSelect({
  resource: "categories", optionLabel: "name", optionValue: "id",
  filters: [{ field: "status", operator: "eq", value: "active" }],
});
```

### Zod Validation

```typescript
import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(3), price: z.number().positive(), status: z.enum(["active", "inactive"]),
});

const { refineCore: { onFinish, formLoading }, register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
  refineCoreProps: { resource: "products", action: "create" },
});
```

## @refinedev/react-table v6

```typescript
import { useTable } from "@refinedev/react-table";
import { flexRender } from "@tanstack/react-table";

const { reactTable, refineCore } = useTable({
  columns,
  refineCoreProps: {
    resource: "products",
    pagination: { mode: "server" },
    filters: { permanent: refineFilters },
  },
});

const { getHeaderGroups, getRowModel, nextPage, previousPage, getCanNextPage, getCanPreviousPage } = reactTable;
const { tableQuery } = refineCore;
const isLoading = tableQuery?.isLoading;

// Render
{getHeaderGroups().map(hg => (
  <tr key={hg.id}>{hg.headers.map(h => <th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>)}</tr>
))}
{getRowModel().rows.map(row => (
  <tr key={row.id}>{row.getVisibleCells().map(cell => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>
))}
```

## Access Control

```typescript
import { AccessControlProvider } from "@refinedev/core";

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action, params }) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role === "admin") return { can: true };
    if (action === "delete") return { can: false, reason: "Only admins can delete" };
    return { can: true };
  },
};

// Usage
const { data: canEdit } = useCan({ resource: "products", action: "edit", params: { id } });
{canEdit?.can && <button>Edit</button>}
```

## Filter Operators

**Comparison:** eq, ne, lt, lte, gt, gte

**Array:** in, nin, ina, nina

**String:** contains, ncontains, containss, ncontainss, startswith, endswith

**Range:** between, nbetween

**Null:** null, nnull

**Logical:** or, and

```typescript
filters: [{ field: "status", operator: "eq", value: "active" }]
filters: [{ field: "price", operator: "gte", value: 100 }, { field: "price", operator: "lte", value: 500 }]
filters: [{ field: "category", operator: "in", value: ["electronics", "clothing"] }]
filters: [{ operator: "or", value: [{ field: "status", operator: "eq", value: "pending" }, { field: "status", operator: "eq", value: "processing" }] }]
```

## Best Practices

### Error Handling

```typescript
mutate({ resource: "products", values }, {
  onError: (error) => toast.error(error.message),
  onSuccess: () => toast.success("Created successfully"),
});
```

### Cache Invalidation

```typescript
import { useInvalidate } from "@refinedev/core";
const invalidate = useInvalidate();
invalidate({ resource: "products", invalidates: ["list", "many", "detail"] });
```

### Optimistic Updates

```typescript
const { mutate } = useUpdate({ mutationMode: "optimistic" });
const { mutate: undoable } = useUpdate({ mutationMode: "undoable", undoableTimeout: 5000 });
```

## Additional Hooks

```typescript
const apiUrl = useApiUrl();
const dataProvider = useDataProvider();
const { resource, action, id } = useResource();
const { resource, action, id, params } = useParsed();
const { result: product, query: { isLoading } } = useShow({ resource: "products", id: "123" });
const { modal: { visible, show, close }, formProps } = useModalForm({ resource: "products", action: "create" });
```

## Token Refresh Pattern

```typescript
import axios from "axios";
const axiosInstance = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use((response) => response, async (error) => {
  if (error.response?.status === 401 && !error.config._retry) {
    error.config._retry = true;
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      try {
        const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem("auth_token", data.token);
        error.config.headers.Authorization = `Bearer ${data.token}`;
        return axiosInstance(error.config);
      } catch { /* redirect to login */ }
    }
    window.location.href = "/login";
  }
  return Promise.reject(error);
});
```

## File Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx, page.tsx, login/page.tsx
│   └── [resource]/ (page.tsx, create/page.tsx, [id]/page.tsx, [id]/edit/page.tsx)
├── components/               # Shared (layout/, common/)
├── providers/                # dataProvider, authProvider, accessControlProvider, notificationProvider
├── lib/                      # api-client.ts, utils.ts
├── hooks/                    # Custom hooks
├── types/                    # TypeScript types
└── config/                   # Configuration
```

## Naming Conventions

- **Files:** Utilities camelCase, Components PascalCase, Hooks use-prefix, Types PascalCase
- **Components:** PascalCase (ProductList, UserEdit)
- **Hooks:** camelCase with "use" (useProductStats)
- **Types:** PascalCase (Product, User)
- **Constants:** UPPER_SNAKE_CASE (API_URL)
- **Functions:** camelCase (formatPrice)

## TypeScript Types

```typescript
export interface BaseRecord { id: string; createdAt: string; updatedAt: string; }
export interface Product extends BaseRecord {
  name: string; description?: string; price: number; stock: number; categoryId: string; status: "active" | "inactive" | "draft";
}
export interface User extends BaseRecord {
  email: string; name: string; avatar?: string; role: "admin" | "staff" | "customer"; status: "active" | "inactive" | "suspended";
}
export interface ListResponse<T> { data: T[]; total: number; }
export type FilterOperator = "eq" | "ne" | "lt" | "lte" | "gt" | "gte" | "contains" | "startswith" | "endswith" | "in" | "nin" | "between" | "null" | "nnull";
```

## Troubleshooting

- **Data not fetching:** Check data provider, API endpoint, auth token in headers
- **Auth not working:** Verify check() returns { authenticated: true/false }, check localStorage
- **Routing issues:** Verify routerProvider, resource paths, syncWithLocation
- **Type errors:** Check generic types useList<Product>
- **Performance:** Enable pagination, use React.memo/useCallback/useMemo, server-side pagination
- **v5 Migration:** result vs data, query vs queryResult, isPending vs isLoading, setCurrentPage vs setCurrent

## Essential Hooks Reference

useList, useOne, useCreate, useUpdate, useDelete, useForm, useTable, useSelect, useCustom, useCustomMutation, useNavigation, useGo, useInvalidate, useCan, useApiUrl, useResource, useShow, useModalForm

## HTTP Status Codes

200: Success | 201: Created | 400: Bad Request | 401: Unauthorized (logout) | 403: Forbidden | 404: Not Found | 500: Server Error

## Git Rules

- Never `git restore` without permission
- No destructive git operations that cause data loss
- No force push to main/master

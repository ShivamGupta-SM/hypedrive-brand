---
inclusion: always
---

# Refine.dev v5 Admin Panel

## Project Stack
- Framework: Next.js 14+ with App Router
- Admin: Refine.dev v5 (headless mode)
- Styling: Tailwind CSS
- Backend: Custom API
- Auth: Custom Auth Provider

---

## v5 Breaking Changes (CRITICAL)

### Hook Return Values

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
const products = data?.data;

// v5 PREFERRED
const { result, query: { isLoading } } = useList();
const products = result.data;
```

### Auth vs Data Hooks Return Type

```typescript
// DATA MUTATION HOOKS - wrapped in mutation
const { mutate, mutation: { isPending } } = useCreate();

// AUTH MUTATION HOOKS - direct (NOT wrapped!)
const { mutate: login, isPending } = useLogin();
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

---

## All Hooks Reference

| Category | Hooks |
|----------|-------|
| **Data** | `useList`, `useOne`, `useMany`, `useCreate`, `useUpdate`, `useDelete`, `useCustom`, `useCustomMutation`, `useInfiniteList`, `useDataProvider`, `useApiUrl` |
| **Form/Table** | `useForm`, `useTable`, `useSelect`, `useShow`, `useModalForm` |
| **Auth** | `useLogin`, `useLogout`, `useRegister`, `useIsAuthenticated`, `useGetIdentity`, `usePermissions`, `useForgotPassword`, `useUpdatePassword`, `useOnError` |
| **Navigation** | `useNavigation`, `useGo`, `useParsed`, `useResource`, `useLink` |
| **Access Control** | `useCan` |
| **Notification** | `useNotification` |
| **Import/Export** | `useImport`, `useExport` |
| **i18n** | `useTranslate`, `useSetLocale`, `useGetLocale`, `useTranslation` |
| **Realtime** | `useSubscription`, `usePublish` |
| **UI/Utility** | `useMenu`, `useBreadcrumb`, `useTitle`, `useModal`, `useInvalidate` |

---

## Providers

### Data Provider

**Required Methods:** getList, getOne, create, update, deleteOne, getApiUrl
**Optional Methods:** getMany, createMany, updateMany, deleteMany, custom

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

### Auth Provider

**Required Methods:** login, check, logout, onError
**Optional Methods:** getIdentity, getPermissions, register, forgotPassword, updatePassword

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

### Notification Provider

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

### Access Control Provider

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
```

### Refine Setup (Next.js App Router)

```typescript
import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/nextjs-router";

const resources = [
  { name: "products", list: "/products", show: "/products/:id", edit: "/products/:id/edit", meta: { label: "Products" } },
  { name: "users", list: "/users", show: "/users/:id", create: "/users/create", meta: { label: "Users", canDelete: true } },
];

<Refine
  routerProvider={routerProvider}
  dataProvider={dataProvider(API_URL)}
  authProvider={authProvider}
  resources={resources}
  options={{ syncWithLocation: true }}
>
  {children}
</Refine>
```

---

## Hooks Usage Examples

### Data Hooks

```typescript
// useList - Fetch paginated list
const { result, query: { isLoading, isError } } = useList({
  resource: "products",
  pagination: { current: 1, pageSize: 10 },
  sorters: [{ field: "createdAt", order: "desc" }],
  filters: [{ field: "status", operator: "eq", value: "active" }],
});
const products = result.data ?? [];
const total = result.total;

// useOne - Fetch single record
const { result, query: { isLoading } } = useOne({ resource: "products", id: "123" });
const product = result.data;

// useMany - Fetch multiple by IDs
const { result, query: { isLoading } } = useMany({ resource: "products", ids: ["1", "2", "3"] });

// useCreate
const { mutate, mutation: { isPending } } = useCreate();
mutate({ resource: "products", values: { name: "Product", price: 100 } }, {
  onSuccess: (data) => console.log("Created:", data),
  onError: (error) => console.error(error),
});

// useUpdate
const { mutate, mutation: { isPending } } = useUpdate();
mutate({ resource: "products", id: "123", values: { name: "Updated" } });

// useUpdate with optimistic/undoable
const { mutate } = useUpdate({ mutationMode: "optimistic" });
const { mutate } = useUpdate({ mutationMode: "undoable", undoableTimeout: 5000 });

// useDelete
const { mutate, mutation: { isPending } } = useDelete();
mutate({ resource: "products", id: "123" });

// useCustom - Custom GET
const { result, query: { isLoading } } = useCustom({
  url: "/admin/stats",
  method: "get",
  config: { query: { period: "monthly" } }
});

// useCustomMutation - Custom POST/PUT/PATCH/DELETE
const { mutate, mutation: { isPending } } = useCustomMutation();
mutate({ url: "/products/123/publish", method: "post", values: { publishedAt: new Date().toISOString() } });

// useInfiniteList - Infinite scroll
const { result, query: { hasNextPage, fetchNextPage, isFetchingNextPage } } = useInfiniteList({
  resource: "products",
  pagination: { pageSize: 20 }
});
```

### Auth Hooks

```typescript
// useLogin
const { mutate: login, isPending } = useLogin();
login({ email: "user@example.com", password: "password123" });

// useLogout
const { mutate: logout, isPending } = useLogout();
logout();

// useRegister
const { mutate: register, isPending } = useRegister();
register({ email: "new@example.com", password: "pass", name: "New User" });

// useIsAuthenticated
const { data, isLoading } = useIsAuthenticated();
if (data?.authenticated) { /* logged in */ }

// useGetIdentity
const { data: identity, isLoading } = useGetIdentity();

// usePermissions
const { data: permissions, isLoading } = usePermissions();

// useForgotPassword
const { mutate: forgotPassword, isPending } = useForgotPassword<{ email: string }>();
forgotPassword({ email: "user@example.com" });

// useUpdatePassword
const { mutate: updatePassword, isPending } = useUpdatePassword<{ password: string; confirmPassword: string }>();
updatePassword({ password: "newPass", confirmPassword: "newPass" });
```

### Navigation Hooks

```typescript
// useNavigation
const { list, create, edit, show, clone } = useNavigation();
list("products");           // /products
create("products");         // /products/create
edit("products", "123");    // /products/123/edit
show("products", "123");    // /products/123

// useGo
const go = useGo();
go({ to: "/posts" });
go({ to: "/posts", type: "replace" });
go({ to: "/products", query: { search: "test", page: 1 } });

// useParsed
const { resource, action, id, params, pathname } = useParsed();

// useResource
const { resource, action, id } = useResource();
```

### Other Hooks

```typescript
// useCan - Access control
const { data: canEdit } = useCan({ resource: "products", action: "edit", params: { id: "123" } });
{canEdit?.can && <button>Edit</button>}

// useNotification
const { open, close } = useNotification();
open({ key: "unique-key", type: "success", message: "Created successfully" });

// useExport
const { triggerExport, isLoading } = useExport({
  resource: "products",
  mapData: (item) => ({ id: item.id, name: item.name, price: item.price }),
});

// useImport
const { inputProps, isLoading } = useImport({
  resource: "products",
  mapData: (item) => ({ name: item.name, price: Number(item.price) }),
});

// useTranslate
const translate = useTranslate();
<h1>{translate("pages.products.title")}</h1>

// useMenu
const { menuItems, selectedKey } = useMenu();

// useBreadcrumb
const { breadcrumbs } = useBreadcrumb();

// useInvalidate
const invalidate = useInvalidate();
invalidate({ resource: "products", invalidates: ["list", "many", "detail"] });
```

---

## Forms & Tables

### useForm

```typescript
const { query, mutation, onFinish, formLoading } = useForm({
  resource: "products",
  action: "edit",  // "create" | "edit" | "clone"
  id: "123",
  redirect: "list",  // "list" | "show" | "edit" | false
  autoSave: { enabled: true, debounce: 2000 },
});

const product = query?.data?.data;

<form onSubmit={(e) => {
  e.preventDefault();
  onFinish(Object.fromEntries(new FormData(e.currentTarget)));
}}>
  <input name="name" defaultValue={product?.name} />
  <button disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save"}</button>
</form>
```

### useForm with React Hook Form + Zod

```typescript
import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(3),
  price: z.number().positive(),
  status: z.enum(["active", "inactive"]),
});

const {
  refineCore: { onFinish, formLoading },
  register,
  handleSubmit,
  formState: { errors }
} = useForm({
  resolver: zodResolver(schema),
  refineCoreProps: { resource: "products", action: "create" },
});

<form onSubmit={handleSubmit(onFinish)}>
  <input {...register("name")} />
  {errors.name && <span>{errors.name.message}</span>}
  <button disabled={formLoading}>Submit</button>
</form>
```

### useTable (Core)

```typescript
const {
  tableQuery,
  currentPage, setCurrentPage,
  pageSize, setPageSize,
  sorters, setSorters,
  filters, setFilters,
  pageCount
} = useTable({
  resource: "products",
  pagination: { pageSize: 10 },
  sorters: { initial: [{ field: "createdAt", order: "desc" }] },
  filters: { initial: [], permanent: [] },
  syncWithLocation: true,
});

const { data, isLoading } = tableQuery;
```

### useTable with TanStack Table

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

const { getHeaderGroups, getRowModel, nextPage, previousPage } = reactTable;
const { tableQuery } = refineCore;
```

### useSelect

```typescript
const { options, query: { isLoading } } = useSelect({
  resource: "categories",
  optionLabel: "name",
  optionValue: "id",
  filters: [{ field: "status", operator: "eq", value: "active" }],
  defaultValue: ["1", "2"],
});

<select>
  {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
</select>
```

### useShow

```typescript
const { result, query: { isLoading } } = useShow({ resource: "products", id: "123" });
const product = result.data;
```

### useModalForm

```typescript
const {
  modal: { visible, show, close },
  formProps
} = useModalForm({ resource: "products", action: "create" });

<button onClick={() => show()}>Create Product</button>
<Modal visible={visible} onClose={close}>
  <form {...formProps}>{/* fields */}</form>
</Modal>
```

---

## Filter Operators

| Category | Operators |
|----------|-----------|
| **Comparison** | `eq`, `ne`, `lt`, `lte`, `gt`, `gte` |
| **Array** | `in`, `nin`, `ina`, `nina` |
| **String** | `contains`, `ncontains`, `containss`, `ncontainss`, `startswith`, `endswith` |
| **Range** | `between`, `nbetween` |
| **Null** | `null`, `nnull` |
| **Logical** | `or`, `and` |

```typescript
// Examples
filters: [{ field: "status", operator: "eq", value: "active" }]
filters: [{ field: "price", operator: "gte", value: 100 }, { field: "price", operator: "lte", value: 500 }]
filters: [{ field: "category", operator: "in", value: ["electronics", "clothing"] }]
filters: [{
  operator: "or",
  value: [
    { field: "status", operator: "eq", value: "pending" },
    { field: "status", operator: "eq", value: "processing" }
  ]
}]
```

### Filters Format

```typescript
// Initial vs Permanent
filters: {
  initial: [],      // Applied ONLY on first load
  permanent: [],    // ALWAYS applied - use for dynamic filters
}

// Dynamic filters pattern
const refineFilters = useMemo(() => {
  return filters.filter(f => f.value).map(f => ({ field: f.field, operator: f.operator, value: f.value }));
}, [filters]);

refineCoreProps: { filters: { permanent: refineFilters } }
```

---

## TypeScript Types

```typescript
export interface BaseRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product extends BaseRecord {
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
  status: "active" | "inactive" | "draft";
}

export interface User extends BaseRecord {
  email: string;
  name: string;
  avatar?: string;
  role: "admin" | "staff" | "customer";
  status: "active" | "inactive" | "suspended";
}

export interface ListResponse<T> {
  data: T[];
  total: number;
}

export type FilterOperator =
  | "eq" | "ne" | "lt" | "lte" | "gt" | "gte"
  | "contains" | "startswith" | "endswith"
  | "in" | "nin" | "between" | "null" | "nnull";
```

---

## Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/page.tsx
│   └── [resource]/
│       ├── page.tsx          # List
│       ├── create/page.tsx   # Create
│       ├── [id]/
│       │   ├── page.tsx      # Show
│       │   └── edit/page.tsx # Edit
├── components/
│   ├── layout/
│   └── common/
├── providers/
│   ├── dataProvider.ts
│   ├── authProvider.ts
│   ├── accessControlProvider.ts
│   └── notificationProvider.ts
├── lib/
│   ├── api-client.ts
│   └── utils.ts
├── hooks/
├── types/
└── config/
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files (utilities) | camelCase | `formatPrice.ts` |
| Files (components) | PascalCase | `ProductList.tsx` |
| Files (hooks) | camelCase with use- | `useProductStats.ts` |
| Components | PascalCase | `ProductList`, `UserEdit` |
| Hooks | camelCase with use | `useProductStats` |
| Types/Interfaces | PascalCase | `Product`, `User` |
| Constants | UPPER_SNAKE_CASE | `API_URL` |
| Functions | camelCase | `formatPrice` |

---

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
const invalidate = useInvalidate();
invalidate({ resource: "products", invalidates: ["list", "many", "detail"] });
```

### Token Refresh Pattern

```typescript
import axios from "axios";
const axiosInstance = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
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
  }
);
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Data not fetching | Check data provider, API endpoint, auth token in headers |
| Auth not working | Verify `check()` returns `{ authenticated: true/false }`, check localStorage |
| Routing issues | Verify routerProvider, resource paths, syncWithLocation |
| Type errors | Add generic types: `useList<Product>` |
| Performance issues | Enable pagination, use React.memo/useCallback/useMemo, server-side pagination |
| v5 Migration | `result` vs `data`, `query` vs `queryResult`, `isPending` vs `isLoading`, `setCurrentPage` vs `setCurrent` |

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized (trigger logout) |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

---

## Git Rules

- Never `git restore` without permission
- No destructive git operations that cause data loss

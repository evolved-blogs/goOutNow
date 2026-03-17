# GoOutNow Frontend

A modern, scalable React frontend built with Vite, TypeScript, and the TanStack ecosystem.

## 🏗️ Architecture

### Feature-Based Structure

```
src/
├── features/                    # Feature modules
│   └── posts/
│       ├── components/          # Feature-specific components
│       │   ├── CreatePostForm.tsx
│       │   ├── NearbyPostsList.tsx
│       │   └── PostCard.tsx
│       ├── api.ts               # API calls (fetch)
│       ├── hooks.ts             # TanStack Query hooks
│       ├── forms.ts             # Form schemas & validation
│       └── types.ts             # TypeScript types
│
├── shared/                      # Shared/reusable code
│   ├── components/              # Shared components
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── select.tsx
│   ├── hooks/                   # Shared hooks
│   └── utils/                   # Utility functions
│       └── cn.ts
│
├── routes/                      # TanStack Router routes
│   ├── __root.tsx              # Root layout
│   ├── index.tsx               # Home page (nearby posts)
│   └── create.tsx              # Create post page
│
├── lib/                         # Library configuration
│   ├── api-config.ts           # API endpoints
│   └── query-client.ts         # TanStack Query config
│
├── main.tsx                     # Application entry
└── index.css                    # Global styles
```

## 🎯 Clean Architecture Principles

### 1. **Separation of Concerns**

- **API Layer** (`api.ts`): Pure fetch calls, no React
- **Hooks Layer** (`hooks.ts`): TanStack Query wrappers
- **Components**: Pure presentation, no business logic
- **Forms** (`forms.ts`): Validation schemas separated

### 2. **Single Responsibility**

- Each component has ONE job
- API functions handle ONE endpoint
- Hooks wrap ONE query/mutation

### 3. **Type Safety**

- Strict TypeScript mode
- All functions typed
- No `any` types
- Shared type definitions

## 📚 Library Usage

### TanStack Query (Server State)

```typescript
// hooks.ts - Wraps all API calls
export function useNearbyPosts(params: NearbyPostsParams) {
  return useQuery({
    queryKey: postKeys.nearby(params),
    queryFn: () => fetchNearbyPosts(params),
  });
}

export function useCreatePost() {
  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}
```

### TanStack Router (Routing)

```typescript
// routes/index.tsx
export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  return <NearbyPostsList />;
}
```

### TanStack Form (Forms)

```typescript
// forms.ts - Schema definition
export const createPostSchema = z.object({
  title: z.string().min(3),
  latitude: z.number().min(-90).max(90),
  // ...
});

// CreatePostForm.tsx - Form usage
const form = useForm({
  defaultValues: DEFAULT_FORM_VALUES,
  onSubmit: async ({ value }) => {
    await createPostMutation.mutateAsync(value);
  },
  validatorAdapter: zodValidator(),
});
```

## 🚀 Features

### 1. Create Post

- TanStack Form with Zod validation
- Real-time validation feedback
- Optimistic UI updates
- Error handling

### 2. View Nearby Posts

- TanStack Query for data fetching
- Automatic caching (5 min stale time)
- Loading & error states
- Distance calculation display

### 3. Join Post

- Mutation with optimistic updates
- Disable after joining
- Cache invalidation
- Error handling

## 🎨 Component Patterns

### Feature Component (With Logic)

```typescript
// features/posts/components/NearbyPostsList.tsx
export function NearbyPostsList({ location, userId }: Props) {
  const { data, isLoading, error } = useNearbyPosts(location);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return <PostGrid posts={data} />;
}
```

### Shared Component (Pure UI)

```typescript
// shared/ui/button.tsx
export function Button({ variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }))}
      {...props}
    />
  );
}
```

## 🔧 Development

### Install Dependencies

```bash
cd apps/web
pnpm install
```

### Start Development Server

```bash
pnpm dev
```

Runs on `http://localhost:5173`

### Build for Production

```bash
pnpm build
```

### Type Check

```bash
pnpm type-check
```

## 📡 API Integration

### Configuration

```typescript
// lib/api-config.ts
export const API_BASE_URL = '/api';

export const API_ENDPOINTS = {
  posts: {
    list: `${API_BASE_URL}/posts`,
    nearby: (lat, lng) => `${API_BASE_URL}/posts/nearby?latitude=${lat}&longitude=${lng}`,
    join: (id) => `${API_BASE_URL}/posts/${id}/join`,
  },
};
```

### Proxy Setup

Vite dev server proxies `/api` to `http://localhost:3000`

## 🎯 Code Organization Rules

### ✅ DO:

- Keep business logic in hooks
- Use TanStack Query for ALL server state
- Validate forms with Zod schemas
- Type everything strictly
- Separate UI from logic
- Use shadcn/ui components
- Keep files small (<200 lines)

### ❌ DON'T:

- Put business logic in components
- Use inline styles (use Tailwind)
- Create custom state management
- Hardcode values
- Mix concerns
- Use `any` type

## 📦 Key Dependencies

- **React 18** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **TanStack Query** - Server state management
- **TanStack Router** - Type-safe routing
- **TanStack Form** - Form state & validation
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - UI components
- **Zod** - Schema validation
- **Lucide React** - Icons

## 🎨 Styling with Tailwind

### Utility Classes

```tsx
<div className="flex items-center gap-4 p-6 rounded-lg bg-white shadow-sm">
  <Button className="w-full" variant="default" size="lg">
    Join Activity
  </Button>
</div>
```

### Component Variants (CVA)

```typescript
const buttonVariants = cva('base-classes', {
  variants: {
    variant: {
      default: 'bg-slate-900 text-white',
      outline: 'border border-slate-300',
    },
    size: {
      default: 'h-10 px-4',
      lg: 'h-11 px-8',
    },
  },
});
```

## 🔐 Type Safety

### Strict Mode

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Shared Types

```typescript
// features/posts/types.ts
export interface Post {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  // ...
}

export interface PostWithDistance extends Post {
  distance: number;
}
```

## 🧪 Best Practices

### 1. **Component Composition**

Small, focused components that do one thing well

### 2. **Custom Hooks**

Wrap TanStack Query hooks for reusability

### 3. **Form Validation**

Define schemas separately, reuse across forms

### 4. **Error Handling**

Handle errors at query/mutation level

### 5. **Loading States**

Show feedback for all async operations

## 🚧 Future Enhancements

- [ ] Add geolocation API integration
- [ ] Add authentication
- [ ] Add real-time updates (WebSockets)
- [ ] Add map view (Google Maps)
- [ ] Add pagination for posts
- [ ] Add filters (activity type, distance)
- [ ] Add user profiles
- [ ] Add image uploads
- [ ] Add notifications
- [ ] Add mobile responsiveness improvements

## 📝 Scripts

```json
{
  "dev": "vite", // Start dev server
  "build": "tsc && vite build", // Build for production
  "preview": "vite preview", // Preview production build
  "lint": "eslint . --ext ts,tsx", // Lint code
  "type-check": "tsc --noEmit" // Type check
}
```

## 🎓 Learning Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [TanStack Router Docs](https://tanstack.com/router/latest)
- [TanStack Form Docs](https://tanstack.com/form/latest)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vite Docs](https://vitejs.dev/)

---

**Built with modern best practices, type safety, and scalability in mind.**

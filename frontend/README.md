# Frontend Scaffold

A Vite + React + TypeScript starter with Tailwind CSS, shared UI primitives, React Router, and TanStack Query integration.

## Getting Started

```bash
pnpm install
pnpm dev
```

> You can use any Node package manager. Update the commands above to match `npm` or `yarn` if you prefer.

### Environment variables

Create a `.env` file in the `frontend/` directory to configure runtime settings:

```
VITE_API_URL=https://api.example.com
```

If `VITE_API_URL` is omitted, the API client falls back to `${window.location.origin}/api`.

## Project Structure

```
frontend/
├── docs/             # Architecture and integration notes
├── public/           # Static assets served verbatim
├── src/
│   ├── components/   # Reusable UI primitives and layout shell
│   ├── hooks/        # Custom hooks (React Query helpers, etc.)
│   ├── lib/          # API client, configuration, utilities
│   ├── providers/    # Application-wide React providers
│   ├── routes/       # Route definitions & screen components
│   ├── styles/       # Tailwind entrypoint and design tokens
│   └── main.tsx      # Vite bootstrap
└── vite.config.ts
```

## Styling

Tailwind CSS is configured with opinionated design tokens (colors, spacing, typography) in `tailwind.config.ts`. Global resets and utility extensions live in `src/styles/global.css`.

Reusable primitives such as `Button`, `Input`, `Modal`, `Card`, and `DataTable` are located in `src/components/ui/`. Compose these components to maintain a consistent look and feel.

## Data Fetching & API Client

React Query powers data fetching, caching, and request lifecycle management. See `src/providers/QueryProvider.tsx` for the default configuration.

The shared API client (`src/lib/api/client.ts`) centralises authentication headers, error normalisation, and HTTPS safeguards. Additional guidance is available in [`docs/api-client.md`](./docs/api-client.md).

## Routing & Layout

Routes are defined with React Router (`src/routes/router.tsx`) and rendered via `RouterProvider` in `src/main.tsx`. The application shell lives in `src/components/layout/`, providing a responsive header, sidebar navigation, and mobile drawer.

## Scripts

- `pnpm dev` – start the Vite development server
- `pnpm build` – type-check and create an optimised production build
- `pnpm preview` – preview the production build locally
- `pnpm lint` – run ESLint with the project configuration

Feel free to tailor the scaffold to your project's needs.

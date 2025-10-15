# Patient Management Application

This project delivers a patient management workspace that integrates a React front-end with an Express API. Clinicians can search for patients, view real-time demographics, and manage patient profiles with responsive forms and optimistic updates.

## Features

- **Patient workspace** with a searchable list and detail panel.
- **Patient profile routes** for deep linking into full patient records.
- **Create/edit forms** backed by schema validation to enforce backend contract.
- **API integration** via a lightweight client and React Query for caching and optimistic updates.
- **Express API** (in-memory) for local development and manual QA.
- **Comprehensive tests** covering the primary UI flows.

## Getting Started

```bash
npm install
```

### Run the development UI

```bash
npm run dev
```

Open the application at [http://localhost:5173](http://localhost:5173).

### Start the local API

```bash
npm run server
```

The API listens on `http://localhost:4000` with routes under `/api` (for example `GET /api/patients`). The front-end defaults to this base URL.

### Run tests

```bash
npm test
```

Tests use Vitest, React Testing Library, and MSW to simulate the API.

## Project Structure

```
├── src/
│   ├── api/              # REST client abstractions
│   ├── components/       # Reusable UI building blocks
│   ├── hooks/            # React Query hooks and mutations
│   ├── pages/            # Route-level screens
│   ├── types/            # Shared TypeScript contracts
│   └── utils/            # Formatting helpers
├── server/               # Express API for local development
├── tests/                # Testing utilities and MSW handlers
└── docs/                 # End-user documentation
```

## Environment Variables

| Variable | Purpose | Default |
| -------- | ------- | ------- |
| `VITE_API_BASE_URL` | API base URL used by the client | `http://localhost:4000/api` |

## Documentation & Screenshots

Additional screenshots and workflow notes live in [`docs/patient-management.md`](docs/patient-management.md).


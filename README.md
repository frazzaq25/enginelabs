# EHR Provider Notes Monorepo

This repository hosts the services and applications that power the EHR Provider Notes platform. It is organised as a monorepo with dedicated workspaces for the backend API and frontend web client, alongside shared tooling and documentation to keep developer workflows consistent.

## Repository Layout

```
.
├── backend/           # Node.js API workspace (TypeScript)
├── frontend/          # React client workspace (TypeScript)
├── docs/              # Architecture notes and design documents
├── package.json       # Root workspace configuration and shared tooling
├── tsconfig.base.json # Shared TypeScript compiler options
└── ...                # Supporting configuration (linting, formatting, git hooks)
```

## Tech Stack

- **Language:** TypeScript
- **Backend:** Node.js (workspace `backend/`)
- **Frontend:** React (workspace `frontend/`)
- **Package manager:** npm workspaces
- **Linting & formatting:** ESLint + Prettier (shared config)
- **Git hooks:** Simple Git Hooks running `lint-staged` on commit

## Getting Started

### Prerequisites

- Node.js `>= 20.11.1` (see [`.nvmrc`](./.nvmrc))
- npm `>= 10.8` (comes with the Node version above)

Using `nvm` is recommended:

```bash
nvm install
nvm use
```

### Install dependencies

Install all workspace dependencies from the repository root:

```bash
npm install
```

This command bootstraps both workspaces and registers the pre-commit hook through `simple-git-hooks`.

### Useful commands

From the repository root:

```bash
npm run lint         # Run ESLint across the monorepo
npm run format       # Check formatting with Prettier
npm run format:write # Automatically fix formatting issues
```

Workspace-specific commands should be executed through npm workspaces. Examples:

```bash
npm run lint --workspace backend
npm run lint --workspace frontend
npm run typecheck --workspace backend
npm run typecheck --workspace frontend
```

## Environment Configuration

Each workspace includes an `.env.example` file containing the variables required for local development.

1. Copy the example file to `.env` in the corresponding workspace.
2. Adjust the values to match your local environment.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Never commit `.env` files—sensitive and machine-specific configuration should remain local.

## Contribution Guidelines

1. Create a feature branch from `main` for your work.
2. Keep changes focused and accompanied by relevant tests or documentation updates.
3. Run linting and formatting checks before committing (`npm run lint`, `npm run format`).
4. Commit messages should describe the change clearly in the imperative mood.
5. Ensure the pre-commit hook passes; it will run `lint-staged` on staged files.
6. Open a pull request that explains the change, links to any relevant context, and highlights areas that need review attention.

## Documentation

High-level architecture notes and design decisions live in the [`docs/`](./docs) directory. Add new documents or update existing ones as the platform evolves to keep the knowledge base current.

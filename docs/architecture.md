# Architecture Overview

The EHR Provider Notes platform is being developed as a modular system with clearly distinguished responsibilities:

- **Backend (`backend/`):** Hosts the API surface, domain logic, and integrations required to support provider note taking. It is authored in TypeScript targeting Node.js and will eventually expose HTTP and event-driven interfaces.
- **Frontend (`frontend/`):** Delivers the provider-facing web application. The workspace is prepared for a React + TypeScript stack and will consume backend APIs alongside authentication and analytics services.
- **Shared Tooling:** Linting, formatting, TypeScript configuration, and git hooks live at the repository root to guarantee a consistent developer experience across workspaces.

This document will grow as the implementation matures—future sections should capture decisions around data storage, deployment topologies, service boundaries, and integration points with upstream EHR vendors.

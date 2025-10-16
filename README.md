# EHR MongoDB Models

Domain models for EHR entities backed by MongoDB / Mongoose with PHI-aware encryption, validation, and HIPAA-aligned operational guidance.

## Patient Management Demo App

This repository now includes a lightweight full-stack patient management experience located in [`server/`](./server). The demo pairs an Express API backed by SQLite with a responsive React interface served directly by the Node.js process. You can use it to add, review, and delete patient records with inline validation.

### Running the demo locally

1. Install dependencies: `npm install`
2. Start the application: `npm start`
3. Visit <http://localhost:3000> to open the patient management UI.

Patient information is stored in `data/patients.db`. The database file is created automatically on first run.

### Demo highlights

- Responsive table and mobile cards with patient name, DOB, insurance, and patient ID columns
- Modal-driven patient creation with client- and server-side validation plus optional custom IDs
- Confirmation-backed deletion and success/error toasts for key actions
- REST API endpoints (`GET /api/patients`, `POST /api/patients`, `DELETE /api/patients/:id`) with structured JSON responses and error handling

## Contents

- `src/models` – Mongoose schemas for patients, documentation templates, provider notes, and audit logs.
- `src/plugins/fieldEncryption.ts` – Field-level encryption plugin wrapping AES-256-GCM with a pluggable key provider.
- `src/config/crypto.ts` – Encryption engine and environment-aware key provider abstractions.
- `src/types` – Shared TypeScript interfaces mirroring API contracts.
- `docs/data-retention-and-storage.md` – HIPAA-compliant data retention and storage guidance.

## Encryption Strategy

The repository ships with a field-level encryption plugin that can be applied to any schema path. It serializes values as JSON prior to encryption and uses AES-256-GCM to protect integrity and confidentiality. Keys are sourced via an `EncryptionKeyProvider` abstraction to simplify integration with an external KMS. By default, the `EnvironmentKeyProvider` reads a base64-encoded key from `EHR_CRYPTO_MASTER_KEY` and falls back to a generated key for non-production environments.

### Key Management

Replace the default provider with an implementation that delegates to your KMS. Providers should return the raw 32-byte key material and optional metadata describing the key alias/ARN to support rotation audits.

## Validation Overview

- **Patient** – enforces unique identifiers, validates contact formats, and ensures the primary identifier is present in the identifier collection. PII/PHI fields are encrypted automatically.
- **Template** – supports rich builder metadata, validates uniqueness of field keys, and checks that option/table fields define required configuration.
- **ProviderNote** – validates structured data against the source template (type checks, required fields, and option membership) before encryption. Sections enforce unique keys across the note.
- **AuditLog** – ensures entity references and action enumerations are valid while encrypting free-form details.

## Usage

1. Install dependencies and build the project:

   ```bash
   npm install
   npm run build
   ```

2. Configure the `EHR_CRYPTO_MASTER_KEY` environment variable with a base64-encoded 32-byte key (or swap in a custom provider).
3. Import the models or plugin as needed:

   ```ts
   import { PatientModel, ProviderNoteModel, getDefaultEncryptionEngine } from "ehr-mongo-models";
   ```

## HIPAA Retention Guidance

Operational teams should follow the recommendations in [`docs/data-retention-and-storage.md`](./docs/data-retention-and-storage.md) to align storage policies with HIPAA requirements.

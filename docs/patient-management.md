# Patient Management Experience

The patient workspace streamlines clinical workflows by pairing a responsive list view with contextual patient details. This document highlights the primary flows and includes guidance for future enhancements.

![Patient workspace preview](./screenshots/patient-workspace.png "Workspace preview placeholder")

> **Note:** Replace the placeholder screenshot above with an updated capture from the running UI when available.

## Workspace Overview

1. **Patient search & filters** – The left rail provides instant search across name, MRN, and email. Gender filtering narrows the cohort without additional navigation.
2. **Contextual detail panel** – Selecting a patient retrieves the full profile from the API, including demographics, contact information, and associated notes/templates.
3. **Create & edit flows** – Inline forms allow clinicians to register a new patient or adjust existing records. Validation mirrors the backend schema to prevent rejected submissions.
4. **Deep links** – The dedicated `/patients/:patientId` route exposes a focused patient profile for collaboration, bookmarking, or embedding.

## API Integration

- The React app relies on the Express service under `server/`.
- All requests are routed through the `src/api/client.ts` helper, which respects the `VITE_API_BASE_URL` environment variable.
- React Query powers data fetching, caching, and optimistic updates, ensuring a fluid experience while maintaining backend consistency.

## Optimistic Updates

- Creation requests immediately inject a temporary patient into all compatible caches to keep the UI feeling responsive.
- Edits apply in place with rollbacks if the API rejects the change, preserving data integrity without sacrificing speed.

## Validation Contract

| Field | Rules |
| ----- | ----- |
| First name / Last name | Required, trimmed strings |
| Date of birth | Required ISO date (yyyy-mm-dd) |
| Gender | Enum: `female`, `male`, `other`, `unknown` |
| MRN | Required text |
| Email | Optional, validated if provided |
| Phone | Optional, limited to digits and formatting characters |
| Address | Optional; if any part is provided, street, city, state, and postal code are all required |

## Testing Strategy

- **Component flows:** key views (`PatientsPage`, `PatientDetailPage`) validated using React Testing Library with MSW-powered fixtures.
- **Form validations:** `PatientForm` test ensures required-field feedback appears without backend dependencies.
- MSW handlers in `tests/mocks/handlers.ts` mimic the API contract and reset between tests for isolation.

## Future Enhancements

- Surface additional clinical data (labs, vitals) in the detail panel once backend APIs are ready.
- Introduce role-based field visibility and audit logging during edit flows.
- Extend optimistic updates to deletions or bulk actions when those endpoints become available.
- Incorporate real media assets in `docs/screenshots/` to guide onboarding and training.

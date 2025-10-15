# HIPAA-Aligned Data Retention & Storage Guidelines

The persistence layer defined in this repository supports protected health information (PHI). The following guidelines outline operational controls that must accompany the technical safeguards implemented in the EHR MongoDB schemas.

## Retention Strategy

- **Minimum necessary retention** – retain PHI only for the duration required by federal/state regulations (typically 6–10 years) and organizational policy. Configure automated archival jobs that move documents older than the retention threshold to immutable storage, followed by secure deletion from the primary database once legal requirements are met.
- **Legal holds** – introduce override flags on patients, provider notes, and audit records that suspend deletion when a legal hold is in effect. Deletion processes must respect these holds.
- **Patient-initiated restrictions** – surface API-level controls that can flag patient records for restricted processing. Downstream pipelines (analytics, training datasets, etc.) must check restriction flags before consuming data.

## Storage & Encryption Controls

- **At-rest encryption** – MongoDB volume encryption and encrypted backups are mandatory. The field-level encryption plugin implemented here ensures PHI is encrypted before it reaches the database. Storage systems must maintain separate encryption keys for volumes, backups, and field-level operations.
- **Key management** – integrate the `EncryptionKeyProvider` interface with an approved KMS (AWS KMS, GCP Cloud KMS, HashiCorp Vault). Rotate master keys at least annually, and immediately upon suspected compromise. Store key rotation metadata in an auditable system.
- **Access segmentation** – place collections containing PHI in dedicated MongoDB clusters or databases with network segmentation (VPC peering, private subnets). Ensure role-based access control limits PHI access to least privilege.
- **Backup lifecycle** – encrypt and retain backups according to retention requirements, with automated expiration policies. Backups that contain PHI must be tracked, auditable, and destroyed using NIST 800-88 compliant procedures when expired.

## Auditing & Monitoring

- **Immutable audit logs** – the `AuditLog` model is designed for write-once usage. Store audit collections in append-only storage tier or back them with a WORM-compliant archive. Never allow in-place updates to audit records except via administrative tooling that records secondary audit entries.
- **Breach detection** – monitor access patterns to sensitive collections. Trigger alerts on anomalous read/write volume, failed decryption attempts, or access from untrusted networks. Integrate with SIEM tooling for correlation.

## Disaster Recovery

- **Recovery testing** – exercise restore procedures quarterly to ensure encrypted backups can be decrypted and replayed. Validate that field-level encryption keys are available during recovery operations.
- **Geographic redundancy** – replicate MongoDB clusters and KMS keys across regions to satisfy RPO/RTO objectives without exposing keys or PHI to unauthorized jurisdictions.

Operational teams should align these practices with organizational HIPAA policies to ensure administrative, physical, and technical safeguards remain effective over time.

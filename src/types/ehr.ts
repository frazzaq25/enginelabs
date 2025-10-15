import { Types } from "mongoose";

export enum TemplateFieldType {
  Text = "text",
  RichText = "rich_text",
  Dropdown = "dropdown",
  Checkbox = "checkbox",
  Radio = "radio",
  Header = "header",
  Footer = "footer",
  Table = "table",
}

export type TemplateFieldOption = {
  value: string;
  label: string;
  description?: string;
  isDeprecated?: boolean;
};

export type TemplateFieldVisibilityCondition = {
  fieldKey: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "not_in" | "is_truthy" | "is_falsy";
  value?: unknown;
};

export type TemplateFieldBuilderMetadata = {
  modeVisibility?: Array<"builder" | "encounter" | "summary">;
  readOnly?: boolean;
  helperText?: string;
  placeholder?: string;
  group?: string;
  order?: number;
  width?: "full" | "half" | "third";
  visibilityRules?: TemplateFieldVisibilityCondition[];
};

export type TemplateTableColumn = {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "boolean" | "rich_text";
  required?: boolean;
  width?: number;
};

export type TemplateTableDefinition = {
  columns: TemplateTableColumn[];
  minRows?: number;
  maxRows?: number;
};

export type TemplateFieldBase = {
  key: string;
  label: string;
  type: TemplateFieldType;
  required?: boolean;
  description?: string;
  defaultValue?: unknown;
  metadata?: TemplateFieldBuilderMetadata;
};

export type NonValueField = TemplateFieldBase & {
  type: TemplateFieldType.Header | TemplateFieldType.Footer;
  required?: false;
};

export type TextualField = TemplateFieldBase & {
  type: TemplateFieldType.Text | TemplateFieldType.RichText;
  formatting?: {
    maxLength?: number;
    multiline?: boolean;
  };
};

export type ChoiceField = TemplateFieldBase & {
  type: TemplateFieldType.Dropdown | TemplateFieldType.Radio | TemplateFieldType.Checkbox;
  options: TemplateFieldOption[];
  allowCustomOption?: boolean;
  multiSelect?: boolean;
};

export type TableField = TemplateFieldBase & {
  type: TemplateFieldType.Table;
  table: TemplateTableDefinition;
};

export type TemplateField = NonValueField | TextualField | ChoiceField | TableField;

export interface Template {
  id: Types.ObjectId;
  slug: string;
  name: string;
  description?: string;
  version: number;
  status: "draft" | "published" | "retired";
  category?: string;
  fields: TemplateField[];
  createdBy: {
    id: string;
    displayName: string;
  };
  updatedBy?: {
    id: string;
    displayName: string;
  };
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type PatientContact = {
  email?: string;
  phone?: string;
  preferredMethod?: "phone" | "email" | "portal";
};

export type PatientAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
};

export interface PatientIdentifier {
  type: "mrn" | "ssn" | "insurance" | "custom";
  value: string;
  issuer?: string;
  expiresAt?: Date;
}

export interface Patient {
  id: Types.ObjectId;
  primaryIdentifier: string;
  identifiers: PatientIdentifier[];
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: Date;
  sexAtBirth?: "male" | "female" | "intersex" | "unknown";
  genderIdentity?: string;
  contact?: PatientContact;
  address?: PatientAddress;
  preferredLanguage?: string;
  ethnicity?: string;
  race?: string;
  maritalStatus?: string;
  status: "active" | "inactive" | "deceased";
  careTeamIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type ProviderNoteSection = {
  key: string;
  value: unknown;
  lastEditedBy?: {
    id: string;
    displayName: string;
  };
  lastEditedAt?: Date;
};

export interface ProviderNote {
  id: Types.ObjectId;
  patient: Types.ObjectId;
  template: Types.ObjectId;
  encounterId?: string;
  status: "draft" | "final" | "amended";
  encounterDate: Date;
  author: {
    id: string;
    displayName: string;
    role?: string;
  };
  coSigners?: Array<{
    id: string;
    displayName: string;
    signedAt: Date;
  }>;
  summary?: string;
  sections: ProviderNoteSection[];
  structuredData: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  lockedAt?: Date;
}

export type AuditAction = "create" | "update" | "delete" | "access" | "restore";

export interface AuditLogEntry {
  id: Types.ObjectId;
  entityType: "patient" | "template" | "provider_note" | "system";
  entityId?: Types.ObjectId;
  action: AuditAction;
  actor: {
    id: string;
    displayName: string;
    type?: "user" | "system" | "integration";
  };
  sourceIp?: string;
  userAgent?: string;
  reason?: string;
  details?: Record<string, unknown>;
  timestamp: Date;
  createdAt: Date;
}

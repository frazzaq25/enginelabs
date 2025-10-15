export type ProviderNoteStatus = 'draft' | 'submitted' | 'signed';

export type Patient = {
  id: string;
  displayName: string;
  dob: string;
  mrn: string;
};

export type TemplateFieldBase = {
  id: string;
  label: string;
  required?: boolean;
  helperText?: string;
};

type TemplateFieldWithDefault<TValue> = TemplateFieldBase & {
  defaultValue?: TValue;
};

export type TextField = TemplateFieldWithDefault<string> & {
  type: 'text' | 'textarea';
  placeholder?: string;
  maxLength?: number;
};

export type NumberField = TemplateFieldWithDefault<number | null> & {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
};

export type DateField = TemplateFieldWithDefault<string> & {
  type: 'date';
};

export type SelectField = TemplateFieldWithDefault<string> & {
  type: 'select';
  options: Array<{ label: string; value: string }>;
};

export type RichTextField = TemplateFieldWithDefault<string> & {
  type: 'richText';
};

export type TableColumn = {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date';
};

export type TableField = TemplateFieldBase & {
  type: 'table';
  columns: TableColumn[];
  minRows?: number;
};

export type TemplateField =
  | TextField
  | NumberField
  | DateField
  | SelectField
  | RichTextField
  | TableField;

export type NoteTemplate = {
  id: string;
  name: string;
  description?: string;
  fields: TemplateField[];
};

export type ProviderNote = {
  id: string;
  patientId: string;
  templateId: string;
  status: ProviderNoteStatus;
  author: string;
  createdAt: string;
  updatedAt: string;
  data: Record<string, unknown>;
};

export type ProviderNoteSummary = Pick<
  ProviderNote,
  'id' | 'status' | 'createdAt' | 'updatedAt' | 'templateId'
> & {
  templateName: string;
};

export type ProviderNoteDetail = ProviderNote & {
  templateName: string;
};

export type NoteDraftPayload = {
  patientId: string;
  templateId: string;
  values: Record<string, unknown>;
  noteId?: string;
};

export type NoteSubmitPayload = {
  noteId: string;
};

export type TemplateFormState = Record<string, unknown>;

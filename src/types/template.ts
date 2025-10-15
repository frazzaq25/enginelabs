export type FieldType = 'text' | 'richText' | 'dropdown' | 'number' | 'table' | 'date';

interface FieldBase<TType extends FieldType> {
  id: string;
  type: TType;
  label: string;
  required: boolean;
  helpText?: string;
}

export type TextField = FieldBase<'text'> & {
  placeholder?: string;
  multiline?: boolean;
};

export type RichTextField = FieldBase<'richText'> & {
  config: {
    allowBold: boolean;
    allowItalic: boolean;
    allowImages: boolean;
  };
};

export type DropdownField = FieldBase<'dropdown'> & {
  options: string[];
  allowCustom?: boolean;
};

export type NumberField = FieldBase<'number'> & {
  min?: number;
  max?: number;
  unit?: string;
};

export type TableField = FieldBase<'table'> & {
  columns: { id: string; label: string }[];
  defaultRows: number;
  allowInlineAdd?: boolean;
};

export type DateField = FieldBase<'date'> & {
  minDate?: string;
  maxDate?: string;
};

export type TemplateField =
  | TextField
  | RichTextField
  | DropdownField
  | NumberField
  | TableField
  | DateField;

export interface Template {
  id: string;
  name: string;
  description?: string;
  updatedAt: string;
  fields: TemplateField[];
}

export interface TemplateSummary {
  id: string;
  name: string;
  description?: string;
  updatedAt: string;
  fieldCount: number;
}

export type BuilderMode = 'visual' | 'form';

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

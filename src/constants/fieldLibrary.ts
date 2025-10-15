import { TemplateField } from '../types/template';
import { createId } from '../utils/id';

export interface FieldDescriptor {
  type: TemplateField['type'];
  name: string;
  description: string;
  create: () => TemplateField;
}

const createTextField = (): TemplateField => ({
  id: createId(),
  type: 'text',
  label: 'Text field',
  required: false,
  placeholder: 'Enter text',
  multiline: false
});

const createRichTextField = (): TemplateField => ({
  id: createId(),
  type: 'richText',
  label: 'Rich text',
  required: false,
  helpText: 'Supports rich formatting',
  config: {
    allowBold: true,
    allowItalic: true,
    allowImages: false
  }
});

const createDropdownField = (): TemplateField => ({
  id: createId(),
  type: 'dropdown',
  label: 'Dropdown',
  required: false,
  options: ['Option 1', 'Option 2'],
  allowCustom: false
});

const createNumberField = (): TemplateField => ({
  id: createId(),
  type: 'number',
  label: 'Number',
  required: false,
  min: 0,
  max: 100
});

const createDateField = (): TemplateField => ({
  id: createId(),
  type: 'date',
  label: 'Date',
  required: false
});

const createTableField = (): TemplateField => ({
  id: createId(),
  type: 'table',
  label: 'Table',
  required: false,
  columns: [
    { id: createId(), label: 'Column A' },
    { id: createId(), label: 'Column B' }
  ],
  defaultRows: 2,
  allowInlineAdd: true
});

export const FIELD_LIBRARY: FieldDescriptor[] = [
  {
    type: 'text',
    name: 'Text input',
    description: 'Capture free-form text with optional multiline support.',
    create: createTextField
  },
  {
    type: 'richText',
    name: 'Rich text',
    description: 'Enable formatting controls like bold, italic, and media embeds.',
    create: createRichTextField
  },
  {
    type: 'dropdown',
    name: 'Dropdown',
    description: 'Present a list of predefined options with optional custom values.',
    create: createDropdownField
  },
  {
    type: 'number',
    name: 'Number',
    description: 'Collect numeric values with validation for min/max thresholds.',
    create: createNumberField
  },
  {
    type: 'date',
    name: 'Date picker',
    description: 'Select dates with optional range constraints.',
    create: createDateField
  },
  {
    type: 'table',
    name: 'Table grid',
    description: 'Collect structured data with multi-column rows.',
    create: createTableField
  }
];

export const getDescriptorByType = (type: TemplateField['type']): FieldDescriptor | undefined =>
  FIELD_LIBRARY.find((item) => item.type === type);

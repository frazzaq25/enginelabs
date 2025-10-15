import { z } from 'zod';

export const BaseFieldSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1, 'Field label is required'),
  required: z.boolean(),
  helpText: z.string().optional()
});

const TextFieldSchema = BaseFieldSchema.extend({
  type: z.literal('text'),
  placeholder: z.string().optional(),
  multiline: z.boolean().optional()
});

const RichTextFieldSchema = BaseFieldSchema.extend({
  type: z.literal('richText'),
  config: z.object({
    allowBold: z.boolean(),
    allowItalic: z.boolean(),
    allowImages: z.boolean()
  })
});

const DropdownFieldSchema = BaseFieldSchema.extend({
  type: z.literal('dropdown'),
  options: z
    .array(z.string().min(1, 'Option label is required'))
    .min(1, 'At least one dropdown option is required'),
  allowCustom: z.boolean().optional()
});

const NumberFieldSchema = BaseFieldSchema.extend({
  type: z.literal('number'),
  min: z.number().optional(),
  max: z.number().optional(),
  unit: z.string().optional()
}).superRefine((value, ctx) => {
  if (value.min !== undefined && value.max !== undefined && value.max < value.min) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['max'],
      message: 'Maximum value must be greater than minimum value.'
    });
  }
});

const TableFieldSchema = BaseFieldSchema.extend({
  type: z.literal('table'),
  columns: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1, 'Column label is required')
      })
    )
    .min(1, 'A table requires at least one column'),
  defaultRows: z.number().int().min(0).max(100),
  allowInlineAdd: z.boolean().optional()
});

const DateFieldSchema = BaseFieldSchema.extend({
  type: z.literal('date'),
  minDate: z.string().optional(),
  maxDate: z.string().optional()
}).superRefine((value, ctx) => {
  if (value.minDate && value.maxDate && value.maxDate < value.minDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['maxDate'],
      message: 'Latest date must be after the earliest date.'
    });
  }
});

export const TemplateFieldSchema = z.discriminatedUnion('type', [
  TextFieldSchema,
  RichTextFieldSchema,
  DropdownFieldSchema,
  NumberFieldSchema,
  DateFieldSchema,
  TableFieldSchema
]);

export const TemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  updatedAt: z.string().min(1),
  fields: z.array(TemplateFieldSchema).min(1, 'At least one field is required')
});

export type TemplateValidationResult = z.infer<typeof TemplateSchema>;

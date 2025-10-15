import { HydratedDocument, InferSchemaType, Model, Schema, model } from "mongoose";
import { fieldEncryptionPlugin } from "../plugins/fieldEncryption";
import { getDefaultEncryptionEngine } from "../config/crypto";
import {
  TemplateField,
  TemplateFieldOption,
  TemplateFieldType,
  TemplateTableColumn,
  TemplateTableDefinition,
} from "../types/ehr";

const TemplateFieldOptionSchema = new Schema<TemplateFieldOption>(
  {
    value: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    description: { type: String },
    isDeprecated: { type: Boolean, default: false },
  },
  { _id: false }
);

const TemplateFieldVisibilitySchema = new Schema(
  {
    fieldKey: { type: String, required: true },
    operator: {
      type: String,
      enum: ["eq", "neq", "gt", "gte", "lt", "lte", "in", "not_in", "is_truthy", "is_falsy"],
      required: true,
    },
    value: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const TemplateFieldMetadataSchema = new Schema(
  {
    modeVisibility: {
      type: [String],
      enum: ["builder", "encounter", "summary"],
      default: ["builder", "encounter", "summary"],
    },
    readOnly: { type: Boolean, default: false },
    helperText: { type: String },
    placeholder: { type: String },
    group: { type: String },
    order: { type: Number },
    width: { type: String, enum: ["full", "half", "third"] },
    visibilityRules: { type: [TemplateFieldVisibilitySchema], default: void 0 },
  },
  { _id: false }
);

const TemplateTableColumnSchema = new Schema<TemplateTableColumn>(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ["text", "number", "date", "boolean", "rich_text"], default: "text" },
    required: { type: Boolean, default: false },
    width: { type: Number },
  },
  { _id: false }
);

const TemplateTableDefinitionSchema = new Schema<TemplateTableDefinition>(
  {
    columns: {
      type: [TemplateTableColumnSchema],
      validate: {
        validator(value: TemplateTableColumn[]) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "Table fields must define at least one column",
      },
    },
    minRows: { type: Number, min: 0 },
    maxRows: { type: Number },
  },
  { _id: false }
);

const TemplateFieldSchema = new Schema<TemplateField>(
  {
    key: { type: String, required: true, lowercase: true, trim: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(TemplateFieldType),
      required: true,
    },
    required: { type: Boolean, default: false },
    description: { type: String },
    defaultValue: { type: Schema.Types.Mixed },
    metadata: { type: TemplateFieldMetadataSchema },
    options: { type: [TemplateFieldOptionSchema], default: void 0 },
    allowCustomOption: { type: Boolean, default: false },
    multiSelect: { type: Boolean, default: false },
    formatting: {
      type: new Schema(
        {
          maxLength: { type: Number, min: 0 },
          multiline: { type: Boolean, default: false },
        },
        { _id: false }
      ),
      default: void 0,
    },
    table: { type: TemplateTableDefinitionSchema, default: void 0 },
  },
  { _id: false, minimize: false }
);

const TemplateSchema = new Schema(
  {
    slug: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    version: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ["draft", "published", "retired"], default: "draft", index: true },
    category: { type: String },
    fields: {
      type: [TemplateFieldSchema],
      validate: {
        validator(value: TemplateField[]) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "Templates must define at least one field",
      },
    },
    createdBy: {
      id: { type: String, required: true },
      displayName: { type: String, required: true },
    },
    updatedBy: {
      id: { type: String },
      displayName: { type: String },
    },
    publishedAt: { type: Date },
  },
  { timestamps: true, minimize: false }
);

TemplateSchema.index({ slug: 1, version: -1 }, { unique: true });
TemplateSchema.index({ status: 1, category: 1 });

TemplateSchema.pre("validate", function (next) {
  const fieldKeys = new Set<string>();
  for (const field of this.fields ?? []) {
    if (fieldKeys.has(field.key)) {
      return next(new Error(`Duplicate template field key: ${field.key}`));
    }
    fieldKeys.add(field.key);

    if (
      (field.type === TemplateFieldType.Dropdown ||
        field.type === TemplateFieldType.Radio ||
        field.type === TemplateFieldType.Checkbox) &&
      (!field.options || field.options.length === 0)
    ) {
      return next(new Error(`Choice field ${field.key} must provide at least one option`));
    }

    if (field.type === TemplateFieldType.Table && !field.table) {
      return next(new Error(`Table field ${field.key} must include a table definition`));
    }
  }
  next();
});

TemplateSchema.plugin(fieldEncryptionPlugin, {
  engine: getDefaultEncryptionEngine(),
  fields: [
    { path: "createdBy.displayName", dataType: "string" },
    { path: "updatedBy.displayName", dataType: "string" },
  ],
});

export type TemplateModelAttributes = InferSchemaType<typeof TemplateSchema>;

export type TemplateDocument = HydratedDocument<TemplateModelAttributes>;
export type TemplateModelType = Model<TemplateModelAttributes>;

export const TemplateModel = model<TemplateModelAttributes, TemplateModelType>("Template", TemplateSchema);

import { HydratedDocument, InferSchemaType, Model, Schema, Types, model } from "mongoose";
import { fieldEncryptionPlugin } from "../plugins/fieldEncryption";
import { getDefaultEncryptionEngine } from "../config/crypto";
import { ProviderNoteSection, TemplateFieldType } from "../types/ehr";
import { TemplateModel } from "./template";

const ProviderNoteSectionSchema = new Schema<ProviderNoteSection>(
  {
    key: { type: String, required: true },
    value: { type: Schema.Types.Mixed },
    lastEditedBy: {
      id: { type: String },
      displayName: { type: String },
    },
    lastEditedAt: { type: Date },
  },
  { _id: false, minimize: false }
);

const ProviderNoteSchema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    template: { type: Schema.Types.ObjectId, ref: "Template", required: true, index: true },
    encounterId: { type: String, index: true },
    status: { type: String, enum: ["draft", "final", "amended"], default: "draft", index: true },
    encounterDate: { type: Date, required: true, index: true },
    author: {
      id: { type: String, required: true },
      displayName: { type: String, required: true },
      role: { type: String },
    },
    coSigners: [
      new Schema(
        {
          id: { type: String, required: true },
          displayName: { type: String, required: true },
          signedAt: { type: Date, required: true },
        },
        { _id: false }
      ),
    ],
    summary: { type: String },
    sections: { type: [ProviderNoteSectionSchema], default: [] },
    structuredData: {
      type: Schema.Types.Mixed,
      default: () => ({}),
    },
    lockedAt: { type: Date },
    tags: { type: [String], default: [] },
  },
  { timestamps: true, minimize: false }
);

ProviderNoteSchema.index({ patient: 1, encounterDate: -1 });
ProviderNoteSchema.index({ template: 1, status: 1 });
ProviderNoteSchema.index({ "author.id": 1, encounterDate: -1 });

ProviderNoteSchema.pre("validate", { document: true, query: false }, async function (next) {
  const shouldValidateSections = this.isNew || this.isModified("sections");
  if (shouldValidateSections) {
    const sectionKeys = new Set<string>();
    for (const section of this.sections ?? []) {
      if (sectionKeys.has(section.key)) {
        return next(new Error(`Duplicate section key detected: ${section.key}`));
      }
      sectionKeys.add(section.key);
    }
  }

  const shouldValidateStructured = this.isNew || this.isModified("structuredData") || this.isModified("template");
  if (!shouldValidateStructured) {
    return next();
  }

  if (!this.template) {
    return next(new Error("Provider note requires a template reference"));
  }

  const structured = (this.structuredData ?? {}) as Record<string, unknown>;

  const template = await TemplateModel.findById(this.template).lean();
  if (!template) {
    return next(new Error("Template referenced by provider note does not exist"));
  }

  const fieldMap = new Map(template.fields.map((field) => [field.key, field]));

  for (const key of Object.keys(structured)) {
    if (!fieldMap.has(key)) {
      return next(new Error(`Structured data contains unknown field key: ${key}`));
    }
  }

  for (const field of template.fields) {
    const value = structured[field.key];
    if (field.required) {
      const isEmpty =
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "") ||
        (Array.isArray(value) && value.length === 0);
      if (isEmpty) {
        return next(new Error(`Field ${field.key} is required by template ${template.slug}`));
      }
    }

    if (value === undefined || value === null) {
      continue;
    }

    switch (field.type) {
      case TemplateFieldType.Text:
      case TemplateFieldType.RichText: {
        if (typeof value !== "string") {
          return next(new Error(`Field ${field.key} must be a string`));
        }
        break;
      }
      case TemplateFieldType.Dropdown:
      case TemplateFieldType.Radio: {
        if (typeof value !== "string") {
          return next(new Error(`Field ${field.key} must resolve to a single option`));
        }
        const optionValues = (field.options ?? []).map((option) => option.value);
        if (!optionValues.includes(value)) {
          return next(new Error(`Value for field ${field.key} is not an allowed option`));
        }
        break;
      }
      case TemplateFieldType.Checkbox: {
        if (!Array.isArray(value)) {
          return next(new Error(`Field ${field.key} must provide an array of selected options`));
        }
        const optionValues = (field.options ?? []).map((option) => option.value);
        const invalid = value.find((entry) => !optionValues.includes(entry));
        if (invalid) {
          return next(new Error(`Field ${field.key} contains an invalid checkbox option: ${invalid}`));
        }
        break;
      }
      case TemplateFieldType.Table: {
        if (!Array.isArray(value)) {
          return next(new Error(`Table field ${field.key} must be an array of rows`));
        }
        if (field.table?.minRows && value.length < field.table.minRows) {
          return next(new Error(`Table field ${field.key} must include at least ${field.table.minRows} rows`));
        }
        if (field.table?.maxRows && value.length > field.table.maxRows) {
          return next(new Error(`Table field ${field.key} exceeds the maximum rows of ${field.table.maxRows}`));
        }
        break;
      }
      case TemplateFieldType.Header:
      case TemplateFieldType.Footer: {
        if (value !== undefined && value !== null && value !== "") {
          return next(new Error(`Structural field ${field.key} should not store values`));
        }
        break;
      }
      default:
        break;
    }
  }

  next();
});

ProviderNoteSchema.plugin(fieldEncryptionPlugin, {
  engine: getDefaultEncryptionEngine(),
  fields: [
    { path: "summary", dataType: "string" },
    { path: "sections", dataType: "array" },
    { path: "structuredData", dataType: "object" },
  ],
});

export type ProviderNoteAttributes = InferSchemaType<typeof ProviderNoteSchema> & {
  patient: Types.ObjectId;
  template: Types.ObjectId;
};

export type ProviderNoteDocument = HydratedDocument<ProviderNoteAttributes>;
export type ProviderNoteModelType = Model<ProviderNoteAttributes>;

export const ProviderNoteModel = model<ProviderNoteAttributes, ProviderNoteModelType>("ProviderNote", ProviderNoteSchema);

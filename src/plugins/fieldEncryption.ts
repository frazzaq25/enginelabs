import { Model, Schema, Types } from "mongoose";
import { EncryptedFieldValue, FieldEncryptionEngine, isEncryptedFieldValue } from "../config/crypto";

type PrimitiveCast = "string" | "number" | "boolean" | "date" | "object" | "array" | "any";

export interface EncryptionFieldConfig {
  path: string;
  dataType?: PrimitiveCast;
}

export interface EncryptionPluginOptions {
  fields: Array<string | EncryptionFieldConfig>;
  engine: FieldEncryptionEngine;
}

type DocumentLocals = Record<string, unknown> & { __decryptedFields?: Set<string> };

type SupportedDocument = {
  get(path: string): any;
  set(path: string, value: unknown, options?: any): void;
  isModified(path: string): boolean;
  markModified(path: string): void;
  $locals?: DocumentLocals;
};

const castDecrypted = (raw: unknown, dataType: PrimitiveCast | undefined) => {
  if (!dataType || dataType === "any") {
    return raw;
  }

  if (raw === null || raw === undefined) {
    return raw;
  }

  switch (dataType) {
    case "string":
      return typeof raw === "string" ? raw : String(raw);
    case "number":
      return typeof raw === "number" ? raw : Number(raw);
    case "boolean":
      return typeof raw === "boolean" ? raw : Boolean(raw);
    case "date":
      return raw instanceof Date ? raw : new Date(raw as string);
    case "array":
      return Array.isArray(raw) ? raw : [raw];
    case "object":
      return typeof raw === "object" ? raw : { value: raw };
    default:
      return raw;
  }
};

const normalizeFields = (fields: Array<string | EncryptionFieldConfig>): EncryptionFieldConfig[] => {
  return fields.map((entry) => (typeof entry === "string" ? { path: entry } : entry));
};

const isMongooseDocument = (doc: unknown): doc is SupportedDocument => {
  return !!doc && typeof doc === "object" && typeof (doc as SupportedDocument).get === "function";
};

const setLocalsFlag = (doc: SupportedDocument, field: string) => {
  if (!doc.$locals) {
    doc.$locals = {} as DocumentLocals;
  }
  const locals = doc.$locals as DocumentLocals;
  let decryptedFields = locals.__decryptedFields;
  if (!decryptedFields) {
    decryptedFields = new Set<string>();
    locals.__decryptedFields = decryptedFields;
  }
  decryptedFields.add(field);
};

const wasDecrypted = (doc: SupportedDocument, field: string) => {
  if (!doc.$locals) {
    return false;
  }
  const locals = doc.$locals as DocumentLocals;
  const decryptedFields = locals.__decryptedFields;
  return decryptedFields?.has(field) ?? false;
};

const encryptValue = async (
  doc: SupportedDocument,
  field: EncryptionFieldConfig,
  engine: FieldEncryptionEngine
) => {
  const current = doc.get(field.path);
  if (current === undefined || current === null) {
    return;
  }

  if (isEncryptedFieldValue(current)) {
    return;
  }

  const encrypted = await engine.encrypt(current, { dataType: field.dataType });
  doc.set(field.path, encrypted, { strict: false });
  doc.markModified(field.path);
};

const decryptValue = async (
  doc: SupportedDocument,
  field: EncryptionFieldConfig,
  engine: FieldEncryptionEngine
) => {
  const current = doc.get(field.path);
  if (!isEncryptedFieldValue(current)) {
    return;
  }

  const decrypted = await engine.decrypt(current);
  doc.set(field.path, castDecrypted(decrypted, field.dataType), { strict: false });
  setLocalsFlag(doc, field.path);
};

const encryptUpdateObject = async (
  update: Record<string, any>,
  fields: EncryptionFieldConfig[],
  engine: FieldEncryptionEngine
) => {
  const applyEncryption = async (container: Record<string, any>) => {
    for (const field of fields) {
      if (container[field.path] === undefined || container[field.path] === null) {
        continue;
      }
      if (isEncryptedFieldValue(container[field.path])) {
        continue;
      }
      container[field.path] = await engine.encrypt(container[field.path], { dataType: field.dataType });
    }
  };

  if (update.$set) {
    await applyEncryption(update.$set);
  }
  if (update.$setOnInsert) {
    await applyEncryption(update.$setOnInsert);
  }
  if (update.$push) {
    await applyEncryption(update.$push);
  }
  if (update.$addToSet) {
    await applyEncryption(update.$addToSet);
  }
  await applyEncryption(update);
};

export const fieldEncryptionPlugin = (schema: Schema, options: EncryptionPluginOptions) => {
  const engine = options.engine;
  const fields = normalizeFields(options.fields);

  schema.pre("save", { document: true, query: false }, async function () {
    if (!isMongooseDocument(this)) {
      return;
    }
    for (const field of fields) {
      if (this.isModified(field.path) || wasDecrypted(this, field.path)) {
        await encryptValue(this, field, engine);
      }
    }
  });

  schema.pre("validate", { document: true, query: false }, async function () {
    if (!isMongooseDocument(this)) {
      return;
    }
    for (const field of fields) {
      if ((this.isModified(field.path) || wasDecrypted(this, field.path)) && this.get(field.path) !== undefined) {
        await encryptValue(this, field, engine);
      }
    }
  });

  const decryptPostHook = async (result: any) => {
    if (Array.isArray(result)) {
      await Promise.all(result.map((doc) => decryptPostHook(doc)));
      return;
    }
    if (!isMongooseDocument(result)) {
      return;
    }
    for (const field of fields) {
      await decryptValue(result, field, engine);
    }
  };

  schema.post("init", decryptPostHook);
  schema.post("save", decryptPostHook);
  schema.post("find", decryptPostHook);
  schema.post("findOne", decryptPostHook);
  schema.post("findOneAndUpdate", decryptPostHook);
  schema.post("updateOne", decryptPostHook);

  schema.pre("findOneAndUpdate", async function () {
    const update = this.getUpdate();
    if (!update) {
      return;
    }
    await encryptUpdateObject(update as Record<string, any>, fields, engine);
    this.setUpdate(update);
  });

  schema.pre("updateOne", async function () {
    const update = this.getUpdate();
    if (!update) {
      return;
    }
    await encryptUpdateObject(update as Record<string, any>, fields, engine);
    this.setUpdate(update);
  });

  schema.method("decryptSensitiveFields", async function () {
    const doc = this as SupportedDocument;
    await Promise.all(fields.map((field) => decryptValue(doc, field, engine)));
  });

  schema.static("withDecrypted", async function <T>(this: Model<T & { decryptSensitiveFields: () => Promise<void> }>,
    query: any) {
    const doc = await this.findOne(query);
    if (doc && typeof (doc as any).decryptSensitiveFields === "function") {
      await (doc as any).decryptSensitiveFields();
    }
    return doc;
  });
};

export type EncryptedDocument<T> = T & {
  decryptSensitiveFields: () => Promise<void>;
  _id: Types.ObjectId;
};

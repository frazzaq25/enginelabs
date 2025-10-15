import { HydratedDocument, InferSchemaType, Model, Schema, model } from "mongoose";
import { fieldEncryptionPlugin } from "../plugins/fieldEncryption";
import { getDefaultEncryptionEngine } from "../config/crypto";
import { PatientAddress, PatientContact, PatientIdentifier } from "../types/ehr";

const IdentifierSchema = new Schema<PatientIdentifier>(
  {
    type: {
      type: String,
      enum: ["mrn", "ssn", "insurance", "custom"],
      required: true,
    },
    value: { type: String, required: true, trim: true },
    issuer: { type: String },
    expiresAt: { type: Date },
  },
  { _id: false }
);

const ContactSchema = new Schema<PatientContact>(
  {
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email address is invalid"],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9+\-()\s]+$/, "Phone number contains invalid characters"],
    },
    preferredMethod: { type: String, enum: ["phone", "email", "portal"] },
  },
  { _id: false }
);

const AddressSchema = new Schema<PatientAddress>(
  {
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String },
  },
  { _id: false }
);

const PatientSchema = new Schema(
  {
    primaryIdentifier: { type: String, required: true, trim: true, unique: true },
    identifiers: {
      type: [IdentifierSchema],
      default: [],
      validate: {
        validator(identifiers: PatientIdentifier[]) {
          const seen = new Set<string>();
          for (const identifier of identifiers) {
            const key = `${identifier.type}:${identifier.value}`;
            if (seen.has(key)) {
              return false;
            }
            seen.add(key);
          }
          return true;
        },
        message: "Patient identifiers must be unique",
      },
    },
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    sexAtBirth: { type: String, enum: ["male", "female", "intersex", "unknown"] },
    genderIdentity: { type: String },
    contact: { type: ContactSchema },
    address: { type: AddressSchema },
    preferredLanguage: { type: String },
    ethnicity: { type: String },
    race: { type: String },
    maritalStatus: { type: String },
    status: { type: String, enum: ["active", "inactive", "deceased"], default: "active", index: true },
    careTeamIds: { type: [String], default: [] },
  },
  { timestamps: true, minimize: false }
);

PatientSchema.index({ lastName: 1, firstName: 1, dateOfBirth: 1 });
PatientSchema.index({ status: 1 });

PatientSchema.pre("validate", function (next) {
  if (this.identifiers?.length) {
    const matchesPrimary = this.identifiers.some((identifier) => identifier.value === this.primaryIdentifier);
    if (!matchesPrimary) {
      return next(new Error("Primary identifier must also be included in the identifiers collection"));
    }
  }
  next();
});

PatientSchema.plugin(fieldEncryptionPlugin, {
  engine: getDefaultEncryptionEngine(),
  fields: [
    { path: "firstName", dataType: "string" },
    { path: "middleName", dataType: "string" },
    { path: "lastName", dataType: "string" },
    { path: "dateOfBirth", dataType: "date" },
    { path: "contact.email", dataType: "string" },
    { path: "contact.phone", dataType: "string" },
    { path: "address", dataType: "object" },
    { path: "identifiers", dataType: "array" },
  ],
});

export interface PatientMethods {
  toPublicJSON(): Record<string, unknown>;
}

export type PatientAttributes = InferSchemaType<typeof PatientSchema>;

export type PatientDocument = HydratedDocument<PatientAttributes, PatientMethods>;

export type PatientModelType = Model<PatientAttributes, Record<string, never>, PatientMethods>;

PatientSchema.methods.toPublicJSON = function (this: PatientDocument) {
  const obj = this.toObject({ virtuals: true });
  delete obj.identifiers;
  return obj;
};

export const PatientModel = model<PatientAttributes, PatientModelType>("Patient", PatientSchema);

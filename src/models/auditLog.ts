import { HydratedDocument, InferSchemaType, Model, Schema, Types, model } from "mongoose";
import { fieldEncryptionPlugin } from "../plugins/fieldEncryption";
import { getDefaultEncryptionEngine } from "../config/crypto";

const AuditLogSchema = new Schema(
  {
    entityType: {
      type: String,
      required: true,
      enum: ["patient", "template", "provider_note", "system"],
      index: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: ["create", "update", "delete", "access", "restore"],
      index: true,
    },
    actor: {
      id: { type: String, required: true },
      displayName: { type: String, required: true },
      type: { type: String, enum: ["user", "system", "integration"], default: "user" },
    },
    sourceIp: { type: String },
    userAgent: { type: String },
    reason: { type: String },
    details: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: () => new Date(), index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, minimize: false }
);

AuditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });
AuditLogSchema.index({ "actor.id": 1, timestamp: -1 });
AuditLogSchema.index({ timestamp: -1 });

AuditLogSchema.pre("validate", function (next) {
  if (this.entityType !== "system" && !this.entityId) {
    return next(new Error("Audit log entries for domain entities must include an entityId"));
  }
  next();
});

AuditLogSchema.plugin(fieldEncryptionPlugin, {
  engine: getDefaultEncryptionEngine(),
  fields: [
    { path: "details", dataType: "object" },
  ],
});

export type AuditLogAttributes = InferSchemaType<typeof AuditLogSchema> & {
  entityId?: Types.ObjectId;
};

export type AuditLogDocument = HydratedDocument<AuditLogAttributes>;
export type AuditLogModelType = Model<AuditLogAttributes>;

export const AuditLogModel = model<AuditLogAttributes, AuditLogModelType>("AuditLog", AuditLogSchema);

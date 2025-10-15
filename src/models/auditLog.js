const { Schema, model } = require('mongoose');

const AuditLogSchema = new Schema(
  {
    userId: { type: String, default: 'anonymous' },
    userEmail: { type: String, default: null },
    method: { type: String, required: true },
    route: { type: String, required: true },
    operation: { type: String, enum: ['READ', 'WRITE'], required: true },
    statusCode: { type: Number, required: true },
    durationMs: { type: Number },
    details: {
      requestBody: { type: Schema.Types.Mixed },
      query: { type: Schema.Types.Mixed },
      params: { type: Schema.Types.Mixed }
    }
  },
  {
    timestamps: true
  }
);

module.exports = model('AuditLog', AuditLogSchema);

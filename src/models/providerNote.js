const { Schema, model } = require('mongoose');

const ProviderNoteSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    templateId: { type: Schema.Types.ObjectId, ref: 'Template' },
    content: { type: String, required: true }
  },
  {
    timestamps: true
  }
);

module.exports = model('ProviderNote', ProviderNoteSchema);

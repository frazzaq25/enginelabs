const { Schema, model } = require('mongoose');

const TemplateSchema = new Schema(
  {
    name: { type: String, required: true },
    body: { type: String, required: true }
  },
  {
    timestamps: true
  }
);

module.exports = model('Template', TemplateSchema);

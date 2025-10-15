const { Schema, model } = require('mongoose');

const PatientSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    dateOfBirth: { type: String, required: true }
  },
  {
    timestamps: true
  }
);

module.exports = model('Patient', PatientSchema);

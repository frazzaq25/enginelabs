const Patient = require('../models/patient');
const AppError = require('../errors/AppError');
const { encryptFields, decryptFields } = require('../utils/encryption');

const PATIENT_FIELDS = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth'];

function normalizePatientPayload(payload = {}) {
  const normalized = {};

  PATIENT_FIELDS.forEach((field) => {
    if (payload[field] !== undefined && payload[field] !== null) {
      if (field === 'dateOfBirth') {
        normalized[field] = new Date(payload[field]).toISOString();
      } else {
        normalized[field] = payload[field];
      }
    }
  });

  return normalized;
}

function formatDecryptedPatient(rawDocument) {
  if (!rawDocument) {
    return null;
  }

  const doc = rawDocument.toObject ? rawDocument.toObject() : rawDocument;
  const decrypted = decryptFields(doc, PATIENT_FIELDS);

  return {
    id: doc._id.toString(),
    firstName: decrypted.firstName || null,
    lastName: decrypted.lastName || null,
    email: decrypted.email || null,
    phone: decrypted.phone || null,
    dateOfBirth: decrypted.dateOfBirth || null,
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : null,
    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : null
  };
}

async function createPatient(payload) {
  const normalized = normalizePatientPayload(payload);
  const encrypted = encryptFields(normalized, PATIENT_FIELDS);
  const patient = await Patient.create(encrypted);
  return formatDecryptedPatient(patient);
}

async function listPatients() {
  const patients = await Patient.find().sort({ createdAt: 1 });
  return patients.map((patient) => formatDecryptedPatient(patient));
}

async function getPatientById(id) {
  const patient = await Patient.findById(id);

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  return formatDecryptedPatient(patient);
}

async function updatePatient(id, payload) {
  const patient = await Patient.findById(id);

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  const normalized = normalizePatientPayload(payload);

  if (!Object.keys(normalized).length) {
    throw new AppError('No updatable fields provided', 400);
  }

  const encryptedUpdates = encryptFields(normalized, PATIENT_FIELDS);
  Object.assign(patient, encryptedUpdates);
  await patient.save();

  return formatDecryptedPatient(patient);
}

async function deletePatient(id) {
  const patient = await Patient.findById(id);

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  await patient.deleteOne();
}

module.exports = {
  createPatient,
  listPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  formatDecryptedPatient
};

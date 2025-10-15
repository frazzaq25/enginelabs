const ProviderNote = require('../models/providerNote');
const Patient = require('../models/patient');
const Template = require('../models/template');
const AppError = require('../errors/AppError');
const { encryptFields, decryptFields } = require('../utils/encryption');

const NOTE_FIELDS = ['content'];

function formatProviderNote(rawDocument) {
  if (!rawDocument) {
    return null;
  }

  const doc = rawDocument.toObject ? rawDocument.toObject() : rawDocument;
  const decrypted = decryptFields(doc, NOTE_FIELDS);

  return {
    id: doc._id.toString(),
    patientId: doc.patientId.toString(),
    templateId: doc.templateId ? doc.templateId.toString() : null,
    content: decrypted.content || null,
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : null,
    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : null
  };
}

async function assertPatientExists(patientId) {
  const exists = await Patient.exists({ _id: patientId });

  if (!exists) {
    throw new AppError('Patient not found', 404);
  }
}

async function assertTemplateExists(templateId) {
  if (!templateId) {
    return;
  }

  const exists = await Template.exists({ _id: templateId });

  if (!exists) {
    throw new AppError('Template not found', 404);
  }
}

async function createProviderNote(patientId, payload = {}) {
  await assertPatientExists(patientId);
  await assertTemplateExists(payload.templateId);

  const normalized = { content: payload.content };
  const encrypted = encryptFields(normalized, NOTE_FIELDS);

  const note = await ProviderNote.create({
    patientId,
    templateId: payload.templateId || null,
    ...encrypted
  });

  return formatProviderNote(note);
}

async function listProviderNotes(patientId) {
  await assertPatientExists(patientId);

  const notes = await ProviderNote.find({ patientId }).sort({ createdAt: 1 });
  return notes.map((note) => formatProviderNote(note));
}

module.exports = {
  createProviderNote,
  listProviderNotes
};

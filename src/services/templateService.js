const Template = require('../models/template');
const AppError = require('../errors/AppError');
const { encryptFields, decryptFields } = require('../utils/encryption');

const TEMPLATE_FIELDS = ['name', 'body'];

function normalizeTemplatePayload(payload = {}) {
  const normalized = {};

  TEMPLATE_FIELDS.forEach((field) => {
    if (payload[field] !== undefined && payload[field] !== null) {
      normalized[field] = payload[field];
    }
  });

  return normalized;
}

function formatDecryptedTemplate(rawDocument) {
  if (!rawDocument) {
    return null;
  }

  const doc = rawDocument.toObject ? rawDocument.toObject() : rawDocument;
  const decrypted = decryptFields(doc, TEMPLATE_FIELDS);

  return {
    id: doc._id.toString(),
    name: decrypted.name || null,
    body: decrypted.body || null,
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : null,
    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : null
  };
}

async function createTemplate(payload) {
  const normalized = normalizeTemplatePayload(payload);
  const encrypted = encryptFields(normalized, TEMPLATE_FIELDS);
  const template = await Template.create(encrypted);
  return formatDecryptedTemplate(template);
}

async function listTemplates() {
  const templates = await Template.find().sort({ createdAt: 1 });
  return templates.map((template) => formatDecryptedTemplate(template));
}

async function getTemplateById(id) {
  const template = await Template.findById(id);

  if (!template) {
    throw new AppError('Template not found', 404);
  }

  return formatDecryptedTemplate(template);
}

async function updateTemplate(id, payload) {
  const template = await Template.findById(id);

  if (!template) {
    throw new AppError('Template not found', 404);
  }

  const normalized = normalizeTemplatePayload(payload);

  if (!Object.keys(normalized).length) {
    throw new AppError('No updatable fields provided', 400);
  }

  const encryptedUpdates = encryptFields(normalized, TEMPLATE_FIELDS);
  Object.assign(template, encryptedUpdates);
  await template.save();

  return formatDecryptedTemplate(template);
}

async function deleteTemplate(id) {
  const template = await Template.findById(id);

  if (!template) {
    throw new AppError('Template not found', 404);
  }

  await template.deleteOne();
}

module.exports = {
  createTemplate,
  listTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  formatDecryptedTemplate
};

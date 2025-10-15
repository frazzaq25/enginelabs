const templateService = require('../services/templateService');

async function createTemplate(req, res) {
  const template = await templateService.createTemplate(req.body);
  res.status(201).json(template);
}

async function listTemplates(req, res) {
  const templates = await templateService.listTemplates();
  res.status(200).json(templates);
}

async function getTemplateById(req, res) {
  const template = await templateService.getTemplateById(req.params.id);
  res.status(200).json(template);
}

async function updateTemplate(req, res) {
  const template = await templateService.updateTemplate(req.params.id, req.body);
  res.status(200).json(template);
}

async function deleteTemplate(req, res) {
  await templateService.deleteTemplate(req.params.id);
  res.status(204).send();
}

module.exports = {
  createTemplate,
  listTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate
};

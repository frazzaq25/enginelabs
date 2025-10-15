const { celebrate, Joi, Segments } = require('celebrate');

const objectId = Joi.string().hex().length(24);

const createProviderNoteValidation = celebrate({
  [Segments.PARAMS]: Joi.object({
    patientId: objectId.required()
  }),
  [Segments.BODY]: Joi.object({
    content: Joi.string().trim().required(),
    templateId: objectId.optional()
  })
});

const listProviderNotesValidation = celebrate({
  [Segments.PARAMS]: Joi.object({
    patientId: objectId.required()
  })
});

module.exports = {
  createProviderNoteValidation,
  listProviderNotesValidation
};

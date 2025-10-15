const { celebrate, Joi, Segments } = require('celebrate');

const objectId = Joi.string().hex().length(24);

const createTemplateValidation = celebrate({
  [Segments.BODY]: Joi.object({
    name: Joi.string().trim().required(),
    body: Joi.string().trim().required()
  })
});

const updateTemplateValidation = celebrate({
  [Segments.BODY]: Joi.object({
    name: Joi.string().trim(),
    body: Joi.string().trim()
  }).min(1)
});

const templateIdParamValidation = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: objectId.required()
  })
});

module.exports = {
  createTemplateValidation,
  updateTemplateValidation,
  templateIdParamValidation
};

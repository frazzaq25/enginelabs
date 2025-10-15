const { celebrate, Joi, Segments } = require('celebrate');

const objectId = Joi.string().hex().length(24);

const createPatientValidation = celebrate({
  [Segments.BODY]: Joi.object({
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().required(),
    email: Joi.string().trim().email().required(),
    phone: Joi.string().trim().optional(),
    dateOfBirth: Joi.date().iso().required()
  })
});

const updatePatientValidation = celebrate({
  [Segments.BODY]: Joi.object({
    firstName: Joi.string().trim(),
    lastName: Joi.string().trim(),
    email: Joi.string().trim().email(),
    phone: Joi.string().trim(),
    dateOfBirth: Joi.date().iso()
  }).min(1)
});

const patientIdParamValidation = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: objectId.required()
  })
});

const patientIdOnlyParamValidation = celebrate({
  [Segments.PARAMS]: Joi.object({
    patientId: objectId.required()
  })
});

module.exports = {
  createPatientValidation,
  updatePatientValidation,
  patientIdParamValidation,
  patientIdOnlyParamValidation
};

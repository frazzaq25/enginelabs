const { Router } = require('express');

const templateController = require('../controllers/templateController');
const {
  createTemplateValidation,
  updateTemplateValidation,
  templateIdParamValidation
} = require('../validation/templateValidation');

const router = Router();

router.post('/', createTemplateValidation, templateController.createTemplate);
router.get('/', templateController.listTemplates);
router.get('/:id', templateIdParamValidation, templateController.getTemplateById);
router.put('/:id', templateIdParamValidation, updateTemplateValidation, templateController.updateTemplate);
router.delete('/:id', templateIdParamValidation, templateController.deleteTemplate);

module.exports = router;

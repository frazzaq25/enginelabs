const { Router } = require('express');

const patientController = require('../controllers/patientController');
const {
  createPatientValidation,
  updatePatientValidation,
  patientIdParamValidation
} = require('../validation/patientValidation');

const router = Router();

router.post('/', createPatientValidation, patientController.createPatient);
router.get('/', patientController.listPatients);
router.get('/:id', patientIdParamValidation, patientController.getPatientById);
router.put('/:id', patientIdParamValidation, updatePatientValidation, patientController.updatePatient);
router.delete('/:id', patientIdParamValidation, patientController.deletePatient);

module.exports = router;

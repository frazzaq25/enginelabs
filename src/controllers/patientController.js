const patientService = require('../services/patientService');

async function createPatient(req, res) {
  const patient = await patientService.createPatient(req.body);
  res.status(201).json(patient);
}

async function listPatients(req, res) {
  const patients = await patientService.listPatients();
  res.status(200).json(patients);
}

async function getPatientById(req, res) {
  const patient = await patientService.getPatientById(req.params.id);
  res.status(200).json(patient);
}

async function updatePatient(req, res) {
  const patient = await patientService.updatePatient(req.params.id, req.body);
  res.status(200).json(patient);
}

async function deletePatient(req, res) {
  await patientService.deletePatient(req.params.id);
  res.status(204).send();
}

module.exports = {
  createPatient,
  listPatients,
  getPatientById,
  updatePatient,
  deletePatient
};

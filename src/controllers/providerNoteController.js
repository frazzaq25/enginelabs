const providerNoteService = require('../services/providerNoteService');

async function createProviderNote(req, res) {
  const note = await providerNoteService.createProviderNote(req.params.patientId, req.body);
  res.status(201).json(note);
}

async function listProviderNotes(req, res) {
  const notes = await providerNoteService.listProviderNotes(req.params.patientId);
  res.status(200).json(notes);
}

module.exports = {
  createProviderNote,
  listProviderNotes
};

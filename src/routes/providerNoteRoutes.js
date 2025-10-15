const { Router } = require('express');

const providerNoteController = require('../controllers/providerNoteController');
const {
  createProviderNoteValidation,
  listProviderNotesValidation
} = require('../validation/providerNoteValidation');

const router = Router({ mergeParams: true });

router.post('/', createProviderNoteValidation, providerNoteController.createProviderNote);
router.get('/', listProviderNotesValidation, providerNoteController.listProviderNotes);

module.exports = router;

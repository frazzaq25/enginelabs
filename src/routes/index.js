const { Router } = require('express');

const patientRoutes = require('./patientRoutes');
const templateRoutes = require('./templateRoutes');
const providerNoteRoutes = require('./providerNoteRoutes');

const router = Router();

router.use('/patients/:patientId/notes', providerNoteRoutes);
router.use('/patients', patientRoutes);
router.use('/templates', templateRoutes);

module.exports = router;

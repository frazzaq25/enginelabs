import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataFilePath = path.join(__dirname, 'data', 'patients.json');

const loadPatients = () => {
  try {
    const file = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(file);
  } catch (error) {
    console.error('Failed to load patients seed data', error);
    return [];
  }
};

let patients = loadPatients();

const persistPatients = () => {
  fs.writeFileSync(dataFilePath, JSON.stringify(patients, null, 2));
};

const app = express();
app.use(cors());
app.use(express.json());

const normalizeSearch = (value) => value.trim().toLowerCase();

const matchesPatientFilters = (patient, search, gender) => {
  if (gender && gender !== 'all' && patient.gender !== gender) {
    return false;
  }

  if (search) {
    const query = normalizeSearch(search);
    const haystack = `${patient.firstName} ${patient.lastName} ${patient.mrn} ${patient.email ?? ''}`
      .trim()
      .toLowerCase();
    return haystack.includes(query);
  }

  return true;
};

app.get('/api/patients', (req, res) => {
  const { search = '', gender = 'all' } = req.query;
  const filtered = patients
    .filter((patient) => matchesPatientFilters(patient, search, gender))
    .sort((a, b) => a.lastName.localeCompare(b.lastName));

  res.json(filtered);
});

app.get('/api/patients/:patientId', (req, res) => {
  const patient = patients.find((item) => item.id === req.params.patientId);
  if (!patient) {
    res.status(404).json({ message: 'Patient not found' });
    return;
  }

  res.json(patient);
});

app.post('/api/patients', (req, res) => {
  const { firstName, lastName, dob, gender, mrn, email, phone, primaryProvider, address } = req.body;

  if (!firstName || !lastName || !dob || !gender || !mrn) {
    res.status(400).json({ message: 'Missing required patient fields.' });
    return;
  }

  const now = new Date().toISOString();
  const newPatient = {
    id: randomUUID(),
    firstName,
    lastName,
    dob,
    gender,
    mrn,
    email,
    phone,
    primaryProvider,
    address,
    notes: [],
    templates: [],
    createdAt: now,
    updatedAt: now
  };

  patients = [newPatient, ...patients];
  persistPatients();

  res.status(201).json(newPatient);
});

app.put('/api/patients/:patientId', (req, res) => {
  const { patientId } = req.params;
  const index = patients.findIndex((item) => item.id === patientId);

  if (index === -1) {
    res.status(404).json({ message: 'Patient not found' });
    return;
  }

  const existing = patients[index];
  const { firstName, lastName, dob, gender, mrn, email, phone, primaryProvider, address } = req.body;

  if (!firstName || !lastName || !dob || !gender || !mrn) {
    res.status(400).json({ message: 'Missing required patient fields.' });
    return;
  }

  const updatedPatient = {
    ...existing,
    firstName,
    lastName,
    dob,
    gender,
    mrn,
    email,
    phone,
    primaryProvider,
    address,
    updatedAt: new Date().toISOString()
  };

  patients[index] = updatedPatient;
  persistPatients();

  res.json(updatedPatient);
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.listen(PORT, () => {
  console.log(`Patient API server running on http://localhost:${PORT}`);
});

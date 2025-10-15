const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../../src/app');
const { connect, disconnect } = require('../../src/config/database');
const Patient = require('../../src/models/patient');
const Template = require('../../src/models/template');
const ProviderNote = require('../../src/models/providerNote');
const AuditLog = require('../../src/models/auditLog');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await connect(uri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  const deletionPromises = Object.values(collections).map((collection) => collection.deleteMany({}));
  await Promise.all(deletionPromises);
});

afterAll(async () => {
  await disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Patients API flows', () => {
  it('performs patient CRUD with encryption and audit logging', async () => {
    const createPayload = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+15550001111',
      dateOfBirth: '1990-01-01'
    };

    const createResponse = await request(app)
      .post('/api/patients')
      .set('x-user-id', 'user-1')
      .set('x-user-email', 'user1@example.com')
      .send(createPayload);

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+15550001111'
    });
    expect(createResponse.body).toHaveProperty('id');

    const createdPatientId = createResponse.body.id;

    const storedPatient = await Patient.findById(createdPatientId).lean();
    expect(storedPatient).toBeTruthy();
    expect(storedPatient.firstName).not.toBe(createPayload.firstName);
    expect(storedPatient.lastName).not.toBe(createPayload.lastName);
    expect(storedPatient.email).not.toBe(createPayload.email);

    const getResponse = await request(app)
      .get(`/api/patients/${createdPatientId}`)
      .set('x-user-id', 'user-1');

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.firstName).toBe('John');

    const updateResponse = await request(app)
      .put(`/api/patients/${createdPatientId}`)
      .set('x-user-id', 'user-1')
      .send({ phone: '+15550009999' });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.phone).toBe('+15550009999');

    const updatedPatient = await Patient.findById(createdPatientId).lean();
    expect(updatedPatient.phone).not.toBe('+15550009999');

    const listResponse = await request(app)
      .get('/api/patients')
      .set('x-user-id', 'user-1');

    expect(listResponse.status).toBe(200);
    expect(Array.isArray(listResponse.body)).toBe(true);
    expect(listResponse.body).toHaveLength(1);

    const deleteResponse = await request(app)
      .delete(`/api/patients/${createdPatientId}`)
      .set('x-user-id', 'user-1');

    expect(deleteResponse.status).toBe(204);
    expect(await Patient.findById(createdPatientId)).toBeNull();

    const auditEntries = await AuditLog.find().lean();
    expect(auditEntries).toHaveLength(5);

    const writeEntry = auditEntries.find((entry) => entry.method === 'POST');
    expect(writeEntry.operation).toBe('WRITE');
    expect(writeEntry.details.requestBody.firstName).toBe('[REDACTED]');
    expect(writeEntry.userId).toBe('user-1');

    const readEntry = auditEntries.find((entry) => entry.method === 'GET' && entry.route.startsWith('/api/patients/'));
    expect(readEntry.operation).toBe('READ');
  });
});

describe('Templates and provider notes API flows', () => {
  it('handles template lifecycle and provider notes with audit coverage', async () => {
    const patientResponse = await request(app)
      .post('/api/patients')
      .set('x-user-id', 'clinician-1')
      .send({
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice.smith@example.com',
        dateOfBirth: '1985-05-05'
      });

    expect(patientResponse.status).toBe(201);

    const patientId = patientResponse.body.id;
    expect(patientId).toBeDefined();

    const templateResponse = await request(app)
      .post('/api/templates')
      .set('x-user-id', 'clinician-1')
      .send({
        name: 'Follow-up',
        body: 'Please follow up in two weeks.'
      });

    expect(templateResponse.status).toBe(201);
    const templateId = templateResponse.body.id;

    const templateRecord = await Template.findById(templateId).lean();
    expect(templateRecord.name).not.toBe('Follow-up');

    const templateUpdate = await request(app)
      .put(`/api/templates/${templateId}`)
      .set('x-user-id', 'clinician-1')
      .send({ body: 'Updated instructions.' });

    expect(templateUpdate.status).toBe(200);
    expect(templateUpdate.body.body).toBe('Updated instructions.');

    const templatesList = await request(app)
      .get('/api/templates')
      .set('x-user-id', 'clinician-1');

    expect(templatesList.status).toBe(200);
    expect(templatesList.body).toHaveLength(1);

    const noteResponse = await request(app)
      .post(`/api/patients/${patientId}/notes`)
      .set('x-user-id', 'clinician-1')
      .send({
        templateId,
        content: 'Patient reported feeling better.'
      });

    expect(noteResponse.status).toBe(201);
    expect(noteResponse.body.content).toBe('Patient reported feeling better.');

    const storedNote = await ProviderNote.findById(noteResponse.body.id).lean();
    expect(storedNote.content).not.toBe('Patient reported feeling better.');

    const notesList = await request(app)
      .get(`/api/patients/${patientId}/notes`)
      .set('x-user-id', 'clinician-1');

    expect(notesList.status).toBe(200);
    expect(notesList.body).toHaveLength(1);
    expect(notesList.body[0]).toMatchObject({
      patientId,
      templateId
    });

    const noteLog = await AuditLog.findOne({ method: 'POST', route: `/api/patients/${patientId}/notes` }).lean();
    expect(noteLog).toBeTruthy();
    expect(noteLog.operation).toBe('WRITE');
    expect(noteLog.details.requestBody.content).toBe('[REDACTED]');

    const readLogs = await AuditLog.find({ operation: 'READ' }).lean();
    expect(readLogs.length).toBeGreaterThan(0);
  });
});

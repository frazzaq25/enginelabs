import {
  NoteDraftPayload,
  NoteSubmitPayload,
  NoteTemplate,
  Patient,
  ProviderNote,
  ProviderNoteDetail,
  ProviderNoteSummary,
} from '../types';

const LATENCY_MS = 120;

const patients: Patient[] = [
  { id: 'p-100', displayName: 'Alex Johnson', dob: '1989-04-12', mrn: 'MRN-103928' },
  { id: 'p-200', displayName: 'Maria Sanchez', dob: '1976-09-04', mrn: 'MRN-104562' },
  { id: 'p-300', displayName: 'Samuel Lee', dob: '1994-11-26', mrn: 'MRN-106781' },
];

const templates: NoteTemplate[] = [
  {
    id: 'tpl-general-visit',
    name: 'General Visit Note',
    description: 'Standard SOAP note template for in-person visits.',
    fields: [
      {
        id: 'subjective',
        label: 'Subjective',
        type: 'richText',
        required: true,
        helperText: 'Chief complaint and history of present illness.'
      },
      {
        id: 'objective',
        label: 'Objective',
        type: 'table',
        columns: [
          { key: 'metric', label: 'Metric' },
          { key: 'value', label: 'Value' },
          { key: 'unit', label: 'Unit' }
        ],
        minRows: 2,
        helperText: 'Record vital signs and exam findings.'
      },
      {
        id: 'assessment',
        label: 'Assessment',
        type: 'richText',
        required: true
      },
      {
        id: 'plan',
        label: 'Plan',
        type: 'textarea',
        helperText: 'Outline treatment plan and follow-up items.'
      },
      {
        id: 'followUpDate',
        label: 'Follow-up Date',
        type: 'date'
      }
    ]
  },
  {
    id: 'tpl-telehealth-summary',
    name: 'Telehealth Summary',
    description: 'Quick documentation template for remote encounters.',
    fields: [
      {
        id: 'sessionQuality',
        label: 'Session Quality',
        type: 'select',
        options: [
          { label: 'Excellent', value: 'excellent' },
          { label: 'Good', value: 'good' },
          { label: 'Fair', value: 'fair' },
          { label: 'Poor', value: 'poor' }
        ],
        defaultValue: 'good'
      },
      {
        id: 'presentingConcerns',
        label: 'Presenting Concerns',
        type: 'text',
        required: true
      },
      {
        id: 'interventions',
        label: 'Interventions Provided',
        type: 'richText'
      },
      {
        id: 'nextSteps',
        label: 'Next Steps',
        type: 'textarea'
      }
    ]
  }
];

let notesStore: ProviderNote[] = [
  {
    id: 'note-900',
    patientId: 'p-100',
    templateId: 'tpl-general-visit',
    status: 'submitted',
    author: 'Dr. Cameron',
    createdAt: '2024-05-01T15:20:00.000Z',
    updatedAt: '2024-05-01T16:45:00.000Z',
    data: {
      subjective: '<p>Patient reports improved sleep.</p>',
      objective: [
        { metric: 'Blood Pressure', value: '118/76', unit: 'mmHg' },
        { metric: 'Heart Rate', value: '72', unit: 'bpm' }
      ],
      assessment: '<p>Stable hypertension. Continue medication.</p>',
      plan: 'Continue current regimen. Recheck in 3 months.',
      followUpDate: '2024-08-01'
    }
  },
  {
    id: 'note-901',
    patientId: 'p-200',
    templateId: 'tpl-telehealth-summary',
    status: 'signed',
    author: 'Dr. Cameron',
    createdAt: '2024-06-11T10:05:00.000Z',
    updatedAt: '2024-06-11T10:45:00.000Z',
    data: {
      sessionQuality: 'excellent',
      presentingConcerns: 'Anxiety related to work transition.',
      interventions: '<p>Practiced breathing exercises and grounding techniques.</p>',
      nextSteps: 'Patient to journal daily stressors. Follow-up in 2 weeks.'
    }
  }
];

const clone = <T,>(value: T): T => {
  if (typeof globalThis.structuredClone === 'function') {
    return globalThis.structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
};

const simulateLatency = <T,>(data: T): Promise<T> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(clone(data)), LATENCY_MS);
  });

const formatSummary = (note: ProviderNote): ProviderNoteSummary => {
  const templateName = templates.find((tpl) => tpl.id === note.templateId)?.name ?? 'Unknown Template';
  return {
    id: note.id,
    status: note.status,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    templateId: note.templateId,
    templateName
  };
};

const getIsoTimestamp = () => new Date().toISOString();

const generateNoteId = () => `note-${Math.random().toString(36).slice(2, 9)}`;

export const providerNotesApi = {
  async fetchPatients(): Promise<Patient[]> {
    return simulateLatency(patients);
  },

  async fetchTemplates(): Promise<NoteTemplate[]> {
    return simulateLatency(templates);
  },

  async fetchPatientNotes(patientId: string): Promise<ProviderNoteSummary[]> {
    const patientNotes = notesStore.filter((note) => note.patientId === patientId);
    return simulateLatency(patientNotes.map(formatSummary));
  },

  async fetchNoteDetail(noteId: string): Promise<ProviderNoteDetail> {
    const note = notesStore.find((entry) => entry.id === noteId);
    if (!note) {
      throw new Error('Note not found');
    }

    const templateName = templates.find((tpl) => tpl.id === note.templateId)?.name ?? 'Unknown Template';
    return simulateLatency({ ...note, templateName });
  },

  async saveDraft(payload: NoteDraftPayload): Promise<ProviderNoteDetail> {
    const timestamp = getIsoTimestamp();

    let note: ProviderNote | undefined;
    if (payload.noteId) {
      note = notesStore.find((entry) => entry.id === payload.noteId);
    }

    if (note) {
      note.data = clone(payload.values);
      note.status = 'draft';
      note.updatedAt = timestamp;
    } else {
      note = {
        id: generateNoteId(),
        patientId: payload.patientId,
        templateId: payload.templateId,
        status: 'draft',
        author: 'Current Provider',
        createdAt: timestamp,
        updatedAt: timestamp,
        data: clone(payload.values)
      };
      notesStore = [note, ...notesStore];
    }

    const templateName = templates.find((tpl) => tpl.id === note.templateId)?.name ?? 'Unknown Template';
    return simulateLatency({ ...note, templateName });
  },

  async submitNote(payload: NoteSubmitPayload): Promise<ProviderNoteDetail> {
    const note = notesStore.find((entry) => entry.id === payload.noteId);
    if (!note) {
      throw new Error('Note not found');
    }

    note.status = 'submitted';
    note.updatedAt = getIsoTimestamp();

    const templateName = templates.find((tpl) => tpl.id === note.templateId)?.name ?? 'Unknown Template';
    return simulateLatency({ ...note, templateName });
  }
};

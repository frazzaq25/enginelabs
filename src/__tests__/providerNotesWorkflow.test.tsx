import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { providerNotesApi } from '../api/providerNotesApi';
import { NoteTemplate, ProviderNoteDetail, ProviderNoteSummary } from '../types';

vi.mock('../api/providerNotesApi', () => {
  return {
    providerNotesApi: {
      fetchPatients: vi.fn(),
      fetchTemplates: vi.fn(),
      fetchPatientNotes: vi.fn(),
      fetchNoteDetail: vi.fn(),
      saveDraft: vi.fn(),
      submitNote: vi.fn(),
    },
  };
});

const mockedApi = providerNotesApi as vi.Mocked<typeof providerNotesApi>;

const mockPatients = [
  { id: 'p-1', displayName: 'Jamie Rivera', dob: '1990-10-03', mrn: 'MRN-1' },
  { id: 'p-2', displayName: 'Taylor Reed', dob: '1984-02-18', mrn: 'MRN-2' },
];

const mockTemplates: NoteTemplate[] = [
  {
    id: 'tpl-1',
    name: 'General Visit',
    description: 'General purpose visit template',
    fields: [
      {
        id: 'subjective',
        label: 'Subjective',
        type: 'richText',
        required: true,
      },
      {
        id: 'objective',
        label: 'Objective',
        type: 'table',
        minRows: 1,
        columns: [
          { key: 'metric', label: 'Metric' },
          { key: 'value', label: 'Value' },
          { key: 'unit', label: 'Unit' },
        ],
      },
      {
        id: 'plan',
        label: 'Plan',
        type: 'textarea',
      },
    ],
  },
];

const mockHistory: ProviderNoteSummary[] = [
  {
    id: 'note-existing',
    templateId: 'tpl-1',
    templateName: 'General Visit',
    status: 'submitted',
    createdAt: '2024-01-02T11:00:00.000Z',
    updatedAt: '2024-01-02T12:00:00.000Z',
  },
];

const mockHistoryDetail: ProviderNoteDetail = {
  id: 'note-existing',
  patientId: 'p-1',
  templateId: 'tpl-1',
  templateName: 'General Visit',
  status: 'submitted',
  author: 'Dr. Example',
  createdAt: '2024-01-02T11:00:00.000Z',
  updatedAt: '2024-01-02T12:00:00.000Z',
  data: {
    subjective: '<p>Doing well</p>',
    objective: [
      { metric: 'Heart Rate', value: '72', unit: 'bpm' },
    ],
    plan: 'Continue routine care.',
  },
};

beforeEach(() => {
  vi.clearAllMocks();

  mockedApi.fetchPatients.mockResolvedValue(mockPatients);
  mockedApi.fetchTemplates.mockResolvedValue(mockTemplates);
  mockedApi.fetchPatientNotes.mockResolvedValue([]);
  mockedApi.fetchNoteDetail.mockResolvedValue(mockHistoryDetail);
});

const startSession = async () => {
  render(<App />);

  const patientSelect = await screen.findByTestId('patient-select');
  await waitFor(() => expect(patientSelect).toBeEnabled());

  await userEvent.selectOptions(patientSelect, 'p-1');

  const templateSelect = await screen.findByTestId('template-select');
  await waitFor(() => expect(templateSelect).toBeEnabled());
  await userEvent.selectOptions(templateSelect, 'tpl-1');

  return { patientSelect, templateSelect } as const;
};

const updateRichText = (testId: string, value: string) => {
  const input = screen.getByTestId(`${testId}-input`);
  (input as HTMLDivElement).innerHTML = value;
  fireEvent.input(input, { target: input });
};

const fillTable = async () => {
  const metric = await screen.findByLabelText('Objective Metric row 1');
  const value = screen.getByLabelText('Objective Value row 1');
  const unit = screen.getByLabelText('Objective Unit row 1');

  await userEvent.clear(metric);
  await userEvent.type(metric, 'Blood Pressure');
  await userEvent.clear(value);
  await userEvent.type(value, '118/76');
  await userEvent.clear(unit);
  await userEvent.type(unit, 'mmHg');
};

const fillPlan = async () => {
  const planField = screen.getByLabelText('Plan');
  await userEvent.type(planField, 'Follow up in 2 weeks');
};

describe('Provider notes workflow', () => {
  it('saves drafts with dynamic form data and provides status feedback', async () => {
    mockedApi.fetchPatientNotes.mockResolvedValueOnce([]).mockResolvedValueOnce([
      ...mockHistory,
      {
        id: 'note-new',
        templateId: 'tpl-1',
        templateName: 'General Visit',
        status: 'draft',
        createdAt: '2024-07-01T12:00:00.000Z',
        updatedAt: '2024-07-01T12:00:00.000Z',
      },
    ]);

    mockedApi.saveDraft.mockResolvedValue({
      id: 'note-new',
      patientId: 'p-1',
      templateId: 'tpl-1',
      templateName: 'General Visit',
      status: 'draft',
      author: 'Dr. Example',
      createdAt: '2024-07-01T12:00:00.000Z',
      updatedAt: '2024-07-01T12:00:00.000Z',
      data: {},
    });

    await startSession();

    updateRichText('subjective-rte', '<p>Patient presents with mild headache.</p>');
    await fillTable();
    await fillPlan();

    const saveButton = await screen.findByRole('button', { name: /save draft/i });
    await userEvent.click(saveButton);

    await waitFor(() => expect(mockedApi.saveDraft).toHaveBeenCalledTimes(1));
    expect(mockedApi.saveDraft).toHaveBeenCalledWith({
      patientId: 'p-1',
      templateId: 'tpl-1',
      values: expect.objectContaining({
        subjective: '<p>Patient presents with mild headache.</p>',
      }),
      noteId: undefined,
    });

    expect(await screen.findByText(/Draft saved successfully/i)).toBeInTheDocument();
    expect(screen.getByTestId('session-status')).toHaveTextContent(/Draft/i);
  });

  it('submits notes and updates session status', async () => {
    mockedApi.fetchPatientNotes.mockResolvedValueOnce([]).mockResolvedValueOnce([]).mockResolvedValue([
      {
        id: 'note-new',
        templateId: 'tpl-1',
        templateName: 'General Visit',
        status: 'submitted',
        createdAt: '2024-07-01T12:00:00.000Z',
        updatedAt: '2024-07-01T12:02:00.000Z',
      },
    ]);

    mockedApi.saveDraft.mockResolvedValue({
      id: 'note-new',
      patientId: 'p-1',
      templateId: 'tpl-1',
      templateName: 'General Visit',
      status: 'draft',
      author: 'Dr. Example',
      createdAt: '2024-07-01T12:00:00.000Z',
      updatedAt: '2024-07-01T12:00:00.000Z',
      data: {},
    });

    mockedApi.submitNote.mockResolvedValue({
      id: 'note-new',
      patientId: 'p-1',
      templateId: 'tpl-1',
      templateName: 'General Visit',
      status: 'submitted',
      author: 'Dr. Example',
      createdAt: '2024-07-01T12:00:00.000Z',
      updatedAt: '2024-07-01T12:02:00.000Z',
      data: {},
    });

    await startSession();

    updateRichText('subjective-rte', '<p>Sample Content</p>');
    await fillTable();
    await fillPlan();

    const submitButton = await screen.findByRole('button', { name: /submit note/i });
    await userEvent.click(submitButton);

    await waitFor(() => expect(mockedApi.saveDraft).toHaveBeenCalled());
    await waitFor(() => expect(mockedApi.submitNote).toHaveBeenCalledWith({ noteId: 'note-new' }));

    expect(await screen.findByText(/Note submitted successfully/i)).toBeInTheDocument();
    expect(screen.getByTestId('session-status')).toHaveTextContent(/Submitted/i);
  });

  it('shows patient note history and detail entries', async () => {
    mockedApi.fetchPatientNotes.mockResolvedValue(mockHistory);
    mockedApi.fetchNoteDetail.mockResolvedValue(mockHistoryDetail);

    await startSession();

    const historyPanel = await screen.findByLabelText('patient-notes-history');

    const historyButtons = within(historyPanel).getAllByRole('button', { name: /general visit/i });
    expect(historyButtons.length).toBeGreaterThan(0);

    await userEvent.click(historyButtons[0]);

    const detail = await screen.findByTestId('note-detail');
    expect(detail).toHaveTextContent(/Dr. Example/);
    expect(detail).toHaveTextContent(/Doing well/);
  });
});

import { useEffect, useMemo, useState } from 'react';
import { providerNotesApi } from './api/providerNotesApi';
import { DynamicForm } from './components/DynamicForm';
import { NotesHistory } from './components/NotesHistory';
import { PatientSelector } from './components/PatientSelector';
import { TemplateSelector } from './components/TemplateSelector';
import { logError } from './utils/logger';
import {
  NoteTemplate,
  Patient,
  ProviderNoteDetail,
  ProviderNoteStatus,
  ProviderNoteSummary,
  TemplateFormState,
} from './types';

const createInitialFormValues = (template: NoteTemplate): TemplateFormState => {
  return template.fields.reduce<TemplateFormState>((acc, field) => {
    switch (field.type) {
      case 'table': {
        const rowCount = field.minRows ?? 0;
        const rows = Array.from({ length: rowCount }, () =>
          field.columns.reduce<Record<string, string>>((rowAcc, column) => {
            rowAcc[column.key] = '';
            return rowAcc;
          }, {})
        );
        acc[field.id] = rows;
        break;
      }
      case 'number':
        acc[field.id] = field.defaultValue ?? null;
        break;
      default:
        acc[field.id] = field.defaultValue ?? '';
    }

    return acc;
  }, {});
};

const canSubmit = (
  template?: NoteTemplate,
  values?: TemplateFormState
): boolean => {
  if (!template || !values) {
    return false;
  }

  return template.fields.every((field) => {
    if (!field.required) {
      return true;
    }

    const value = values[field.id];
    if (field.type === 'table') {
      return Array.isArray(value) && value.length > 0;
    }

    if (typeof value === 'string') {
      return value.trim().length > 0;
    }

    return value !== undefined && value !== null;
  });
};

const STATUS_LABELS: Record<ProviderNoteStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  signed: 'Signed',
};

const formatStatus = (status: ProviderNoteStatus) => STATUS_LABELS[status] ?? status;

const formatPatientSummary = (patient?: Patient) =>
  patient ? `${patient.displayName} — DOB ${new Date(patient.dob).toLocaleDateString()}` : 'Select a patient to begin';

const App = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [templates, setTemplates] = useState<NoteTemplate[]>([]);
  const [patientLoading, setPatientLoading] = useState(true);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [selectedPatientId, setSelectedPatientId] = useState<string>();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>();

  const [formValues, setFormValues] = useState<TemplateFormState>({});
  const [sessionStatus, setSessionStatus] = useState<ProviderNoteStatus>('draft');
  const [noteId, setNoteId] = useState<string>();

  const [historyNotes, setHistoryNotes] = useState<ProviderNoteSummary[]>([]);
  const [selectedHistoryNoteId, setSelectedHistoryNoteId] = useState<string>();
  const [historyDetail, setHistoryDetail] = useState<ProviderNoteDetail>();

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const [patientResponse, templateResponse] = await Promise.all([
          providerNotesApi.fetchPatients(),
          providerNotesApi.fetchTemplates(),
        ]);

        if (!isMounted) {
          return;
        }

        setPatients(patientResponse);
        setTemplates(templateResponse);
      } catch (error) {
        logError('Failed to load bootstrap data', { error });
        setNotification({ type: 'error', message: 'Unable to load initial data. Please refresh the page.' });
      } finally {
        if (isMounted) {
          setPatientLoading(false);
          setTemplatesLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId),
    [patients, selectedPatientId]
  );

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId),
    [templates, selectedTemplateId]
  );

  useEffect(() => {
    if (!selectedPatientId) {
      setHistoryNotes([]);
      setHistoryDetail(undefined);
      setSelectedHistoryNoteId(undefined);
      return;
    }

    let isMounted = true;
    setHistoryLoading(true);

    providerNotesApi
      .fetchPatientNotes(selectedPatientId)
      .then((notes) => {
        if (isMounted) {
          setHistoryNotes(notes);
        }
      })
      .catch((error) => {
        logError('Failed to load patient history', { error });
        if (isMounted) {
          setNotification({ type: 'error', message: 'Unable to load patient notes history.' });
        }
      })
      .finally(() => {
        if (isMounted) {
          setHistoryLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedPatientId]);

  useEffect(() => {
    if (!selectedTemplate) {
      setFormValues({});
      return;
    }

    setFormValues(createInitialFormValues(selectedTemplate));
    setSessionStatus('draft');
    setNoteId(undefined);
  }, [selectedTemplate]);

  const updateHistoryDetail = async (noteIdentifier: string) => {
    try {
      const detail = await providerNotesApi.fetchNoteDetail(noteIdentifier);
      setHistoryDetail(detail);
      setSelectedHistoryNoteId(noteIdentifier);
    } catch (error) {
      logError('Failed to load note detail', { error });
      setNotification({ type: 'error', message: 'Unable to load note detail.' });
    }
  };

  const handleFieldChange = (fieldId: string, value: unknown) => {
    setFormValues((previous) => ({
      ...previous,
      [fieldId]: value,
    }));
  };

  const refreshHistory = async (patientId: string) => {
    try {
      const notes = await providerNotesApi.fetchPatientNotes(patientId);
      setHistoryNotes(notes);
      if (selectedHistoryNoteId) {
        const stillExisting = notes.some((note) => note.id === selectedHistoryNoteId);
        if (!stillExisting) {
          setHistoryDetail(undefined);
          setSelectedHistoryNoteId(undefined);
        }
      }
    } catch (error) {
      logError('Failed to refresh notes history', { error });
    }
  };

  const persistDraft = async () => {
    if (!selectedPatientId || !selectedTemplateId) {
      throw new Error('Patient and template must be selected before saving.');
    }

    const response = await providerNotesApi.saveDraft({
      patientId: selectedPatientId,
      templateId: selectedTemplateId,
      values: formValues,
      noteId,
    });

    setNoteId(response.id);
    setSessionStatus(response.status);
    await refreshHistory(selectedPatientId);
    return response;
  };

  const handleSaveDraft = async () => {
    if (!selectedPatientId || !selectedTemplateId) {
      setNotification({ type: 'error', message: 'Please choose a patient and template before saving.' });
      return;
    }

    setIsSaving(true);
    setNotification(null);

    try {
      await persistDraft();
      setNotification({ type: 'success', message: 'Draft saved successfully.' });
    } catch (error) {
      logError('Failed to save draft', { error });
      setNotification({ type: 'error', message: 'We could not save your draft. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPatientId || !selectedTemplateId) {
      setNotification({ type: 'error', message: 'Please choose a patient and template before submitting.' });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    try {
      const currentDraft = noteId ? undefined : await persistDraft();
      const effectiveNoteId = currentDraft?.id ?? noteId;

      if (!effectiveNoteId) {
        throw new Error('Unable to determine note identifier.');
      }

      const response = await providerNotesApi.submitNote({ noteId: effectiveNoteId });
      setSessionStatus(response.status);
      await refreshHistory(selectedPatientId);
      setNotification({ type: 'success', message: 'Note submitted successfully.' });
    } catch (error) {
      logError('Failed to submit note', { error });
      setNotification({ type: 'error', message: 'We could not submit the note. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const disableActions = !selectedPatientId || !selectedTemplateId;
  const submitReady = canSubmit(selectedTemplate, formValues);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Provider Notes Workflow</h1>
        <span className="field-helper">{formatPatientSummary(selectedPatient)}</span>
        {selectedTemplate ? <span className="field-helper">Template: {selectedTemplate.name}</span> : null}
        <span className={`status-pill ${sessionStatus}`} data-testid="session-status">
          {formatStatus(sessionStatus)}
        </span>
      </header>

      {notification ? (
        <div className={`notification ${notification.type}`} role="status">
          {notification.message}
        </div>
      ) : null}

      <div className="app-content">
        <div className="panel-card" aria-label="session-scaffold">
          <h2>Session Setup</h2>
          <PatientSelector
            patients={patients}
            selectedPatientId={selectedPatientId}
            onSelect={(patientId) => {
              setSelectedPatientId(patientId);
              setNoteId(undefined);
              setSessionStatus('draft');
              setNotification(null);
              setHistoryDetail(undefined);
              setSelectedHistoryNoteId(undefined);
              if (selectedTemplate) {
                setFormValues(createInitialFormValues(selectedTemplate));
              }
            }}
            disabled={patientLoading}
            isLoading={patientLoading}
          />
          <TemplateSelector
            templates={templates}
            selectedTemplateId={selectedTemplateId}
            onSelect={(templateId) => {
              setSelectedTemplateId(templateId);
              setNotification(null);
            }}
            disabled={templatesLoading || !selectedPatientId}
            isLoading={templatesLoading}
          />
        </div>

        <div className="panel-card" aria-label="note-session">
          <h2>Note Session</h2>
          {selectedTemplate ? (
            <DynamicForm
              template={selectedTemplate}
              values={formValues}
              onFieldChange={handleFieldChange}
              disabled={!selectedPatientId}
            />
          ) : (
            <p>Select a template to begin documenting.</p>
          )}

          <div className="session-actions">
            <button
              type="button"
              className="save-button"
              onClick={handleSaveDraft}
              disabled={disableActions || isSaving || isSubmitting}
            >
              {isSaving ? 'Saving…' : 'Save Draft'}
            </button>
            <button
              type="button"
              className="submit-button"
              onClick={handleSubmit}
              disabled={disableActions || !submitReady || isSaving || isSubmitting}
            >
              {isSubmitting ? 'Submitting…' : 'Submit Note'}
            </button>
          </div>
        </div>

        <NotesHistory
          notes={historyNotes}
          selectedNoteId={selectedHistoryNoteId}
          onSelect={updateHistoryDetail}
          onClearSelection={() => {
            setSelectedHistoryNoteId(undefined);
            setHistoryDetail(undefined);
          }}
          noteDetail={historyDetail}
          isLoading={historyLoading}
        />
      </div>
    </div>
  );
};

export default App;

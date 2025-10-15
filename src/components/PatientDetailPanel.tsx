import { Link } from 'react-router-dom';
import type { Patient } from '../types/patient';
import { calculateAge, formatDate, formatDateTime } from '../utils/format';

type PatientDetailPanelProps = {
  patient: Patient | undefined;
  isLoading: boolean;
  error: Error | null;
  onEdit: () => void;
};

const PatientDetailPanel = ({ patient, isLoading, error, onEdit }: PatientDetailPanelProps): JSX.Element => {
  if (isLoading) {
    return <div className="detail-placeholder">Loading patient details…</div>;
  }

  if (error) {
    return (
      <div role="alert" className="detail-placeholder">
        Unable to load patient details: {error.message}
      </div>
    );
  }

  if (!patient) {
    return <div className="detail-placeholder">Select a patient to view their profile.</div>;
  }

  return (
    <div className="patient-detail">
      <header className="patient-detail-header">
        <div>
          <h2>
            {patient.firstName} {patient.lastName}
          </h2>
          <p>MRN: {patient.mrn}</p>
        </div>
        <div className="detail-actions">
          <button type="button" onClick={onEdit}>
            Edit patient
          </button>
          <Link className="secondary" to={`/patients/${patient.id}`}>
            Open full profile
          </Link>
        </div>
      </header>

      <section>
        <h3 className="section-heading">Demographics</h3>
        <dl className="patient-meta">
          <div className="patient-meta-item">
            <dt>Date of birth</dt>
            <dd>{formatDate(patient.dob)}</dd>
          </div>
          <div className="patient-meta-item">
            <dt>Age</dt>
            <dd>{calculateAge(patient.dob)}</dd>
          </div>
          <div className="patient-meta-item">
            <dt>Gender</dt>
            <dd>{patient.gender}</dd>
          </div>
          <div className="patient-meta-item">
            <dt>Primary provider</dt>
            <dd>{patient.primaryProvider ?? '—'}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h3 className="section-heading">Contact</h3>
        <dl className="patient-meta">
          <div className="patient-meta-item">
            <dt>Email</dt>
            <dd>{patient.email ?? '—'}</dd>
          </div>
          <div className="patient-meta-item">
            <dt>Phone</dt>
            <dd>{patient.phone ?? '—'}</dd>
          </div>
          <div className="patient-meta-item">
            <dt>Address</dt>
            <dd>
              {patient.address
                ? [
                    patient.address.line1,
                    patient.address.line2,
                    `${patient.address.city}, ${patient.address.state} ${patient.address.postalCode}`
                  ]
                    .filter(Boolean)
                    .join('\n')
                : '—'}
            </dd>
          </div>
        </dl>
      </section>

      <section className="detail-section">
        <h3>Associated notes</h3>
        {patient.notes.length ? (
          <ul>
            {patient.notes.map((note) => (
              <li key={note.id}>
                <strong>{note.title}</strong>
                <div>Created: {formatDateTime(note.createdAt)}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No notes recorded yet.</p>
        )}
      </section>

      <section className="detail-section">
        <h3>Templates</h3>
        {patient.templates.length ? (
          <ul>
            {patient.templates.map((template) => (
              <li key={template.id}>
                <strong>{template.name}</strong>
                <div>Last used: {formatDateTime(template.lastUsedAt)}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No templates associated yet.</p>
        )}
      </section>

      <section className="detail-section">
        <h3>Upcoming sections</h3>
        <p>Care plans, visit history, and document templates will appear here in future iterations.</p>
      </section>
    </div>
  );
};

export default PatientDetailPanel;

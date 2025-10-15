import { Link, useParams } from 'react-router-dom';
import { usePatient } from '../hooks/usePatient';
import { calculateAge, formatDate, formatDateTime } from '../utils/format';

const PatientDetailPage = (): JSX.Element => {
  const { patientId } = useParams<{ patientId: string }>();
  const {
    data: patient,
    isLoading,
    error
  } = usePatient(patientId ?? null, { enabled: Boolean(patientId) });

  if (isLoading) {
    return <div className="detail-placeholder">Loading patient profile…</div>;
  }

  if (error) {
    return (
      <div role="alert" className="detail-placeholder">
        Unable to load patient profile: {error.message}
      </div>
    );
  }

  if (!patient) {
    return <div className="detail-placeholder">Patient not found.</div>;
  }

  return (
    <article className="patients-page">
      <header className="patient-detail-header">
        <div>
          <h1>
            {patient.firstName} {patient.lastName}
          </h1>
          <p>MRN: {patient.mrn}</p>
        </div>
        <div className="detail-actions">
          <Link className="secondary" to="/patients">
            Back to patient workspace
          </Link>
        </div>
      </header>

      <section className="panel patients-detail-panel">
        <h2 className="section-heading">Demographics</h2>
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

      <section className="panel patients-detail-panel">
        <h2 className="section-heading">Contact information</h2>
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

      <section className="panel patients-detail-panel">
        <h2 className="section-heading">Notes</h2>
        {patient.notes.length ? (
          <ul>
            {patient.notes.map((note) => (
              <li key={note.id}>
                <strong>{note.title}</strong>
                <div>Created {formatDateTime(note.createdAt)}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No clinical notes recorded yet.</p>
        )}
      </section>

      <section className="panel patients-detail-panel">
        <h2 className="section-heading">Templates</h2>
        {patient.templates.length ? (
          <ul>
            {patient.templates.map((template) => (
              <li key={template.id}>
                <strong>{template.name}</strong>
                <div>Last used {formatDateTime(template.lastUsedAt)}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No templates associated.</p>
        )}
      </section>

      <section className="panel patients-detail-panel">
        <h2 className="section-heading">Future sections</h2>
        <p>Care plans, assessments, and encounter documentation will be surfaced here in future releases.</p>
      </section>
    </article>
  );
};

export default PatientDetailPage;

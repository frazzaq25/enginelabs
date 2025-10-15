import type { Patient } from '../types/patient';

type PatientListProps = {
  patients: Patient[];
  isLoading: boolean;
  error: Error | null;
  selectedPatientId: string | null;
  onSelect: (patientId: string) => void;
};

const PatientList = ({
  patients,
  isLoading,
  error,
  selectedPatientId,
  onSelect
}: PatientListProps): JSX.Element => {
  if (isLoading) {
    return <div className="empty-state">Loading patients…</div>;
  }

  if (error) {
    return (
      <div role="alert" className="empty-state">
        Unable to load patients: {error.message}
      </div>
    );
  }

  if (!patients.length) {
    return <div className="empty-state">No patients found. Adjust your search or add a new patient.</div>;
  }

  return (
    <ul className="patient-list" aria-label="Patient results">
      {patients.map((patient) => (
        <li key={patient.id}>
          <button
            type="button"
            onClick={() => onSelect(patient.id)}
            aria-current={selectedPatientId === patient.id}
          >
            <strong>
              {patient.lastName}, {patient.firstName}
            </strong>
            <span>MRN: {patient.mrn}</span>
            {patient.primaryProvider ? <span>Primary: {patient.primaryProvider}</span> : null}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default PatientList;

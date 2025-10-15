import { Patient } from '../types';

type PatientSelectorProps = {
  patients: Patient[];
  selectedPatientId?: string;
  onSelect: (patientId: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
};

export const PatientSelector = ({
  patients,
  selectedPatientId,
  onSelect,
  disabled,
  isLoading
}: PatientSelectorProps) => {
  return (
    <div className="selector-group" aria-label="patient-selector">
      <label htmlFor="patient-select">Patient</label>
      <select
        id="patient-select"
        data-testid="patient-select"
        disabled={disabled || isLoading}
        value={selectedPatientId ?? ''}
        onChange={(event) => onSelect(event.target.value)}
      >
        <option value="" disabled>
          {isLoading ? 'Loading patients…' : 'Select a patient'}
        </option>
        {patients.map((patient) => (
          <option key={patient.id} value={patient.id}>
            {patient.displayName} · DOB {new Date(patient.dob).toLocaleDateString()} · MRN {patient.mrn}
          </option>
        ))}
      </select>
    </div>
  );
};

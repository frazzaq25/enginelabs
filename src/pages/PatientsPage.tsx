import { useEffect, useMemo, useState } from 'react';
import SearchFilterBar from '../components/SearchFilterBar';
import PatientList from '../components/PatientList';
import PatientDetailPanel from '../components/PatientDetailPanel';
import PatientForm from '../components/PatientForm';
import { usePatients } from '../hooks/usePatients';
import { usePatient } from '../hooks/usePatient';
import type { PatientGender } from '../types/patient';

const PatientsPage = (): JSX.Element => {
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState<PatientGender | 'all'>('all');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);

  const filters = useMemo(
    () => ({
      search: search.trim(),
      gender
    }),
    [search, gender]
  );

  const {
    data: patients = [],
    isLoading: isPatientsLoading,
    error: patientsError
  } = usePatients(filters);

  useEffect(() => {
    if (patients.length && !selectedPatientId) {
      setSelectedPatientId(patients[0].id);
    }
    if (!patients.length) {
      setSelectedPatientId(null);
    }
  }, [patients, selectedPatientId]);

  const shouldLoadDetail = formMode !== 'create' && Boolean(selectedPatientId);
  const {
    data: patientDetail,
    isLoading: isDetailLoading,
    error: detailError
  } = usePatient(shouldLoadDetail ? selectedPatientId : null, {
    enabled: shouldLoadDetail
  });

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setFormMode(null);
  };

  const handleCreateNew = () => {
    setFormMode('create');
  };

  const handleEdit = () => {
    setFormMode('edit');
  };

  const handleFormCancel = () => {
    setFormMode(null);
  };

  const handleFormSuccess = (patientId: string) => {
    setFormMode(null);
    setSelectedPatientId(patientId);
  };

  const renderDetail = () => {
    if (formMode === 'create') {
      return <PatientForm mode="create" onCancel={handleFormCancel} onSuccess={handleFormSuccess} />;
    }

    if (formMode === 'edit') {
      if (isDetailLoading) {
        return <div className="detail-placeholder">Loading patient for editing…</div>;
      }
      if (detailError) {
        return (
          <div role="alert" className="detail-placeholder">
            Unable to load patient for editing: {detailError.message}
          </div>
        );
      }
      if (patientDetail) {
        return (
          <PatientForm
            mode="edit"
            patient={patientDetail}
            onCancel={handleFormCancel}
            onSuccess={handleFormSuccess}
          />
        );
      }
    }

    return (
      <PatientDetailPanel
        patient={patientDetail}
        isLoading={isDetailLoading}
        error={detailError ?? null}
        onEdit={handleEdit}
      />
    );
  };

  return (
    <div className="patients-page">
      <header>
        <h1 className="section-heading">Patient management</h1>
        <p>Search, review, and update patient records in real time.</p>
      </header>

      <SearchFilterBar
        search={search}
        gender={gender}
        onSearchChange={setSearch}
        onGenderChange={setGender}
        onCreatePatient={handleCreateNew}
      />

      <div className="patients-layout">
        <section className="patients-list-panel panel" aria-label="Patient list panel">
          <PatientList
            patients={patients}
            isLoading={isPatientsLoading}
            error={patientsError ?? null}
            selectedPatientId={selectedPatientId}
            onSelect={handleSelectPatient}
          />
        </section>

        <section className="patients-detail-panel panel" aria-label="Patient detail panel">
          {renderDetail()}
        </section>
      </div>
    </div>
  );
};

export default PatientsPage;

import { Navigate, Route, Routes } from 'react-router-dom';
import PatientsPage from './pages/PatientsPage';
import PatientDetailPage from './pages/PatientDetailPage';

const App = (): JSX.Element => {
  return (
    <div className="app-shell">
      <main className="page-container">
        <Routes>
          <Route path="/" element={<Navigate to="/patients" replace />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/patients/:patientId" element={<PatientDetailPage />} />
          <Route path="*" element={<Navigate to="/patients" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;

import { screen } from '@testing-library/react';
import PatientDetailPage from '../pages/PatientDetailPage';
import { renderWithProviders } from '../../tests/utils/renderWithProviders';

describe('PatientDetailPage', () => {
  it('renders the patient demographics and metadata', async () => {
    renderWithProviders(<PatientDetailPage />, {
      route: '/patients/patient-1',
      path: '/patients/:patientId'
    });

    expect(await screen.findByRole('heading', { name: /Alice Anderson/i })).toBeInTheDocument();
    expect(screen.getByText(/MRN: AA-1001/i)).toBeInTheDocument();
    expect(screen.getByText(/Hypertension Follow-up/i)).toBeInTheDocument();
    expect(screen.getByText(/Annual wellness visit/i)).toBeInTheDocument();
  });
});

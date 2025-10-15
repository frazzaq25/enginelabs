import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PatientForm from '../components/PatientForm';
import { renderWithProviders } from '../../tests/utils/renderWithProviders';

const noop = () => {};

describe('PatientForm', () => {
  it('shows validation errors when required fields are missing', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <PatientForm mode="create" onCancel={noop} onSuccess={noop} />,
      { route: '/' }
    );

    await user.click(screen.getByRole('button', { name: /create patient/i }));

    expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/date of birth is required/i)).toBeInTheDocument();
    expect(screen.getByText(/medical record number is required/i)).toBeInTheDocument();
  });
});

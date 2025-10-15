import { screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PatientsPage from '../pages/PatientsPage';
import { renderWithProviders } from '../../tests/utils/renderWithProviders';

describe('PatientsPage', () => {
  it('renders patient results, allows filtering, and submits create form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PatientsPage />);

    expect(await screen.findByRole('heading', { name: /patient management/i })).toBeInTheDocument();

    const list = await screen.findByRole('list', { name: /patient results/i });
    expect(within(list).getByRole('button', { name: /Anderson, Alice/ })).toBeInTheDocument();

    await user.click(within(list).getByRole('button', { name: /Brooks, Brian/ }));
    await screen.findByRole('heading', { name: /Brian Brooks/i });

    const searchInput = screen.getByPlaceholderText(/search by name, mrn, or email/i);
    await user.clear(searchInput);
    await user.type(searchInput, 'Chen');

    await waitFor(() => {
      expect(within(list).getByRole('button', { name: /Chen, Cecilia/ })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /new patient/i }));
    expect(await screen.findByRole('heading', { name: /create patient/i })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/first name/i), 'Derek');
    await user.type(screen.getByLabelText(/last name/i), 'Diaz');
    await user.type(screen.getByLabelText(/date of birth/i), '1992-04-18');
    await user.selectOptions(screen.getByLabelText(/gender/i), 'male');
    await user.type(screen.getByLabelText(/medical record number/i), 'DD-8899');
    await user.type(screen.getByLabelText(/email/i), 'derek.diaz@example.com');

    await user.click(screen.getByRole('button', { name: /create patient/i }));

    await screen.findByRole('heading', { name: /Derek Diaz/i });
    await waitFor(() => {
      expect(screen.getByText(/MRN: DD-8899/i)).toBeInTheDocument();
    });
  });
});

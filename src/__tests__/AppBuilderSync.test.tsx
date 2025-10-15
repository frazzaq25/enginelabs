import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from '../App';
import { templateApi } from '../api/templateApi';

describe('Template builder integration', () => {
  beforeEach(() => {
    templateApi.__reset();
  });

  it('synchronises state between visual and form modes', async () => {
    const user = userEvent.setup();
    render(<App />);

    const onboardingCard = await screen.findByText('Customer onboarding');
    await user.click(onboardingCard);

    // Wait for builder to load
    await screen.findByLabelText(/Template name/i);

    // Switch to form mode and update first field label
    await user.click(screen.getByRole('button', { name: /Form builder/i }));

    const labelInputs = await screen.findAllByLabelText(/Field label/i);
    expect(labelInputs.length).toBeGreaterThan(0);

    await user.clear(labelInputs[0]);
    await user.type(labelInputs[0], 'Customer full name');

    // Return to visual mode
    await user.click(screen.getByRole('button', { name: /Visual builder/i }));

    await waitFor(() => {
      expect(screen.getAllByText('Customer full name')[0]).toBeInTheDocument();
    });
  });

  it('adds fields via the palette and exposes them in form mode', async () => {
    const user = userEvent.setup();
    render(<App />);

    const onboardingCard = await screen.findByText('Customer onboarding');
    await user.click(onboardingCard);
    await screen.findByLabelText(/Template name/i);

    const addDropdownButton = await screen.findByRole('button', { name: /Add Dropdown/i });
    await user.click(addDropdownButton);

    await user.click(screen.getByRole('button', { name: /Form builder/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/Dropdown/i).length).toBeGreaterThan(0);
    });
  });
});

import { FC, useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { useTemplateAutosave } from '../hooks/useTemplateAutosave';
import { Template } from '../types/template';

const buildTemplate = (): Template => ({
  id: 'template-1',
  name: 'Sample template',
  description: 'Example template used in tests',
  updatedAt: new Date().toISOString(),
  fields: [
    {
      id: 'field-1',
      type: 'text',
      label: 'Full name',
      required: true,
      placeholder: 'Enter name',
      multiline: false
    }
  ]
});

interface HarnessProps {
  save: (template: Template) => Promise<Template>;
}

const AutosaveHarness: FC<HarnessProps> = ({ save }) => {
  const [template, setTemplate] = useState<Template>(buildTemplate);
  const autosave = useTemplateAutosave(template, save, { delayMs: 25 });

  return (
    <div>
      <span data-testid="status">{autosave.status}</span>
      <span data-testid="message">{autosave.message ?? ''}</span>
      <button type="button" onClick={() => setTemplate((prev) => ({ ...prev, name: `${prev.name}!` }))}>
        Change
      </button>
      <button
        type="button"
        onClick={() =>
          setTemplate((prev) => ({
            ...prev,
            fields: prev.fields.map((field, index) =>
              index === 0 ? { ...field, label: '' } : field
            )
          }))
        }
      >
        Invalidate
      </button>
    </div>
  );
};

describe('useTemplateAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('saves the template after the debounce interval', async () => {
    const saveMock = vi.fn(async (template: Template) => ({
      ...template,
      updatedAt: '2024-01-01T00:00:00.000Z'
    }));

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
    render(<AutosaveHarness save={saveMock} />);

    await user.click(screen.getByText('Change'));

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('saving');
    });

    await vi.advanceTimersByTimeAsync(30);

    await waitFor(() => {
      expect(saveMock).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('status')).toHaveTextContent('saved');
      expect(screen.getByTestId('message')).toHaveTextContent('All changes saved');
    });
  });

  it('prevents saving and surfaces validation errors', async () => {
    const saveMock = vi.fn(async (template: Template) => template);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
    render(<AutosaveHarness save={saveMock} />);

    await user.click(screen.getByText('Invalidate'));
    await vi.advanceTimersByTimeAsync(30);

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('error');
      expect(screen.getByTestId('message')).toMatch(/Field label is required/i);
    });

    expect(saveMock).not.toHaveBeenCalled();
  });
});

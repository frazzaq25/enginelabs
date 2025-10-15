import { ChangeEvent } from 'react';

import { TemplateField } from '../../types/template';
import { createId } from '../../utils/id';

export interface FieldEditorProps {
  field: TemplateField;
  onChange: (next: TemplateField) => void;
  onRemove?: () => void;
  variant?: 'panel' | 'inline';
  showRemoveAction?: boolean;
}

const handleNumeric = (value: string): number | undefined => {
  if (value.trim() === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const FieldEditor: React.FC<FieldEditorProps> = ({
  field,
  onChange,
  onRemove,
  variant = 'panel',
  showRemoveAction = true
}) => {
  const updateField = <K extends keyof TemplateField>(key: K, value: TemplateField[K]) => {
    onChange({
      ...field,
      [key]: value
    } as TemplateField);
  };

  const handleCommonInput = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === 'label') {
      updateField('label', value);
    }
  };

  const handleHelpText = (event: ChangeEvent<HTMLTextAreaElement>) => {
    updateField('helpText', event.target.value || undefined);
  };

  const renderTypeSpecific = () => {
    switch (field.type) {
      case 'text':
        return (
          <div className="field-editor__section">
            <label htmlFor={`field-${field.id}-placeholder`}>
              Placeholder text
              <input
                id={`field-${field.id}-placeholder`}
                type="text"
                value={field.placeholder ?? ''}
                onChange={(event) => updateField('placeholder', event.target.value)}
              />
            </label>
            <label className="field-editor__toggle">
              <input
                type="checkbox"
                checked={Boolean(field.multiline)}
                onChange={(event) => updateField('multiline', event.target.checked)}
              />
              Enable multiline input
            </label>
          </div>
        );
      case 'richText':
        return (
          <div className="field-editor__section">
            <span>Formatting options</span>
            <label className="field-editor__toggle">
              <input
                type="checkbox"
                checked={field.config.allowBold}
                onChange={(event) =>
                  onChange({
                    ...field,
                    config: { ...field.config, allowBold: event.target.checked }
                  })
                }
              />
              Allow bold text
            </label>
            <label className="field-editor__toggle">
              <input
                type="checkbox"
                checked={field.config.allowItalic}
                onChange={(event) =>
                  onChange({
                    ...field,
                    config: { ...field.config, allowItalic: event.target.checked }
                  })
                }
              />
              Allow italics
            </label>
            <label className="field-editor__toggle">
              <input
                type="checkbox"
                checked={field.config.allowImages}
                onChange={(event) =>
                  onChange({
                    ...field,
                    config: { ...field.config, allowImages: event.target.checked }
                  })
                }
              />
              Allow media embeds
            </label>
          </div>
        );
      case 'dropdown':
        return (
          <div className="field-editor__section">
            <span>Dropdown options</span>
            <div className="dropdown-options">
              {field.options.map((option, index) => (
                <div className="dropdown-option" key={index}>
                  <input
                    type="text"
                    value={option}
                    onChange={(event) => {
                      const next = [...field.options];
                      next[index] = event.target.value;
                      onChange({ ...field, options: next });
                    }}
                    aria-label={`Option ${index + 1}`}
                  />
                  <button
                    type="button"
                    className="icon-button icon-button--danger"
                    onClick={() => {
                      if (field.options.length === 1) return;
                      const next = field.options.filter((_, idx) => idx !== index);
                      onChange({ ...field, options: next });
                    }}
                    aria-label={`Remove option ${index + 1}`}
                    disabled={field.options.length <= 1}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="inline-button"
              onClick={() =>
                onChange({
                  ...field,
                  options: [...field.options, `Option ${field.options.length + 1}`]
                })
              }
            >
              + Add option
            </button>
            <label className="field-editor__toggle">
              <input
                type="checkbox"
                checked={Boolean(field.allowCustom)}
                onChange={(event) => onChange({ ...field, allowCustom: event.target.checked })}
              />
              Allow custom values
            </label>
          </div>
        );
      case 'number':
        return (
          <div className="field-editor__section">
            <div className="dropdown-option">
              <label htmlFor={`field-${field.id}-min`}>
                Minimum
                <input
                  id={`field-${field.id}-min`}
                  type="number"
                  value={field.min ?? ''}
                  onChange={(event) => updateField('min', handleNumeric(event.target.value))}
                />
              </label>
              <label htmlFor={`field-${field.id}-max`}>
                Maximum
                <input
                  id={`field-${field.id}-max`}
                  type="number"
                  value={field.max ?? ''}
                  onChange={(event) => updateField('max', handleNumeric(event.target.value))}
                />
              </label>
            </div>
            <label htmlFor={`field-${field.id}-unit`}>
              Unit
              <input
                id={`field-${field.id}-unit`}
                type="text"
                value={field.unit ?? ''}
                onChange={(event) => updateField('unit', event.target.value || undefined)}
              />
            </label>
          </div>
        );
      case 'date':
        return (
          <div className="field-editor__section">
            <label htmlFor={`field-${field.id}-min-date`}>
              Earliest date
              <input
                id={`field-${field.id}-min-date`}
                type="date"
                value={field.minDate ?? ''}
                onChange={(event) => updateField('minDate', event.target.value || undefined)}
              />
            </label>
            <label htmlFor={`field-${field.id}-max-date`}>
              Latest date
              <input
                id={`field-${field.id}-max-date`}
                type="date"
                value={field.maxDate ?? ''}
                onChange={(event) => updateField('maxDate', event.target.value || undefined)}
              />
            </label>
          </div>
        );
      case 'table':
        return (
          <div className="field-editor__section">
            <span>Table columns</span>
            <div className="dropdown-options">
              {field.columns.map((column, index) => (
                <div className="dropdown-option" key={column.id}>
                  <input
                    type="text"
                    value={column.label}
                    onChange={(event) => {
                      const next = field.columns.map((col, idx) =>
                        idx === index ? { ...col, label: event.target.value } : col
                      );
                      onChange({ ...field, columns: next });
                    }}
                    aria-label={`Column ${index + 1} label`}
                  />
                  <button
                    type="button"
                    className="icon-button icon-button--danger"
                    onClick={() => {
                      if (field.columns.length === 1) return;
                      const next = field.columns.filter((_, idx) => idx !== index);
                      onChange({ ...field, columns: next });
                    }}
                    aria-label={`Remove column ${index + 1}`}
                    disabled={field.columns.length <= 1}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="inline-button"
              onClick={() =>
                onChange({
                  ...field,
                  columns: [...field.columns, { id: createId(), label: `Column ${field.columns.length + 1}` }]
                })
              }
            >
              + Add column
            </button>
            <label htmlFor={`field-${field.id}-rows`}>
              Default rows
              <input
                id={`field-${field.id}-rows`}
                type="number"
                min={0}
                max={100}
                value={field.defaultRows}
                onChange={(event) =>
                  onChange({ ...field, defaultRows: Math.max(0, Number(event.target.value) || 0) })
                }
              />
            </label>
            <label className="field-editor__toggle">
              <input
                type="checkbox"
                checked={Boolean(field.allowInlineAdd)}
                onChange={(event) => onChange({ ...field, allowInlineAdd: event.target.checked })}
              />
              Allow collaborators to add rows
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`field-editor field-editor--${variant}`}>
      <div className="field-editor__section">
        <div className="field-editor__pill-row">
          <span className="pill">{field.type}</span>
          {field.required && <span className="pill">Required</span>}
        </div>
        <label htmlFor={`field-${field.id}-label`}>
          Field label
          <input
            id={`field-${field.id}-label`}
            name="label"
            type="text"
            value={field.label}
            onChange={handleCommonInput}
          />
        </label>
        <label className="field-editor__toggle">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(event) => updateField('required', event.target.checked)}
          />
          Required field
        </label>
        <label htmlFor={`field-${field.id}-help`}>
          Helper text
          <textarea
            id={`field-${field.id}-help`}
            value={field.helpText ?? ''}
            onChange={handleHelpText}
            placeholder="Explain what information should be provided"
          />
        </label>
      </div>

      {renderTypeSpecific()}

      {showRemoveAction && onRemove && (
        <button type="button" className="inline-button" onClick={onRemove}>
          Remove field
        </button>
      )}
    </div>
  );
};

export default FieldEditor;

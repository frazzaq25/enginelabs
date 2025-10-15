import { NoteTemplate, TemplateField, TemplateFormState } from '../types';
import { RichTextEditor } from './RichTextEditor';
import { TableField } from './TableField';

type DynamicFormProps = {
  template: NoteTemplate;
  values: TemplateFormState;
  onFieldChange: (fieldId: string, value: unknown) => void;
  disabled?: boolean;
};

const renderInput = (
  field: TemplateField,
  value: unknown,
  onFieldChange: (fieldId: string, value: unknown) => void,
  disabled?: boolean
) => {
  const commonProps = {
    id: field.id,
    required: field.required,
    disabled,
  } as const;

  switch (field.type) {
    case 'text':
      return (
        <div className="field-group" key={field.id}>
          <div className="field-label">
            <label htmlFor={field.id}>
              {field.label}
              {field.required ? ' *' : ''}
            </label>
            {field.helperText ? <span className="field-helper">{field.helperText}</span> : null}
          </div>
          <input
            {...commonProps}
            type="text"
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            value={(value as string) ?? ''}
            onChange={(event) => onFieldChange(field.id, event.target.value)}
          />
        </div>
      );
    case 'textarea':
      return (
        <div className="field-group" key={field.id}>
          <div className="field-label">
            <label htmlFor={field.id}>
              {field.label}
              {field.required ? ' *' : ''}
            </label>
            {field.helperText ? <span className="field-helper">{field.helperText}</span> : null}
          </div>
          <textarea
            {...commonProps}
            rows={4}
            value={(value as string) ?? ''}
            onChange={(event) => onFieldChange(field.id, event.target.value)}
          />
        </div>
      );
    case 'number':
      return (
        <div className="field-group" key={field.id}>
          <div className="field-label">
            <label htmlFor={field.id}>
              {field.label}
              {field.required ? ' *' : ''}
            </label>
            {field.helperText ? <span className="field-helper">{field.helperText}</span> : null}
          </div>
          <input
            {...commonProps}
            type="number"
            min={field.min}
            max={field.max}
            step={field.step}
            value={value === null || value === undefined ? '' : String(value)}
            onChange={(event) => {
              const nextValue = event.target.value;
              onFieldChange(field.id, nextValue === '' ? null : Number(nextValue));
            }}
          />
        </div>
      );
    case 'date':
      return (
        <div className="field-group" key={field.id}>
          <div className="field-label">
            <label htmlFor={field.id}>
              {field.label}
              {field.required ? ' *' : ''}
            </label>
            {field.helperText ? <span className="field-helper">{field.helperText}</span> : null}
          </div>
          <input
            {...commonProps}
            type="date"
            value={(value as string) ?? ''}
            onChange={(event) => onFieldChange(field.id, event.target.value)}
          />
        </div>
      );
    case 'select':
      return (
        <div className="field-group" key={field.id}>
          <div className="field-label">
            <label htmlFor={field.id}>
              {field.label}
              {field.required ? ' *' : ''}
            </label>
            {field.helperText ? <span className="field-helper">{field.helperText}</span> : null}
          </div>
          <select
            {...commonProps}
            value={(value as string) ?? ''}
            onChange={(event) => onFieldChange(field.id, event.target.value)}
          >
            <option value="" disabled>
              Select an option
            </option>
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    case 'richText':
      return (
        <RichTextEditor
          key={field.id}
          id={field.id}
          label={field.label}
          helperText={field.helperText}
          value={(value as string) ?? ''}
          onChange={(nextValue) => onFieldChange(field.id, nextValue)}
          required={field.required}
          disabled={disabled}
        />
      );
    case 'table': {
      const rows = Array.isArray(value) ? (value as Array<Record<string, string>>) : [];
      return (
        <TableField
          key={field.id}
          id={field.id}
          label={field.label}
          columns={field.columns}
          rows={rows}
          minRows={field.minRows}
          helperText={field.helperText}
          onChange={(nextRows) => onFieldChange(field.id, nextRows)}
          disabled={disabled}
        />
      );
    }
    default:
      return null;
  }
};

export const DynamicForm = ({ template, values, onFieldChange, disabled }: DynamicFormProps) => {
  return <div className="dynamic-form">{template.fields.map((field) => renderInput(field, values[field.id], onFieldChange, disabled))}</div>;
};

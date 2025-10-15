import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';

import { BuilderMode, Template, TemplateField } from '../../types/template';
import { AutosaveState } from '../../hooks/useTemplateAutosave';
import VisualBuilder from './VisualBuilder';
import FormBuilder from './FormBuilder';

export interface TemplateBuilderProps {
  template: Template;
  mode: BuilderMode;
  autosave: AutosaveState;
  onModeChange: (mode: BuilderMode) => void;
  onChange: (updater: (template: Template) => Template) => void;
}

const AutosaveBadge: React.FC<{ autosave: AutosaveState }> = ({ autosave }) => (
  <span className={`autosave-badge autosave-badge--${autosave.status}`}>
    {autosave.message ?? 'Idle'}
  </span>
);

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({
  template,
  mode,
  autosave,
  onModeChange,
  onChange
}) => {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
    template.fields[0]?.id ?? null
  );

  useEffect(() => {
    if (!template.fields.some((field) => field.id === selectedFieldId)) {
      setSelectedFieldId(template.fields[0]?.id ?? null);
    }
  }, [template.fields, selectedFieldId]);

  const handleTemplateNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    onChange((prev) => ({
      ...prev,
      name
    }));
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const description = event.target.value;
    onChange((prev) => ({
      ...prev,
      description: description || undefined
    }));
  };

  const handleInsertField = (factory: () => TemplateField, index?: number) => {
    const field = factory();
    onChange((prev) => {
      const fields = [...prev.fields];
      const insertionIndex = Math.min(
        Math.max(index ?? fields.length, 0),
        fields.length
      );
      fields.splice(insertionIndex, 0, field);
      return {
        ...prev,
        fields
      };
    });
    setSelectedFieldId(field.id);
  };

  const handleUpdateField = (next: TemplateField) => {
    setSelectedFieldId(next.id);
    onChange((prev) => ({
      ...prev,
      fields: prev.fields.map((field) => (field.id === next.id ? { ...next } : field))
    }));
  };

  const handleRemoveField = (fieldId: string) => {
    const remaining = template.fields.filter((field) => field.id !== fieldId);
    onChange((prev) => ({
      ...prev,
      fields: prev.fields.filter((field) => field.id !== fieldId)
    }));
    setSelectedFieldId(remaining[0]?.id ?? null);
  };

  const handleReorderFields = (fromIndex: number, toIndex: number) => {
    if (template.fields.length === 0) {
      return;
    }

    const clampedIndex = Math.min(Math.max(toIndex, 0), template.fields.length - 1);
    if (fromIndex === clampedIndex) {
      return;
    }

    onChange((prev) => ({
      ...prev,
      fields: arrayMove(prev.fields, fromIndex, clampedIndex)
    }));
  };

  const validationErrors = useMemo(() => autosave.validationErrors, [autosave.validationErrors]);

  return (
    <div className="builder">
      <header className="builder-header">
        <div className="builder-header__title-group">
          <div className="builder-header__inputs">
            <label htmlFor="template-name" style={{ fontWeight: 600 }}>
              Template name
              <input
                id="template-name"
                type="text"
                value={template.name}
                onChange={handleTemplateNameChange}
                placeholder="Enter a template name"
              />
            </label>
            <label htmlFor="template-description" style={{ fontWeight: 600 }}>
              Description
              <textarea
                id="template-description"
                value={template.description ?? ''}
                onChange={handleDescriptionChange}
                placeholder="Outline the purpose of this template"
              />
            </label>
          </div>
          {validationErrors.length > 0 && (
            <ul className="validation-errors">
              {validationErrors.map((error, index) => (
                <li key={`${error}-${index}`}>{error}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="builder-header__status">
          <AutosaveBadge autosave={autosave} />
          <div className="mode-toggle" role="group" aria-label="Builder mode">
            <button
              type="button"
              className={`mode-toggle__button ${mode === 'visual' ? 'mode-toggle__button--active' : ''}`.trim()}
              onClick={() => onModeChange('visual')}
              aria-pressed={mode === 'visual'}
            >
              Visual builder
            </button>
            <button
              type="button"
              className={`mode-toggle__button ${mode === 'form' ? 'mode-toggle__button--active' : ''}`.trim()}
              onClick={() => onModeChange('form')}
              aria-pressed={mode === 'form'}
            >
              Form builder
            </button>
          </div>
        </div>
      </header>

      <div className="builder-body">
        {mode === 'visual' ? (
          <VisualBuilder
            template={template}
            selectedFieldId={selectedFieldId}
            onSelectField={setSelectedFieldId}
            onInsertField={handleInsertField}
            onUpdateField={handleUpdateField}
            onRemoveField={handleRemoveField}
            onReorderFields={handleReorderFields}
          />
        ) : (
          <FormBuilder
            template={template}
            onInsertField={handleInsertField}
            onUpdateField={handleUpdateField}
            onRemoveField={handleRemoveField}
            onMoveField={handleReorderFields}
          />
        )}
      </div>
    </div>
  );
};

export default TemplateBuilder;

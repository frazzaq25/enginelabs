import { NoteTemplate } from '../types';

type TemplateSelectorProps = {
  templates: NoteTemplate[];
  selectedTemplateId?: string;
  onSelect: (templateId: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
};

export const TemplateSelector = ({
  templates,
  selectedTemplateId,
  onSelect,
  disabled,
  isLoading
}: TemplateSelectorProps) => {
  return (
    <div className="selector-group" aria-label="template-selector">
      <label htmlFor="template-select">Template</label>
      <select
        id="template-select"
        data-testid="template-select"
        disabled={disabled || isLoading}
        value={selectedTemplateId ?? ''}
        onChange={(event) => onSelect(event.target.value)}
      >
        <option value="" disabled>
          {isLoading ? 'Loading templates…' : 'Select a template'}
        </option>
        {templates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.name}
          </option>
        ))}
      </select>
      {selectedTemplateId ? (
        <p className="field-helper" data-testid="template-description">
          {templates.find((tpl) => tpl.id === selectedTemplateId)?.description ?? 'Template description not available.'}
        </p>
      ) : null}
    </div>
  );
};

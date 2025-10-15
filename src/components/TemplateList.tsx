import { TemplateSummary } from '../types/template';

interface TemplateListProps {
  templates: TemplateSummary[];
  activeTemplateId: string | null;
  onSelect: (templateId: string) => void;
  onCreate: () => void;
  isLoading?: boolean;
}

const formatTimestamp = (iso: string): string => {
  try {
    const date = new Date(iso);
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch (error) {
    return iso;
  }
};

export const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  activeTemplateId,
  onSelect,
  onCreate,
  isLoading = false
}) => {
  return (
    <aside className="sidebar" aria-label="Template management sidebar">
      <div className="sidebar__header">
        <h1 className="sidebar__title">Templates</h1>
        <div className="sidebar__actions">
          <button type="button" className="primary-button" onClick={onCreate}>
            New template
          </button>
        </div>
      </div>
      <div className="sidebar__content" role="list">
        {isLoading && <p>Loading templates…</p>}
        {!isLoading && templates.length === 0 && (
          <p>No templates yet. Create one to get started.</p>
        )}
        {!isLoading &&
          templates.map((template) => {
            const isActive = template.id === activeTemplateId;
            return (
              <button
                key={template.id}
                type="button"
                role="listitem"
                className={`template-card ${isActive ? 'template-card--active' : ''}`.trim()}
                onClick={() => onSelect(template.id)}
                aria-pressed={isActive}
              >
                <p className="template-card__name">{template.name}</p>
                <p className="template-card__meta">
                  <span>{template.fieldCount} fields</span>
                  <span>{formatTimestamp(template.updatedAt)}</span>
                </p>
              </button>
            );
          })}
      </div>
    </aside>
  );
};

export default TemplateList;

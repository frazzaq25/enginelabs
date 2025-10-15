import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { templateApi } from './api/templateApi';
import { useTemplateAutosave } from './hooks/useTemplateAutosave';
import TemplateList from './components/TemplateList';
import TemplateBuilder from './components/builder/TemplateBuilder';
import { BuilderMode, Template, TemplateSummary } from './types/template';

const sortTemplates = (templates: TemplateSummary[]): TemplateSummary[] =>
  [...templates].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

const App: React.FC = () => {
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [workingTemplate, setWorkingTemplate] = useState<Template | null>(null);
  const [mode, setMode] = useState<BuilderMode>('visual');
  const [isListLoading, setIsListLoading] = useState(true);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasSelectedRef = useRef(false);

  const handleSelectTemplate = useCallback(async (templateId: string) => {
    hasSelectedRef.current = true;
    setError(null);
    setIsTemplateLoading(true);
    try {
      const template = await templateApi.getTemplate(templateId);
      setWorkingTemplate(template);
      setActiveTemplateId(templateId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load template');
    } finally {
      setIsTemplateLoading(false);
    }
  }, []);

  const handleCreateTemplate = useCallback(async () => {
    hasSelectedRef.current = true;
    setError(null);
    setIsTemplateLoading(true);
    try {
      const created = await templateApi.createTemplate({});
      setTemplates((prev) =>
        sortTemplates([
          {
            id: created.id,
            name: created.name,
            description: created.description,
            updatedAt: created.updatedAt,
            fieldCount: created.fields.length
          },
          ...prev
        ])
      );
      setWorkingTemplate(created);
      setActiveTemplateId(created.id);
      setMode('visual');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
    } finally {
      setIsTemplateLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsListLoading(true);
    templateApi
      .listTemplates()
      .then((items) => {
        if (cancelled) return;
        setTemplates(sortTemplates(items));
        setIsListLoading(false);
        if (!hasSelectedRef.current && items.length > 0) {
          void handleSelectTemplate(items[0].id);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Unable to load templates');
        setIsListLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [handleSelectTemplate]);

  const saveTemplate = useCallback(async (template: Template) => {
    const saved = await templateApi.updateTemplate(template);
    setTemplates((prev) => {
      const updated = prev.map((item) =>
        item.id === saved.id
          ? {
              ...item,
              name: saved.name,
              description: saved.description,
              updatedAt: saved.updatedAt,
              fieldCount: saved.fields.length
            }
          : item
      );
      return sortTemplates(updated);
    });
    setWorkingTemplate(saved);
    return saved;
  }, []);

  const autosave = useTemplateAutosave(workingTemplate, saveTemplate, { delayMs: 900 });

  const handleTemplateChange = useCallback((updater: (template: Template) => Template) => {
    setWorkingTemplate((prev) => (prev ? updater(prev) : prev));
  }, []);

  const workspaceContent = useMemo(() => {
    if (error) {
      return (
        <div className="workspace__empty" role="alert">
          <h2>Something went wrong</h2>
          <p>{error}</p>
        </div>
      );
    }

    if (isTemplateLoading) {
      return (
        <div className="workspace__empty">
          <p>Loading template…</p>
        </div>
      );
    }

    if (!workingTemplate) {
      return (
        <div className="workspace__empty">
          <h2>Select or create a template</h2>
          <p>
            Choose a template from the list to start editing, or create a new one to design from
            scratch.
          </p>
        </div>
      );
    }

    return (
      <TemplateBuilder
        template={workingTemplate}
        mode={mode}
        autosave={autosave}
        onModeChange={setMode}
        onChange={handleTemplateChange}
      />
    );
  }, [autosave, error, handleTemplateChange, isTemplateLoading, mode, workingTemplate]);

  return (
    <div className="app-shell">
      <TemplateList
        templates={templates}
        activeTemplateId={activeTemplateId}
        onSelect={handleSelectTemplate}
        onCreate={handleCreateTemplate}
        isLoading={isListLoading}
      />
      <main className="workspace">{workspaceContent}</main>
    </div>
  );
};

export default App;

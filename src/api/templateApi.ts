import { Template, TemplateField, TemplateSummary } from '../types/template';
import { createId } from '../utils/id';

const latency = (ms = 240) => new Promise((resolve) => setTimeout(resolve, ms));

const store = new Map<string, Template>();

const cloneTemplate = (template: Template): Template =>
  JSON.parse(JSON.stringify(template)) as Template;

const toSummary = (template: Template): TemplateSummary => ({
  id: template.id,
  name: template.name,
  description: template.description,
  updatedAt: template.updatedAt,
  fieldCount: template.fields.length
});

const buildSampleTemplates = (): Template[] => {
  const now = new Date();
  const older = new Date(now.getTime() - 1000 * 60 * 60 * 24);

  const onboarding: Template = {
    id: createId(),
    name: 'Customer onboarding',
    description: 'Capture core customer information for account provisioning.',
    updatedAt: now.toISOString(),
    fields: [
      {
        id: createId(),
        type: 'text',
        label: 'Full name',
        required: true,
        placeholder: 'Jane Smith',
        multiline: false
      },
      {
        id: createId(),
        type: 'dropdown',
        label: 'Company size',
        required: true,
        options: ['1-10', '11-50', '51-200', '201-500', '500+'],
        allowCustom: false
      },
      {
        id: createId(),
        type: 'richText',
        label: 'Implementation notes',
        required: false,
        helpText: 'Record important onboarding context and open questions.',
        config: {
          allowBold: true,
          allowItalic: true,
          allowImages: true
        }
      }
    ]
  };

  const qbr: Template = {
    id: createId(),
    name: 'Quarterly business review',
    description: 'Guided structure for quarterly success reviews.',
    updatedAt: older.toISOString(),
    fields: [
      {
        id: createId(),
        type: 'date',
        label: 'Review date',
        required: true
      },
      {
        id: createId(),
        type: 'table',
        label: 'Key metrics',
        required: true,
        columns: [
          { id: createId(), label: 'Metric' },
          { id: createId(), label: 'Target' },
          { id: createId(), label: 'Actual' }
        ],
        defaultRows: 3,
        allowInlineAdd: true
      },
      {
        id: createId(),
        type: 'number',
        label: 'Customer health score',
        required: true,
        min: 0,
        max: 100,
        unit: 'pts'
      }
    ]
  };

  return [onboarding, qbr];
};

const resetStore = () => {
  store.clear();
  for (const template of buildSampleTemplates()) {
    store.set(template.id, cloneTemplate(template));
  }
};

resetStore();

export const templateApi = {
  async listTemplates(): Promise<TemplateSummary[]> {
    await latency(180);
    return Array.from(store.values())
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
      .map(toSummary);
  },

  async getTemplate(id: string): Promise<Template> {
    await latency();
    const template = store.get(id);
    if (!template) {
      throw new Error('Template not found');
    }

    return cloneTemplate(template);
  },

  async createTemplate(input: {
    name?: string;
    description?: string;
    fields?: TemplateField[];
  }): Promise<Template> {
    await latency(120);
    const timestamp = new Date().toISOString();
    const template: Template = {
      id: createId(),
      name: input.name?.trim() || 'Untitled template',
      description: input.description,
      updatedAt: timestamp,
      fields:
        input.fields && input.fields.length > 0
          ? input.fields.map((field) => ({ ...field }))
          : [
              {
                id: createId(),
                type: 'text',
                label: 'Title',
                required: true,
                placeholder: 'Enter a value',
                multiline: false
              }
            ]
    };

    store.set(template.id, cloneTemplate(template));
    return cloneTemplate(template);
  },

  async updateTemplate(template: Template): Promise<Template> {
    await latency();
    if (!store.has(template.id)) {
      throw new Error('Template not found');
    }

    const next: Template = {
      ...cloneTemplate(template),
      updatedAt: new Date().toISOString()
    };

    store.set(template.id, cloneTemplate(next));
    return cloneTemplate(next);
  },

  async removeTemplate(id: string): Promise<void> {
    await latency(120);
    store.delete(id);
  },

  __reset(): void {
    resetStore();
  }
};

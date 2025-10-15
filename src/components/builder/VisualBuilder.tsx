import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
  useDraggable
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Template, TemplateField } from '../../types/template';
import { FieldDescriptor, FIELD_LIBRARY } from '../../constants/fieldLibrary';
import FieldEditor from './FieldEditor';

interface VisualBuilderProps {
  template: Template;
  selectedFieldId: string | null;
  onSelectField: (fieldId: string) => void;
  onInsertField: (factory: () => TemplateField, index?: number) => void;
  onUpdateField: (next: TemplateField) => void;
  onRemoveField: (fieldId: string) => void;
  onReorderFields: (fromIndex: number, toIndex: number) => void;
}

const PaletteItem: React.FC<{
  descriptor: FieldDescriptor;
  onInsert: () => void;
}> = ({ descriptor, onInsert }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${descriptor.type}`,
    data: {
      source: 'palette',
      descriptor
    }
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform)
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`palette-item ${isDragging ? 'palette-item--dragging' : ''}`.trim()}
      data-testid={`palette-item-${descriptor.type}`}
    >
      <div>
        <p className="palette-item__title">{descriptor.name}</p>
        <p className="palette-item__description">{descriptor.description}</p>
      </div>
      <div className="palette-item__actions">
        <button
          type="button"
          className="palette-item__button"
          onClick={onInsert}
          aria-label={`Add ${descriptor.name}`}
        >
          Add
        </button>
        <button type="button" className="inline-button" {...listeners} {...attributes}>
          Drag
        </button>
      </div>
    </div>
  );
};

const SortableFieldCard: React.FC<{
  field: TemplateField;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}> = ({ field, isSelected, onSelect, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
    data: {
      source: 'canvas'
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        `field-card ${isSelected ? 'field-card--selected' : ''} ${
          isDragging ? 'field-card--dragging' : ''
        }`.trim()
      }
      onClick={onSelect}
    >
      <div className="field-card__info">
        <p className="field-card__label">{field.label || 'Untitled field'}</p>
        <span className="field-card__meta">{field.type}</span>
      </div>
      <div className="field-card__actions">
        <button
          type="button"
          className="icon-button"
          aria-label={`Move ${field.label}`}
          {...listeners}
          {...attributes}
        >
          ≡
        </button>
        <button
          type="button"
          className="icon-button icon-button--danger"
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${field.label}`}
        >
          ×
        </button>
      </div>
    </div>
  );
};

const PalettePreview: React.FC<{ descriptor: FieldDescriptor }> = ({ descriptor }) => (
  <div className="field-card">
    <div className="field-card__info">
      <p className="field-card__label">{descriptor.name}</p>
      <span className="field-card__meta">{descriptor.type}</span>
    </div>
  </div>
);

const DraggedFieldPreview: React.FC<{ field: TemplateField | null }> = ({ field }) => {
  if (!field) return null;
  return (
    <div className="field-card field-card--dragging">
      <div className="field-card__info">
        <p className="field-card__label">{field.label}</p>
        <span className="field-card__meta">{field.type}</span>
      </div>
    </div>
  );
};

export const VisualBuilder: React.FC<VisualBuilderProps> = ({
  template,
  selectedFieldId,
  onSelectField,
  onInsertField,
  onUpdateField,
  onRemoveField,
  onReorderFields
}) => {
  const [activePaletteItem, setActivePaletteItem] = useState<FieldDescriptor | null>(null);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);

  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-dropzone',
    data: { source: 'canvas', index: template.fields.length }
  });

  const fields = template.fields;

  const activeField = useMemo(
    () => fields.find((field) => field.id === activeFieldId) ?? null,
    [fields, activeFieldId]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const source = event.active.data.current?.source;
    if (source === 'palette') {
      setActivePaletteItem(event.active.data.current?.descriptor ?? null);
    }
    if (source === 'canvas') {
      setActiveFieldId(String(event.active.id));
    }
  };

  const deriveTargetIndex = (event: DragEndEvent) => {
    const over = event.over;
    if (!over) {
      return fields.length;
    }

    const sortableData = over.data.current?.sortable;
    if (typeof sortableData?.index === 'number') {
      return sortableData.index;
    }

    const explicitIndex = over.data.current?.index;
    if (typeof explicitIndex === 'number') {
      return explicitIndex;
    }

    const overIndex = fields.findIndex((field) => field.id === over.id);
    return overIndex >= 0 ? overIndex : fields.length;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active } = event;
    const source = active.data.current?.source;

    setActivePaletteItem(null);
    setActiveFieldId(null);

    if (!event.over) {
      return;
    }

    const targetIndex = deriveTargetIndex(event);

    if (source === 'palette') {
      const descriptor: FieldDescriptor | undefined = active.data.current?.descriptor;
      if (descriptor) {
        onInsertField(descriptor.create, targetIndex);
      }
      return;
    }

    if (source === 'canvas') {
      const fromIndex = fields.findIndex((field) => field.id === active.id);
      if (fromIndex >= 0 && targetIndex >= 0 && fromIndex !== targetIndex) {
        onReorderFields(fromIndex, targetIndex);
      }
    }
  };

  const selectedField = fields.find((field) => field.id === selectedFieldId) ?? null;

  return (
    <div className="visual-builder">
      <section aria-label="Field palette" className="visual-builder__palette">
        <h2>Field library</h2>
        <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>
          Drag fields into the canvas or click Add to insert them instantly.
        </p>
        <div className="palette-list">
          {FIELD_LIBRARY.map((descriptor) => (
            <PaletteItem
              key={descriptor.type}
              descriptor={descriptor}
              onInsert={() => onInsertField(descriptor.create)}
            />
          ))}
        </div>
      </section>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <section
          ref={setNodeRef}
          className={`visual-builder__canvas ${
            fields.length === 0 ? 'visual-builder__canvas--empty' : ''
          } ${isOver ? 'visual-builder__canvas--active' : ''}`.trim()}
          aria-label="Template canvas"
        >
          <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
            {fields.length === 0 && <p>Drag components here to start building your template.</p>}
            {fields.map((field) => (
              <SortableFieldCard
                key={field.id}
                field={field}
                isSelected={field.id === selectedFieldId}
                onSelect={() => onSelectField(field.id)}
                onRemove={() => onRemoveField(field.id)}
              />
            ))}
          </SortableContext>
        </section>
        <DragOverlay>
          {activePaletteItem ? (
            <PalettePreview descriptor={activePaletteItem} />
          ) : (
            <DraggedFieldPreview field={activeField} />
          )}
        </DragOverlay>
      </DndContext>

      <section className="visual-builder__config" aria-label="Field configuration">
        {selectedField ? (
          <>
            <h2 style={{ marginTop: 0 }}>{selectedField.label || 'Configure field'}</h2>
            <FieldEditor
              field={selectedField}
              onChange={onUpdateField}
              onRemove={() => onRemoveField(selectedField.id)}
            />
          </>
        ) : (
          <div className="config-panel__empty">
            <p>Select a field to configure its settings.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default VisualBuilder;

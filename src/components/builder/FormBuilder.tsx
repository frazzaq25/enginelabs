import { Template, TemplateField } from '../../types/template';
import { FIELD_LIBRARY } from '../../constants/fieldLibrary';
import FieldEditor from './FieldEditor';

export interface FormBuilderProps {
  template: Template;
  onInsertField: (factory: () => TemplateField, index?: number) => void;
  onUpdateField: (field: TemplateField) => void;
  onRemoveField: (fieldId: string) => void;
  onMoveField: (fromIndex: number, toIndex: number) => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  template,
  onInsertField,
  onUpdateField,
  onRemoveField,
  onMoveField
}) => {
  const fields = template.fields;

  return (
    <section className="form-builder" aria-label="Form-based template builder">
      <p className="form-builder__description">
        Configure every field with structured inputs. Updates here are synchronised with the
        visual drag-and-drop canvas.
      </p>

      {fields.map((field, index) => (
        <article className="form-builder__item" key={field.id} aria-label={`Field ${index + 1}`}>
          <div className="form-builder__item-header">
            <h3 style={{ margin: 0 }}>{field.label || `Field ${index + 1}`}</h3>
            <div className="field-card__actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => onMoveField(index, index - 1)}
                disabled={index === 0}
              >
                ↑
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => onMoveField(index, index + 1)}
                disabled={index === fields.length - 1}
              >
                ↓
              </button>
              <button
                type="button"
                className="icon-button icon-button--danger"
                onClick={() => onRemoveField(field.id)}
                aria-label={`Remove ${field.label}`}
              >
                ×
              </button>
            </div>
          </div>
          <FieldEditor
            field={field}
            onChange={onUpdateField}
            variant="inline"
            showRemoveAction={false}
          />
        </article>
      ))}

      <div>
        <h3 style={{ margin: '0 0 0.5rem' }}>Add another field</h3>
        <div className="form-builder__palette">
          {FIELD_LIBRARY.map((descriptor) => (
            <button
              key={`form-add-${descriptor.type}`}
              type="button"
              onClick={() => onInsertField(descriptor.create)}
            >
              + {descriptor.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FormBuilder;

import { useEffect, useRef } from 'react';

type RichTextEditorProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
};

const applyFormattingCommand = (command: string) => {
  try {
    document.execCommand(command);
  } catch (error) {
    // execCommand is deprecated but widely supported; swallow failures silently
  }
};

export const RichTextEditor = ({
  id,
  label,
  value,
  onChange,
  disabled,
  required,
  helperText
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    const nextValue = value ?? '';
    if (editorRef.current.innerHTML !== nextValue) {
      editorRef.current.innerHTML = nextValue;
    }
  }, [value]);

  const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    onChange(target.innerHTML);
  };

  return (
    <div className="field-group">
      <div className="field-label">
        <label htmlFor={id}>
          {label}
          {required ? ' *' : ''}
        </label>
      </div>
      {helperText ? <span className="field-helper">{helperText}</span> : null}
      <div className="rich-text-editor" data-testid={`${id}-rte`}>
        <div className="rich-text-editor-toolbar" role="toolbar" aria-label={`${label} formatting`}>
          <button type="button" onClick={() => applyFormattingCommand('bold')} disabled={disabled} aria-label="Bold">
            B
          </button>
          <button type="button" onClick={() => applyFormattingCommand('italic')} disabled={disabled} aria-label="Italic">
            I
          </button>
          <button type="button" onClick={() => applyFormattingCommand('underline')} disabled={disabled} aria-label="Underline">
            U
          </button>
        </div>
        <div
          id={id}
          ref={editorRef}
          role="textbox"
          aria-multiline="true"
          className="rich-text-editor-content"
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={handleInput}
          data-testid={`${id}-rte-input`}
        />
      </div>
    </div>
  );
};

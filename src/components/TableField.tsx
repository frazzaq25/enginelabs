import { TableColumn } from '../types';

type TableFieldProps = {
  id: string;
  label: string;
  columns: TableColumn[];
  rows: Array<Record<string, string>>;
  onChange: (rows: Array<Record<string, string>>) => void;
  minRows?: number;
  disabled?: boolean;
  helperText?: string;
};

const createEmptyRow = (columns: TableColumn[]) =>
  columns.reduce<Record<string, string>>((acc, column) => {
    acc[column.key] = '';
    return acc;
  }, {});

export const TableField = ({
  id,
  label,
  columns,
  rows,
  onChange,
  minRows = 0,
  disabled,
  helperText
}: TableFieldProps) => {
  const handleCellChange = (rowIndex: number, key: string, value: string) => {
    const nextRows = rows.map((row, index) => (index === rowIndex ? { ...row, [key]: value } : row));
    onChange(nextRows);
  };

  const handleAddRow = () => {
    onChange([...rows, createEmptyRow(columns)]);
  };

  const handleRemoveRow = (rowIndex: number) => {
    if (rows.length <= minRows) {
      return;
    }
    onChange(rows.filter((_, index) => index !== rowIndex));
  };

  return (
    <div className="field-group">
      <div className="field-label">
        <label htmlFor={id}>{label}</label>
        {helperText ? <span className="field-helper">{helperText}</span> : null}
      </div>
      <div className="table-field" role="group" aria-labelledby={id}>
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1}>
                  <em>No entries yet.</em>
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr key={`${id}-row-${rowIndex}`}>
                  {columns.map((column) => (
                    <td key={column.key}>
                      <input
                        aria-label={`${label} ${column.label} row ${rowIndex + 1}`}
                        type={column.type === 'number' ? 'number' : column.type === 'date' ? 'date' : 'text'}
                        value={row[column.key] ?? ''}
                        disabled={disabled}
                        onChange={(event) => handleCellChange(rowIndex, column.key, event.target.value)}
                      />
                    </td>
                  ))}
                  <td>
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(rowIndex)}
                      disabled={disabled || rows.length <= minRows}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="table-field-actions">
          <span>
            {minRows > 0 ? `Minimum rows: ${minRows}` : 'Add rows as needed'}
          </span>
          <button type="button" onClick={handleAddRow} disabled={disabled}>
            Add Row
          </button>
        </div>
      </div>
    </div>
  );
};

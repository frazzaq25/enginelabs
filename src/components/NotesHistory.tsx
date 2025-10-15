import { ProviderNoteDetail, ProviderNoteStatus, ProviderNoteSummary } from '../types';

const formatDateTime = (value: string) => new Date(value).toLocaleString();

const statusLabel: Record<ProviderNoteStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  signed: 'Signed'
};

type NotesHistoryProps = {
  notes: ProviderNoteSummary[];
  selectedNoteId?: string;
  onSelect: (noteId: string) => void;
  onClearSelection: () => void;
  noteDetail?: ProviderNoteDetail;
  isLoading?: boolean;
};

export const NotesHistory = ({
  notes,
  selectedNoteId,
  onSelect,
  onClearSelection,
  noteDetail,
  isLoading
}: NotesHistoryProps) => {
  return (
    <div className="panel-card" aria-label="patient-notes-history">
      <div className="field-label">
        <h2>Patient Notes</h2>
        {isLoading ? <span className="field-helper">Loading history…</span> : null}
      </div>
      <div className="notes-list">
        {notes.length === 0 && !isLoading ? <p>No previous notes for this patient.</p> : null}
        {notes.map((note) => (
          <button
            key={note.id}
            type="button"
            className={note.id === selectedNoteId ? 'selected' : ''}
            onClick={() => onSelect(note.id)}
          >
            <div className={`status-pill ${note.status}`}>
              {statusLabel[note.status] ?? note.status}
            </div>
            <div>
              <strong>{note.templateName}</strong>
            </div>
            <div className="field-helper">Created {formatDateTime(note.createdAt)}</div>
          </button>
        ))}
      </div>
      {noteDetail ? (
        <div className="note-detail" data-testid="note-detail">
          <div className={`status-pill ${noteDetail.status}`}>{statusLabel[noteDetail.status] ?? noteDetail.status}</div>
          <h3>{noteDetail.templateName}</h3>
          <p className="field-helper">Authored by {noteDetail.author}</p>
          <p className="field-helper">Last updated {formatDateTime(noteDetail.updatedAt)}</p>
          <div>
            {Object.entries(noteDetail.data).map(([key, value]) => {
              if (Array.isArray(value)) {
                const rows = value as Array<Record<string, unknown>>;
                const columnKeys = Object.keys(rows[0] ?? {});
                return (
                  <div key={key} className="field-group">
                    <strong>{key}</strong>
                    <div>
                      <table>
                        <thead>
                          <tr>
                            {columnKeys.map((columnKey) => (
                              <th key={columnKey}>{columnKey}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, rowIndex) => (
                            <tr key={`${key}-${rowIndex}`}>
                              {columnKeys.map((columnKey) => (
                                <td key={columnKey}>{String(row[columnKey] ?? '')}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              }

              if (typeof value === 'string') {
                return (
                  <div key={key} className="field-group">
                    <strong>{key}</strong>
                    <div dangerouslySetInnerHTML={{ __html: value }} />
                  </div>
                );
              }

              return (
                <div key={key} className="field-group">
                  <strong>{key}</strong>
                  <span>{JSON.stringify(value)}</span>
                </div>
              );
            })}
          </div>
          <button type="button" onClick={onClearSelection}>
            Close note
          </button>
        </div>
      ) : null}
    </div>
  );
};

import React from 'react';
import { MdSave, MdClose, MdDelete } from 'react-icons/md';
import { Note } from '../../types';

interface NoteEditorProps {
  note: Note;
  content: string;
  setContent: (content: string) => void;
  onSave: () => void;
  onClose: () => void;
  onDelete: (noteId: string) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, content, setContent, onSave, onClose, onDelete }) => {
  return (
    <div className="tooltip-note" onClick={(e) => e.stopPropagation()}>
      <div className="note-original-text">
      </div>
      <textarea
        rows={5}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your note here..."
      />
      <div className="note-action-group">
        <button className="note-action-btn danger" onClick={() => onDelete(note.id)}>
          <MdDelete /> Delete Note
        </button>
        <button className="note-action-btn" onClick={onClose}><MdClose /> Close</button>
        <button className="note-action-btn" onClick={onSave}><MdSave /> Save</button>
      </div>
    </div>
  );
};

export default NoteEditor;
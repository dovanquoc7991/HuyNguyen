import React from 'react';
import { MdDeleteOutline, MdDeleteSweep } from 'react-icons/md';
import { HighlightActionState } from '../../types';

interface ActionToolbarProps {
  state: HighlightActionState;
  onDeleteHighlight: () => void;
  onDeleteAllHighlights?: () => void;
  onDeleteAllNotes?: () => void;
  showDeleteHighlight?: boolean;
  showDeleteAllHighlights?: boolean;
  showDeleteAllNotes?: boolean;
}

const ActionToolbar: React.FC<ActionToolbarProps> = ({ state,
  onDeleteHighlight,
  onDeleteAllHighlights,
  onDeleteAllNotes,
  showDeleteHighlight = true,
  showDeleteAllHighlights = true,
  showDeleteAllNotes = true, }) => {
  if (!state.visible) return null;

  const isNote = state.element?.classList.contains('note-wrapper');

  return (
    <div
      className="popup-toolbar"
      style={{ top: state.top, left: state.left, transform: 'translateY(-100%)' }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {showDeleteHighlight && !isNote && (
        <button className="popup-btn danger" onClick={onDeleteHighlight}>
          <MdDeleteOutline /> Delete This
        </button>
      )}
      {showDeleteAllHighlights && !isNote && (
        <button className="popup-btn danger" onClick={onDeleteAllHighlights}>
          <MdDeleteSweep /> Delete All Highlights
        </button>
      )}
      {showDeleteAllNotes && !isNote && (
        <button className="popup-btn danger" onClick={onDeleteAllNotes}>
          <MdDeleteSweep /> Delete All Notes
        </button>
      )}
    </div>
  );
};

export default ActionToolbar;
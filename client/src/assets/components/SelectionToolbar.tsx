import React from 'react';
import { MdHighlight, MdEditNote, MdTranslate } from 'react-icons/md';
import { PopupState } from '../../types';

interface SelectionToolbarProps {
  position: PopupState;
  onHighlight: () => void;
  onNote: () => void;
  onTranslate: () => void;
}

const SelectionToolbar: React.FC<SelectionToolbarProps> = ({ position, onHighlight, onNote, onTranslate }) => {
  if (!position.visible) return null;

  return (
    <div
      className="popup-toolbar"
      style={{ top: position.top, left: position.left, transform: 'translateY(-100%)' }}
      onMouseDown={(e) => e.preventDefault()} // Ngăn việc mất selection khi click
    >
      <button className="popup-btn" onClick={onHighlight}><MdHighlight /> Highlight</button>
      <button className="popup-btn" onClick={onNote}><MdEditNote /> Add Note</button>
      <hr className="popup-divider" />
      <button className="popup-btn" onClick={onTranslate}><MdTranslate /> Translate</button>
    </div>
  );
};

export default SelectionToolbar;
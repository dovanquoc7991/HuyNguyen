import React from 'react';
import { MdClose, MdTranslate } from 'react-icons/md';
import '../css/PassagePanel.css'; // Reuse some styles

interface TranslationPopupProps {
  visible: boolean;
  top: number;
  left: number;
  originalText: string;
  translatedText: string;
  position?: 'above' | 'below';
  onClose: () => void;
}

const TranslationPopup: React.FC<TranslationPopupProps> = ({
  visible,
  top,
  left,
  originalText,
  translatedText,
  position = 'below', // Mặc định là 'below'
  onClose,
}) => {
  if (!visible) return null;

  return (
    <div
      className="tooltip-note"
      style={{
        // Căn giữa màn hình
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',

        // Giới hạn kích thước và cho phép cuộn
        maxWidth: '450px',
        maxHeight: '80vh', // Giới hạn chiều cao tối đa là 80% chiều cao màn hình
        width: 'auto',
        minWidth: '300px',
        overflowY: 'auto', // Áp dụng thanh cuộn cho toàn bộ popup

        zIndex: 1002, // Above note editor
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ position: 'relative', paddingBottom: '10px', borderBottom: '1px solid #eee', marginBottom: '10px', flexShrink: 0 }}>
        <h4 style={{ margin: 0, color: '#555', fontSize: '14px', fontWeight: 600 }}>
          Original Text
        </h4>
        <p style={{ margin: '4px 0 0', fontSize: '15px', color: '#333' }}>
          "{originalText}"
        </p>
      </div>

      <div style={{ position: 'relative' }}>
        <h4 style={{ margin: 0, color: '#2e7d32', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MdTranslate /> Vietnamese
        </h4>
        <p style={{ margin: '4px 0 0', fontSize: '15px', color: '#1a5e20', fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
          {translatedText}
        </p>
      </div>

      <div className="note-action-group" style={{ marginTop: '16px', flexShrink: 0, borderTop: '1px solid #eee', paddingTop: '16px' }}>
        <button className="note-action-btn" onClick={onClose}>
          <MdClose /> Close
        </button>
      </div>
    </div>
  );
};

export default TranslationPopup;
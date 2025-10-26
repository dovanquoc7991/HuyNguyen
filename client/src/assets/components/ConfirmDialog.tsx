import React from "react";
import "../css/ConfirmDialog.css"; // Import file CSS tùy chỉnh

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="confirm-dialog-backdrop">
      <div className="confirm-dialog">
        <button className="confirm-dialog-close" onClick={onCancel}>
          ×
        </button>
        <div className="confirm-dialog-title">
          Are you ready to submit your test?
        </div>
        <div className="confirm-dialog-message">
          Once you submit, you will not be able to make any further changes. Please
          review your answers carefully before proceeding. If you are ready, click
          Submit to complete your test.
        </div>
        <div className="confirm-dialog-actions">
          <button className="confirm-btn submit" onClick={onConfirm}>
            Submit now
          </button>
          <button className="confirm-btn cancel" onClick={onCancel}>
            Check again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
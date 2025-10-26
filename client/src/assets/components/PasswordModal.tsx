import React, { useState, useEffect } from "react";
import { FaLock, FaUnlock } from "react-icons/fa";

interface PasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  error?: string;
}

const PasswordModal: React.FC<PasswordModalProps> = ({
  open,
  onClose,
  onSubmit,
  error,
}) => {
  const [pw, setPw] = useState("");

  useEffect(() => {
    if (open) setPw("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm animate-scale-in">
        <div className="flex items-center gap-2 mb-4">
          <FaLock className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Enter password to unlock
          </h3>
        </div>

        <input
          type="password"
          placeholder="Enter your password..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all mb-2 text-sm"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoFocus
        />

        {error && (
          <div className="text-sm text-red-500 mb-2">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1 transition"
            onClick={() => onSubmit(pw)}
          >
            <FaUnlock size={12} />
            Unlock
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;

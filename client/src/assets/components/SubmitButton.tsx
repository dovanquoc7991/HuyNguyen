import React from "react";
import { FaCheck } from "react-icons/fa";
import "../css/SubmitButton.css";

interface SubmitButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ onClick, disabled }) => (
  <button
    id="submit-btn"
    onClick={onClick}
    disabled={disabled}
    aria-label="Nộp bài"
  >
    <FaCheck className="icon" />
    <span className="text">Submit</span>
  </button>
);

export default SubmitButton;

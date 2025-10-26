import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import '../css/BackButton.css';

const BackButton: React.FC = () => {
  return (
    <button className="back-btn" onClick={() => window.history.back()}>
      <FaArrowLeft className="icon" />
      Back
    </button>
  );
};

export default BackButton;
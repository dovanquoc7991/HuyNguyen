import React from "react";
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import '../css/QuestionNavButtons.css';
import type { Question } from "../pages/ReadingTestPage";

interface QuestionNavButtonsProps {
  current: number | string | null;
  questions: Question[];
  onChange: (newNumber: number | string) => void;
}

const QuestionNavButtons: React.FC<QuestionNavButtonsProps> = ({ current, questions, onChange }) => {
  if (!questions || questions.length === 0) return null;

  // Xác định số câu và blank hiện tại
  let qNum: number = 0;
  let blankNum: string | null = null;
  if (typeof current === "string" && current.includes("-")) {
    const [q, b] = current.split("-");
    qNum = Number(q);
    blankNum = b;
  } else if (typeof current === "number") {
    qNum = current;
  }

  const idx = questions.findIndex(q => q.number === qNum);

  // Hàm chuyển câu/blank
  const handleNavigate = (direction: "prev" | "next") => {
    if (idx === -1) return;
    const qObj = questions[idx];

    // Không phải FILL_BLANKS
    const newIdx = direction === "next" ? idx + 1 : idx - 1;
    if (newIdx >= 0 && newIdx < questions.length) {
      const nextQ = questions[newIdx];
      onChange(nextQ.number);
    }
  };

  return (
    <div className="fixed-nav flex gap-2">
      <button
        aria-label="Câu trước"
        onClick={() => handleNavigate("prev")}
        disabled={idx <= 0 && (!blankNum || blankNum === "1")}
        className="nav-button text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
      >
        <span className="flex items-center justify-center">
          <FaArrowLeft color="white" size={24} />
        </span>
      </button>
      <button
        aria-label="Câu sau"
        onClick={() => handleNavigate("next")}
        disabled={idx >= questions.length - 1}
        className="nav-button text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
      >
        <span className="flex items-center justify-center">
          <FaArrowRight color="white" size={24} />
        </span>
      </button>
    </div>
  );
};

export default QuestionNavButtons;
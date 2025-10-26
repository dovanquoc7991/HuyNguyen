import React from "react";
import type { Question } from "../pages/ReadingTestPage";
import { sanitizeContent } from "../lib/utils";

interface MatchingHeaderQuestionProps {
  questions: Question[];
  userAnswers: Record<string, string>;
  onChange: (qNum: string, value: string | null) => void;
  submitted: boolean;
  highlightedQ?: string | number | null;
}

const MatchingHeaderQuestion: React.FC<MatchingHeaderQuestionProps> = ({
  questions,
  userAnswers,
  onChange,
  submitted,
  highlightedQ,
}) => {
  return (
    <div className="matching-header-questions-container">
      {questions.map((q) => {
        const qNum = String(q.number);
        const value = userAnswers[qNum] || "";
        return (
          <div key={qNum} className="matching-header-question-item">
            <div
              className={
                "dragdrop-blank" +
                (highlightedQ == qNum ? " dragdrop-blank-highlight" : "")
              }
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (submitted) return;
                const dropped = e.dataTransfer.getData("text/plain");
                if (dropped) onChange(qNum, dropped);
              }}
            >
              {value ? (
                <span className="dragdrop-filled">
                  {value}
                  {!submitted && (
                    <button
                      className="dragdrop-remove"
                      onClick={() => onChange(qNum, null)}
                      type="button"
                    >
                      ×
                    </button>
                  )}
                </span>
              ) : (
                <span className="dragdrop-placeholder">Your answer</span>
              )}
            </div>
            <div className="question-text">
              <strong className={highlightedQ == qNum ? "qnum-highlight" : "qnum-normal"}>
                {qNum}.
              </strong>
              <div className="tinymce-content" dangerouslySetInnerHTML={{ __html: sanitizeContent(q.question) }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MatchingHeaderQuestion;

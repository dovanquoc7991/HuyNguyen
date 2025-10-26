import React from "react";
import type { Group, Question } from "../pages/ReadingTestPage";
import "../css/ProgressBar.css"; // Import CSS file for styling

interface Props {
  groups: Group[];
  getMultiRange: (q: Question) => { from: number; to: number };
  getMultiSquareColor: (q: Question, idx: number) => string;
  getSquareColor: (i: number | string) => string;
  setHighlightedQ: (n: number | string) => void;
}

const ProgressBar: React.FC<Props> = ({
  groups,
  getMultiRange,
  getMultiSquareColor,
  getSquareColor,
  setHighlightedQ,
}) => (
  <div id="progress-container">
    {groups.flatMap((group) =>
      group.questions.flatMap((q) => {
        const type = group.type;

        if (type === "MULTI") {
          const { from, to } = getMultiRange(q);
          const count = to - from + 1;
          return Array.from({ length: count }).map((_, idx) => (
            <div
              className="square"
              key={`${q.number}-multi-${idx}`}
              onClick={() => setHighlightedQ(q.number)}
              style={{ backgroundColor: getMultiSquareColor(q, idx) }}
            >
              {q.number + idx}
            </div>
          ));
        }

        return (
          <div
            className="square"
            key={q.number}
            onClick={() => setHighlightedQ(q.number)}
            style={{ backgroundColor: getSquareColor(q.number) }}
          >
            {q.number}
          </div>
        );
      })
    )}
  </div>
);

export default ProgressBar;

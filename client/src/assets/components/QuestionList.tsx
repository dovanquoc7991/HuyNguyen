import React from "react";
import type { Question, Group } from "../pages/ReadingTestPage";
import QuestionItem from "./QuestionItem";

interface Props {
  questions: Question[];
  groups: Group[];
  answers: Record<string, string | string[] | Record<string, string>>;
  submitted: boolean;
  highlightedQ: number | string | null;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string | string[] | Record<string, string>>>>;
  handleChange: (q: string, value: string) => void;
  setRef: (q: Question, el: HTMLDivElement | null) => void;
  availableMatchingHeaders?: string[]; // Prop mới
}

function getMultiRange(q: Question) {
  const match = q.question.match(/^(\d+)[–-](\d+)/);
  if (match) {
    const from = parseInt(match[1], 10);
    const to = parseInt(match[2], 10);
    return { from, to };
  }
  if (Array.isArray(q.answers)) {
    return { from: q.number, to: q.number + q.answers.length - 1 };
  }
  return { from: q.number, to: q.number };
}

const QuestionList: React.FC<Props> = ({
  questions, groups, answers, submitted, highlightedQ, setAnswers, handleChange, setRef, availableMatchingHeaders
}) => (
  <div id="questions">
    {questions.map((q) => {
      const group = groups.find(g =>
        Array.isArray(g.questions)
          ? g.questions.some((item: any) =>
            typeof item === "object"
              ? item.number === q.number
              : false
          )
          : false
      );
      if (!group) {
        throw new Error(`Không tìm thấy group cho câu hỏi số ${q.number}`);
      }
      const showInstruction =
        group &&
        Array.isArray(group.questions) &&
        group.questions.length > 0 &&
        (typeof group.questions[0] === "object"
          ? group.questions[0].number === q.number
          : false);
      const qKey = `${q.number}`;
      const isHighlighted =
        highlightedQ === q.number ||
        (typeof highlightedQ === "string" && String(highlightedQ).split("-")[0] === String(q.number));
      let multiRange = { from: q.number, to: q.number };
      // Lấy type từ group nếu có, ưu tiên group.type
      const type = group.type;
      if (type === 'MULTI') {
        multiRange = getMultiRange(q);
      }
      return (
        <QuestionItem
          key={qKey}
          q={q}
          group={group}
          showInstruction={!!showInstruction}
          qKey={qKey}
          isHighlighted={isHighlighted}
          multiRange={multiRange}
          answers={answers}
          submitted={submitted}
          handleChange={handleChange}
          setAnswers={setAnswers}
          setRef={el => setRef(q, el)}
          highlightedQ={highlightedQ}
          availableMatchingHeaders={availableMatchingHeaders}
        />
      );
    })}
  </div>
);

export default QuestionList;
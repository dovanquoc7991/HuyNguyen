import React from "react";
import type { Question, Group } from "../pages/ReadingTestPage";
import MatchTableQuestion from "./MatchTableQuestion";
import "../css/QuestionItem.css"; // Import your CSS file for styling
import DragDropQuestion from "./DragDropQuestion";
import FillBlanksQuestion from "./FillBlanksQuestion";
import MCQQuestion from "./MCQQuestion";
import TFNGQuestion from "./TFNGQuestion";
import MultiQuestion from "./MultiQuestion";
import { sanitizeContent } from "../lib/utils";

interface Props {
  q: Question;
  group: Group;
  showInstruction: boolean;
  qKey: string;
  isHighlighted: boolean;
  multiRange: { from: number; to: number };
  answers: Record<string, any>;
  submitted: boolean;
  handleChange: (q: string, value: string) => void;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  setRef: (el: HTMLDivElement | null) => void;
  highlightedQ?: string | number | null;
  availableMatchingHeaders?: string[];
}

const QuestionItem: React.FC<Props> = ({
  q, group, showInstruction, qKey, isHighlighted, multiRange, answers, submitted, handleChange, setAnswers, setRef, highlightedQ, availableMatchingHeaders
}) => {
  if (group.type === "FILL_BLANKS" && group.paragraph) {
    if (q.number !== group.questions[0].number) return null;
    return (
      <>
        {showInstruction && group && (
          <div className="question-instruction">
            <div style={{ fontWeight: 700, fontSize: '1em', marginBottom: 6 }}>
              {`Questions ${group.questions[0].number}–${group.questions[group.questions.length - 1].number}`}
            </div>
            {group.instruction && (
              <div className="tinymce-content" dangerouslySetInnerHTML={{ __html: sanitizeContent(group.instruction) }} />
            )}

          </div>
        )}

        {group.imgContent ? (
          <div className="flex flex-row items-start justify-start gap-4">
            {/* Bên trái: ảnh sát lề trái */}
            <div style={{ minWidth: 320 }}>
              <div
                className="question-paragraph tinymce-content"
                style={{ width: "100%", minHeight: 200, marginLeft: 0 }}
                dangerouslySetInnerHTML={{ __html: sanitizeContent(group.imgContent) }}
              />
            </div>
            {/* Bên phải: bảng nhỏ hơn, sát ảnh */}
            <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
              <div ref={setRef}>
                <FillBlanksQuestion
                  paragraph={group.paragraph}
                  userAnswers={answers}
                  onChange={(num, value) => setAnswers((prev: any) => ({ ...prev, [num]: value }))}
                  submitted={submitted}
                  highlightedBlank={highlightedQ}
                />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: "700px" }} className="question" ref={setRef}>
            <div ref={setRef}>
              <FillBlanksQuestion
                paragraph={group.paragraph}
                userAnswers={answers}
                onChange={(num, value) => setAnswers((prev: any) => ({ ...prev, [num]: value }))}
                submitted={submitted}
                highlightedBlank={highlightedQ}
              />
            </div>
          </div>
        )}
      </>
    );
  }
  // Nếu là MATCH_TABLE, chỉ render 1 lần cho cả group (ở câu đầu tiên)
  if (group.type === "MATCH_TABLE" && group.choices) {
    if (q.number == group.questions[0].number) {
      return (
        <>
          {showInstruction && group && (
            <div className="question-instruction">
              <div style={{ fontWeight: 700, fontSize: '1em', marginBottom: 6 }}>
                {`Questions ${group.questions[0].number}–${group.questions[group.questions.length - 1].number}`}
              </div>
              {group.instruction.split('\n').map((line, idx) => (
                <div className="tinymce-content" key={idx} dangerouslySetInnerHTML={{
                  __html: sanitizeContent(line)
                }} />
              ))}
            </div>
          )}
          {group.imgContent ? (
            <div className="flex flex-row items-start justify-start gap-4">
              {/* Bên trái: ảnh sát lề trái */}
              <div style={{ minWidth: 320 }}>
                <div
                  className="question-paragraph tinymce-content"
                  style={{ width: "100%", minHeight: 200, marginLeft: 0 }}
                  dangerouslySetInnerHTML={{ __html: sanitizeContent(group.imgContent) }}
                />
              </div>
              {/* Bên phải: bảng nhỏ hơn, sát ảnh */}
              <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
                <MatchTableQuestion
                  highlightedQ={highlightedQ}
                  rows={group.questions}
                  choices={group.choices}
                  userAnswers={answers}
                  onChange={(rowNumber, value) =>
                    setAnswers((prev: any) => ({ ...prev, [rowNumber]: value }))
                  }
                  submitted={submitted}
                />
              </div>
            </div>
          ) : group.paragraph ? (
            <div className="flex flex-row items-start justify-start gap-4">
              {/* Bên trái: ảnh sát lề trái */}
              <div style={{ minWidth: 320 }}>
                <div
                  className="question-paragraph tinymce-content"
                  style={{ width: "100%", minHeight: 200, marginLeft: 0 }}
                  dangerouslySetInnerHTML={{ __html: sanitizeContent(group.paragraph) }}
                />
              </div>
              {/* Bên phải: bảng nhỏ hơn, sát ảnh */}
              <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
                <MatchTableQuestion
                  highlightedQ={highlightedQ}
                  rows={group.questions}
                  choices={group.choices}
                  userAnswers={answers}
                  onChange={(rowNumber, value) =>
                    setAnswers((prev: any) => ({ ...prev, [rowNumber]: value }))
                  }
                  submitted={submitted}
                />
              </div>
            </div>
          )
          : ( 
            <div style={{ maxWidth: "700px" }} className="question" ref={setRef}>
              <MatchTableQuestion
                highlightedQ={highlightedQ}
                rows={group.questions}
                choices={group.choices}
                userAnswers={answers}
                onChange={(rowNumber, value) =>
                  setAnswers((prev: any) => ({ ...prev, [rowNumber]: value }))
                }
                submitted={submitted}
              />
            </div>
          )}
        </>
      );
    } else {
      // Render một div ẩn để giữ ref cho các câu còn lại
      return <div ref={setRef} style={{ height: 1 }} />;
    }
  } else if (group.type === "DRAG_DROP") {
    if (q.number === group.questions[0].number) {
      return (
        <>
          {showInstruction && group && (
            <div className="question-instruction">
              <div style={{ fontWeight: 700, fontSize: '1em', marginBottom: 6 }}>
                {`Questions ${group.questions[0].number}–${group.questions[group.questions.length - 1].number}`}
              </div>
              {group.instruction && (
                <div className="tinymce-content" dangerouslySetInnerHTML={{ __html: sanitizeContent(group.instruction) }} />
              )}

            </div>
          )}
          <div ref={setRef}>
            <DragDropQuestion
              paragraph={group.paragraph}
              choices={group.choices}
              questions={group.questions}
              userAnswers={answers}
              onChange={(blankNum, value) => {
                setAnswers(prev => ({
                  ...prev,
                  [blankNum]: value
                }));
              }}
              submitted={submitted}
              highlightedQ={highlightedQ}
            />
          </div>
        </>
      );
    } else {
      return <div ref={setRef} style={{ height: 1 }} />;
    }

  }

  if (group.type === "MATCHING_HEADER") {
    // Chỉ render instruction một lần cho câu hỏi đầu tiên của group
    if (q.number === group.questions[0].number) {
      return (
        <div ref={setRef}>
          {showInstruction && group && (
            <div className="question-instruction">
              <div style={{ fontWeight: 700, fontSize: '1em', marginBottom: 6 }}>
                {`Questions ${group.questions[0].number}–${group.questions[group.questions.length - 1].number}`}
              </div>
              {group.instruction && (
                <div className="tinymce-content" dangerouslySetInnerHTML={{ __html: sanitizeContent(group.instruction) }} />
              )}
            </div>
          )}
          {/* Render các lựa chọn kéo thả ngay dưới instruction */}
          {availableMatchingHeaders && availableMatchingHeaders.length > 0 && (
            <div className="matching-header-choices-container" style={{ padding: '16px 0', borderBottom: '1px solid #eee' }}>
              {availableMatchingHeaders.map((choice) => (
                <div
                  key={choice}
                  className="matching-header-choice"
                  draggable={!submitted}
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", choice)}
                >
                  {choice}
                </div>

              ))}
            </div>
          )}
        </div>
      );
    }
    return <div ref={setRef} style={{ height: 1 }} />;
  }
  // Các loại câu hỏi khác giữ nguyên
  return (
    <>
      {showInstruction && group && (
        <div className="question-instruction">
          <div style={{ fontWeight: 700, fontSize: '1em', marginBottom: 6 }}>
            {group.questions && group.questions.length > 1 || group.type === "MULTI" ? (
              group.type === "MULTI" ? (
                (() => {
                  const firstNumber = group.questions[0].number;
                  const lastQuestion = group.questions[group.questions.length - 1];
                  const lastNumber = lastQuestion.number + (lastQuestion.answers?.length || 1) - 1;
                  return `Questions ${firstNumber}–${lastNumber}`;
                })()
              ) : (
                `Questions ${group.questions[0].number}–${group.questions[group.questions.length - 1].number}`
              )
            ) : (
              `Question ${q.number}`
            )}

          </div>
          {group.instruction.split('\n').map((line, idx) => (
            <div
              className="tinymce-content"
              key={idx}
              dangerouslySetInnerHTML={{
                __html: sanitizeContent(line)
              }}
            />
          ))}
        </div>
      )}
      <div className="question" ref={setRef}>
        {group.type === 'TFNG' ? (
          <TFNGQuestion
            qKey={qKey}
            q={q}
            answers={answers}
            submitted={submitted}
            handleChange={handleChange}
            isHighlighted={isHighlighted}
          />
        ) : group.type === 'MULTI' ? (
          <MultiQuestion
            qKey={qKey}
            q={q}
            multiRange={multiRange}
            answers={answers}
            setAnswers={setAnswers}
            submitted={submitted}
            isHighlighted={isHighlighted}
          />
        ) : group.type === 'MCQ' ? (
          <MCQQuestion
            q={q}
            qKey={qKey}
            answers={answers}
            submitted={submitted}
            handleChange={handleChange}
            isHighlighted={isHighlighted}
          />
        ) : (
          <p>
          </p>
        )}
      </div>
    </>
  );
};

export default QuestionItem;
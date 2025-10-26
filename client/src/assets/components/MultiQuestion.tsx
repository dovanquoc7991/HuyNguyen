import React, { useEffect, useState } from "react";
import { useHighlighter } from "../hooks/useHighlight";
import SelectionToolbar from "./SelectionToolbar";
import ActionToolbar from "./ActionToolbar";
import NoteEditor from "./NoteEditor";
import { Note } from "../../types";
import TranslationPopup from "./TranslationPopup";

interface MultiQuestionProps {
  qKey: string;
  q: {
    question: string;
    options?: string[];
    answers?: string[];
  };
  multiRange: { from: number; to: number };
  answers: Record<string, any>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  submitted: boolean;
  isHighlighted?: boolean;
}

const MultiQuestion: React.FC<MultiQuestionProps> = ({
  qKey,
  q,
  multiRange,
  answers,
  setAnswers,
  submitted,
  isHighlighted = false,
}) => {
  const maxSelect = Array.isArray(q.answers) ? q.answers.length : 2;
  const notesKey = `multi-${qKey}-notes`;
  const [initialNotes, setInitialNotes] = useState<Note[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(notesKey);
    if (saved) {
      try {
        setInitialNotes(JSON.parse(saved));
      } catch {
        setInitialNotes([]);
      }
    }
  }, [notesKey]);

  const {
    panelRef,
    selectionPopup,
    highlightAction,
    activeNote,
    editingContent,
    setEditingContent,
    translationPopup,
    actions,
  } = useHighlighter(initialNotes, notesKey);

  const handleDeleteNote = () => {
    if (activeNote) actions.deleteNote(activeNote.id);
  };

  return (
    <>
      {/* Toolbars */}
      <SelectionToolbar
        position={selectionPopup}
        onHighlight={actions.addHighlight}
        onNote={actions.addNote}
        onTranslate={actions.translateSelection}
      />
      <ActionToolbar
        state={highlightAction}
        onDeleteHighlight={actions.deleteHighlight}
        onDeleteAllHighlights={actions.deleteAllHighlights}
        onDeleteAllNotes={actions.deleteAllNotes}
      />
      {activeNote && (
        <NoteEditor
          note={activeNote}
          content={editingContent}
          setContent={setEditingContent}
          onSave={actions.saveNoteContent}
          onClose={actions.closeNotePopup}
          onDelete={handleDeleteNote}
        />
      )}

      <TranslationPopup
        visible={translationPopup.visible}
        top={translationPopup.top}
        left={translationPopup.left}
        originalText={translationPopup.originalText}
        translatedText={translationPopup.translatedText}
        position={translationPopup.position}
        onClose={actions.closeTranslationPopup}
      />

      {/* Câu hỏi có highlight */}
      <p ref={panelRef}>
        <strong className={isHighlighted ? "qnum-highlight" : "qnum-normal"}>
          {multiRange.from}
          {multiRange.to !== multiRange.from ? `–${multiRange.to}` : ""}.
        </strong>{" "}
        {q.question}
      </p>

      {/* Đáp án (có highlight/note cho từng option) */}
      <div className="options">
        {q.options?.map((option, idx) => {
          // Tạo key riêng cho từng option
          const optionKey = `${qKey}-option-${idx}`;
          const [optionNotes, setOptionNotes] = useState<Note[]>([]);

          useEffect(() => {
            const saved = localStorage.getItem(optionKey);
            if (saved) {
              try {
                setOptionNotes(JSON.parse(saved));
              } catch {
                setOptionNotes([]);
              }
            }
          }, [optionKey]);

          const {
            panelRef: optionPanelRef,
            selectionPopup: optionSelectionPopup,
            highlightAction: optionHighlightAction,
            activeNote: optionActiveNote,
            editingContent: optionEditingContent,
            setEditingContent: setOptionEditingContent,
            translationPopup: optionTranslationPopup,
            actions: optionActions,
          } = useHighlighter(optionNotes, optionKey);

          const handleDeleteOptionNote = () => {
            if (optionActiveNote) optionActions.deleteNote(optionActiveNote.id);
          };

          return (
            <div key={option} style={{ position: "relative", display: "flex", alignItems: "center" }}>
              {/* Toolbars & Editor cho option */}
              <SelectionToolbar
                position={optionSelectionPopup}
                onHighlight={optionActions.addHighlight}
                onNote={optionActions.addNote}
                onTranslate={optionActions.translateSelection}
              />
              <ActionToolbar
                state={optionHighlightAction}
                onDeleteHighlight={optionActions.deleteHighlight}
                onDeleteAllHighlights={optionActions.deleteAllHighlights}
                onDeleteAllNotes={optionActions.deleteAllNotes}
                showDeleteHighlight={true}
                showDeleteAllHighlights={true}
                showDeleteAllNotes={true}
              />
              {optionActiveNote && (
                <NoteEditor
                  note={optionActiveNote}
                  content={optionEditingContent}
                  setContent={setOptionEditingContent}
                  onSave={optionActions.saveNoteContent}
                  onClose={optionActions.closeNotePopup}
                  onDelete={handleDeleteOptionNote}
                />
              )}

              <TranslationPopup
                visible={optionTranslationPopup.visible}
                top={optionTranslationPopup.top}
                left={optionTranslationPopup.left}
                originalText={optionTranslationPopup.originalText}
                translatedText={optionTranslationPopup.translatedText}
                position={optionTranslationPopup.position}
                onClose={optionActions.closeTranslationPopup}
              />

              <input
                type="checkbox"
                name={qKey}
                value={option}
                checked={
                  Array.isArray(answers[qKey]) && answers[qKey].includes(option)
                }
                onChange={(e) => {
                  let arr = Array.isArray(answers[qKey]) ? [...answers[qKey]] : [];
                  if (e.target.checked) {
                    if (arr.length < maxSelect) arr.push(option);
                  } else {
                    arr = arr.filter((o) => o !== option);
                  }
                  setAnswers((prev) => ({ ...prev, [qKey]: arr }));
                }}
                disabled={
                  submitted ||
                  (Array.isArray(answers[qKey]) &&
                    answers[qKey].length >= maxSelect &&
                    !answers[qKey].includes(option))
                }
                style={{ marginRight: 8 }}
              />
              <span
                ref={optionPanelRef}
                className="option-text"
                style={{ display: "inline", whiteSpace: "pre-wrap" }}
              >
                {option}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default MultiQuestion;
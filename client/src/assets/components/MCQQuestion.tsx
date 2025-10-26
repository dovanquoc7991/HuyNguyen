import React, { useEffect, useState } from "react";
import { useHighlighter } from "../hooks/useHighlight";
import SelectionToolbar from "./SelectionToolbar";
import ActionToolbar from "./ActionToolbar";
import NoteEditor from "./NoteEditor";
import { Note } from "../../types";
import TranslationPopup from "./TranslationPopup";

interface MCQQuestionProps {
  q: any;
  qKey: string;
  answers: Record<string, any>;
  submitted: boolean;
  handleChange: (q: string, value: string) => void;
  isHighlighted: boolean;
}

const MCQQuestion: React.FC<MCQQuestionProps> = ({
  q,
  qKey,
  answers,
  submitted,
  handleChange,
  isHighlighted,
}) => {
  // Highlight/note cho câu hỏi
  const notesKey = `mcq-${qKey}-notes`;
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
      {/* Toolbars & Editor cho câu hỏi */}
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

      {/* Nội dung câu hỏi (có highlight/note) */}
      <p ref={panelRef}>
        <strong className={isHighlighted ? "qnum-highlight" : "qnum-normal"}>
          {q.number}.
        </strong>{" "}
        {q.question}
      </p>

      {/* Đáp án (có highlight/note cho từng option) */}
      <div className="options">
        {q.options?.map((option: string, idx: number) => {
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

              <div className="label">
                <input
                  type="radio"
                  name={qKey}
                  value={option}
                  checked={answers[qKey] === option}
                  onChange={() => handleChange(qKey, option)}
                  disabled={submitted}
                />
                <span ref={optionPanelRef}>{option}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default MCQQuestion;
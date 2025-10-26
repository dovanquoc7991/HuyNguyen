import React, { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";
import "../css/MatchTableQuestion.css";

import { useHighlighter } from "../hooks/useHighlight";
import SelectionToolbar from "./SelectionToolbar";
import ActionToolbar from "./ActionToolbar";
import NoteEditor from "./NoteEditor";
import { Note } from "../../types";
import TranslationPopup from "./TranslationPopup";

interface Row {
  number: number;
  question: string;
}

interface Props {
  highlightedQ?: string | number | null;
  rows: Row[];
  choices: string[];
  userAnswers: Record<string, string>;
  onChange: (rowNumber: number, value: string) => void;
  submitted: boolean;
  correctAnswers?: Record<string, string>;
}

const MatchTableQuestion: React.FC<Props> = ({
  highlightedQ,
  rows,
  choices,
  userAnswers,
  onChange,
  submitted,
  correctAnswers
}) => {
  const notesKey = `match-table-notes`;
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
    notes,
    selectionPopup,
    highlightAction,
    activeNote,
    editingContent,
    setEditingContent,
    translationPopup,
    actions
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

      {/* Table */}
      <table className="match-table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th></th>
            {choices.map((col, index) => (
              <th key={index}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody ref={panelRef as React.RefObject<HTMLTableSectionElement>}>
          {rows.map((row) => (
            <tr key={row.number}>
              {/* Câu hỏi: Cho phép highlight */}
              <td style={{ textAlign: "left", padding: 4 }}>
                <strong className={highlightedQ === row.number ? "qnum-highlight" : "qnum-normal"}>
                  {row.number}
                </strong>{" "}
                {row.question}
              </td>

              {/* Lựa chọn: Không highlight */}
              {choices.map((col, index) => {
                const isSelected = userAnswers[row.number] === col;
                return (
                  <td
                    key={index}
                    style={{ textAlign: "center" }}
                    className="match-cell"
                    onClick={() => {
                      if (!submitted) onChange(row.number, col);
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: isSelected ? "#43a047" : "#888",
                        fontSize: "1.1em",
                        userSelect: "none"
                      }}
                    >
                      {isSelected && <FaCheck />}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default MatchTableQuestion;

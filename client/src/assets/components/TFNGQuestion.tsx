// components/TFNGQuestion.tsx
import React, { useEffect, useState } from "react";
import parse, { domToReact, HTMLReactParserOptions, Element, Text } from "html-react-parser";
import { useHighlighter } from "../hooks/useHighlight";
import SelectionToolbar from "./SelectionToolbar";
import ActionToolbar from "./ActionToolbar";
import NoteEditor from "./NoteEditor";
import { Note } from "../../types";
import TranslationPopup from "./TranslationPopup";

interface TFNGQuestionProps {
  qKey: string;
  q: {
    number: number;
    question: string;
  };
  answers: Record<string, string>;
  submitted: boolean;
  handleChange: (key: string, value: string) => void;
  isHighlighted?: boolean;
}

const TFNGQuestion: React.FC<TFNGQuestionProps> = ({
  qKey,
  q,
  answers,
  submitted,
  handleChange,
  isHighlighted = false,
}) => {
  const notesKey = `tfng-${qKey}-notes`;
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
    actions,
  } = useHighlighter(initialNotes, notesKey);

  const handleDeleteNote = () => {
    if (activeNote) actions.deleteNote(activeNote.id);
  };

  // Parse nội dung câu hỏi
  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode.type === "text") {
        return <>{(domNode as Text).data}</>;
      }
      if (
        domNode.type === "tag" &&
        "children" in domNode &&
        Array.isArray((domNode as Element).children)
      ) {
        const el = domNode as Element;
        return React.createElement(
          el.name,
          el.attribs,
          domToReact(el.children as any, options)
        );
      }
      return undefined;
    },
  };

  return (
  <div>
    {/* Toolbars & Editor */}
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

    {/* Nội dung câu hỏi */}
    <p ref={panelRef}>
      <strong className={isHighlighted ? "qnum-highlight" : "qnum-normal"}>
        {q.number}.
      </strong>{" "}
      {parse(q.question, options)}
    </p>

    {/* Đáp án */}
    <div className="options">
      {["TRUE", "FALSE", "NOT GIVEN"].map((option) => (
        <label key={option}>
          <input
            type="radio"
            name={qKey}
            value={option}
            checked={answers[qKey] === option}
            onChange={() => handleChange(qKey, option)}
            disabled={submitted}
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  </div>
);
}

export default TFNGQuestion;

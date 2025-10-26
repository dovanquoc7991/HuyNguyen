import React, { useEffect, useState, useRef } from "react";
import "../css/DragDropQuestion.css";
import type { Question } from "../pages/ReadingTestPage";
import { useHighlighter } from "../hooks/useHighlight";
import SelectionToolbar from "./SelectionToolbar";
import ActionToolbar from "./ActionToolbar";
import NoteEditor from "./NoteEditor";
import { Note } from "../../types";
import TranslationPopup from "./TranslationPopup";

interface DragDropQuestionProps {
  paragraph?: string;
  choices?: string[];
  questions: Question[];
  userAnswers: Record<string, string>;
  onChange: (blankNum: string, value: string | null) => void;
  submitted: boolean;
  highlightedQ?: string | number | null;
}

const DragDropQuestion: React.FC<DragDropQuestionProps> = ({
  paragraph,
  choices,
  userAnswers,
  onChange,
  submitted,
  highlightedQ,
}) => {
  const used = Object.values(userAnswers);
  const availableChoices = choices?.filter((c) => !used.includes(c));
  const blankRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  // Highlight / Note logic
  const notesKey = "dragdrop-notes";
  const [initialNotes, setInitialNotes] = useState<Note[]>([]);
  useEffect(() => {
    const savedNotes = localStorage.getItem(notesKey);
    if (savedNotes) {
      try {
        setInitialNotes(JSON.parse(savedNotes));
      } catch {
        setInitialNotes([]);
      }
    }
  }, []);

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

  // Scroll to highlighted blank
  useEffect(() => {
    if (highlightedQ) {
      const blankNum = String(highlightedQ);
      const ref = blankRefs.current[blankNum];
      ref?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightedQ]);

  /** Parse HTML and inject drag-drop blanks */
  const parseParagraph = (htmlString: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    const nodes: React.ReactNode[] = [];

    const traverse = (node: ChildNode | Node): React.ReactNode => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        const parts = text.split(/({\d+})/g);

        return parts.map((part, idx) => {
          const match = part.match(/^{(\d+)}$/);
          if (match) {
            const num = match[1];
            const value = userAnswers[num] || "";
            return (
              <span
                key={`blank-${num}-${idx}`}
                ref={(el) => (blankRefs.current[num] = el)}
                className={
                  "dragdrop-blank" +
                  (highlightedQ == num ? " dragdrop-blank-highlight" : "")
                }
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (submitted) return;
                  const dropped = e.dataTransfer.getData("text/plain");
                  if (dropped) onChange(num, dropped);
                }}
              >
                {value ? (
                  <span className="dragdrop-filled">
                    {value}
                    {!submitted && (
                      <button
                        className="dragdrop-remove"
                        onClick={() => onChange(num, null)}
                        type="button"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ) : (
                  <span className="dragdrop-placeholder">{num}</span>
                )}
              </span>
            );
          }
          return part;
        });
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;

        // --- FIX: Sao chép tất cả các thuộc tính từ HTML element ---
        const props: Record<string, any> = {};
        for (const attr of Array.from(el.attributes)) {
          props[attr.name === "class" ? "className" : attr.name] = attr.value;
        }

        // --- FIX: Chuyển đổi chuỗi style thành object ---
        if (props.style && typeof props.style === "string") {
          props.style = props.style
            .split(";")
            .reduce((acc: Record<string, string>, rule: string) => {
              const [key, value] = rule.split(":");
              if (key && value) {
                const camelKey = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                acc[camelKey] = value.trim();
              }
              return acc;
            }, {});
        }

        const children = Array.from(el.childNodes).map((child, i) => (
          <React.Fragment key={i}>{traverse(child)}</React.Fragment>
        ));

        return React.createElement(el.tagName.toLowerCase(), props, ...children);
      }

      return null;
    };

    doc.body.childNodes.forEach((node, idx) => {
      const parsed = traverse(node);
      if (Array.isArray(parsed)) {
        nodes.push(...parsed);
      } else if (parsed) {
        nodes.push(<React.Fragment key={idx}>{parsed}</React.Fragment>);
      }
    });

    return nodes;
  };

  const handleDeleteNote = () => {
    if (activeNote) actions.deleteNote(activeNote.id);
  };

  return (
    <div className="dragdrop-question">
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

      <div className="dragdrop-flex-container">
        <div className="dragdrop-choices">
          {availableChoices?.map((choice) => (
            <div
              key={choice}
              className="dragdrop-choice"
              draggable={!submitted}
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", choice);
              }}
            >
              {choice}
            </div>
          ))}
        </div>

        <div ref={panelRef} className="dragdrop-paragraph tinymce-content">
          {paragraph ? parseParagraph(paragraph) : null}
        </div>
      </div>
    </div>
  );
};

export default DragDropQuestion;

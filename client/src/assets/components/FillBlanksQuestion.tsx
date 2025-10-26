import React, { useEffect, useRef, useState } from "react";
import parse, {
  domToReact,
  HTMLReactParserOptions,
  Element,
  Text,
} from "html-react-parser";
import { useHighlighter } from "../hooks/useHighlight";
import SelectionToolbar from "./SelectionToolbar";
import ActionToolbar from "./ActionToolbar";
import NoteEditor from "./NoteEditor";
import { Note } from "../../types";
import "../css/FillBlanksQuestion.css";
import TranslationPopup from "./TranslationPopup";
import { sanitizeContent } from "../lib/utils";

interface Props {
  paragraph: string;
  userAnswers: Record<string, string>;
  onChange: (number: string, value: string) => void;
  submitted: boolean;
  highlightedBlank?: string | number | null;
}

const FillBlanksQuestion: React.FC<Props> = ({
  paragraph,
  userAnswers,
  onChange,
  submitted,
  highlightedBlank,
}) => {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Highlight & Note logic
  const notesKey = "fillblanks-notes";
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

  // Effect để focus vào input khi chưa nộp bài
  useEffect(() => {
    if (!submitted && highlightedBlank && inputRefs.current[highlightedBlank]) {
      inputRefs.current[highlightedBlank]?.focus();
    }
  }, [highlightedBlank, submitted]);

  // Effect để scroll tới input wrapper, hoạt động cả trước và sau khi nộp bài
  useEffect(() => {
    if (highlightedBlank) {
      const blankNumber = String(highlightedBlank).split('-')[0]; // Handle cases like "5-1"
      const wrapper = document.querySelector(`.fillblanks-input-wrapper[data-blank-number="${blankNumber}"]`);
      if (wrapper) {
        wrapper.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [highlightedBlank]);


  // Hàm thay thế {n} bằng <input>
  const replaceBlanks = (text: string) => {
    const regex = /\{(\d+)\}/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = regex.lastIndex;
      const blankNumber = match[1];

      // Text trước {n}
      if (start > lastIndex) {
        parts.push(text.slice(lastIndex, start));
      }

      // Thêm input thay cho {n}
      parts.push(
        <span
          className={`fillblanks-input-wrapper ${String(highlightedBlank) === blankNumber ? 'highlighted' : ''}`}
          key={`blank-${blankNumber}-${start}`}
          data-blank-number={blankNumber} // Thêm data attribute để scroll
          style={{ display: "inline-flex", alignItems: "center" }}
        >
          <input
            className={`fillblanks-input ${String(highlightedBlank) === blankNumber ? 'highlighted' : ''}`}
            ref={(el) => (inputRefs.current[blankNumber] = el)}
            value={userAnswers[blankNumber] || ""}
            onChange={(e) => onChange(String(blankNumber), e.target.value)}
            disabled={submitted}
            placeholder={String(blankNumber)}
            style={{
              width: `calc(${Math.max(
                2,
                userAnswers[blankNumber]?.length || 8
              ) + 3}ch)`,
              maxWidth: "300px",
              padding: "2px 4px",
              margin: "0 2px",
            }}
          />
        </span>
      );

      lastIndex = end;
    }

    // Phần còn lại sau dấu {n}
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  // Đệ quy parse nội dung HTML từ TinyMCE/CKEditor và thay thế {n}
  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode.type === "text") {
        return <>{replaceBlanks((domNode as Text).data)}</>;
      }
      if (
        domNode.type === "tag" &&
        "children" in domNode &&
        Array.isArray((domNode as Element).children) &&
        (domNode as Element).children.length > 0
      ) {
        const el = domNode as Element;
        // Convert style string to object if exists
        let attribs = { ...el.attribs };
        if (attribs.style && typeof attribs.style === "string") {
          attribs.style = attribs.style.split(";").reduce((acc: any, rule: string) => {
            const [key, value] = rule.split(":");
            if (key && value) {
              // Convert kebab-case to camelCase
              const camelKey = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
              acc[camelKey] = value.trim();
            }
            return acc;
          }, {});
        }
        return React.createElement(
          el.name,
          attribs,
          domToReact(el.children as any, options)
        );
      }
      return undefined;
    },
  };

  const handleDeleteNote = () => {
    if (activeNote) actions.deleteNote(activeNote.id);
  };

  return (
    <div>
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
      <div ref={panelRef} className="tinymce-content">
        {parse(sanitizeContent(paragraph), options)}
      </div>
    </div>
  );
};

export default FillBlanksQuestion;
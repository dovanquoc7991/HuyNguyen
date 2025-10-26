import React, { useEffect, useRef, useState } from "react";
import parse, { domToReact, HTMLReactParserOptions, Element, Text } from "html-react-parser";
// Đảm bảo đường dẫn import là chính xác
import { useHighlighter } from "../hooks/useHighlight"; // Sửa lại tên file nếu cần
import SelectionToolbar from "./SelectionToolbar";
import ActionToolbar from "./ActionToolbar";
import NoteEditor from "./NoteEditor";
import TranslationPopup from "./TranslationPopup";
import { Note, PopupState, HighlightActionState } from "../../types"; // Đảm bảo import đầy đủ
import "../css/PassagePanel.css";
import { sanitizeContent } from "../lib/utils";

interface PassagePanelProps {
  passage: string[];
  width: number;
  // Props mới để xử lý Matching Header
  matchingHeaderGroup?: {
    choices: string[];
    userAnswers: Record<string, string>;
    onChange: (blankNum: string, value: string | null) => void;
    submitted: boolean;
    highlightedQ?: string | number | null;
  } | null;
}

// Danh sách các thẻ void trong HTML
const voidElements = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

const PassagePanel: React.FC<PassagePanelProps> = ({ passage, width, matchingHeaderGroup }) => {
  // 1. Định nghĩa một key cố định cho passage
  const notesKey = "passage-notes"; 

  const blankRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const [initialNotes, setInitialNotes] = useState<Note[]>([]);

  // Chỉ đọc từ localStorage một lần khi component được mount
  useEffect(() => {
    // 2. Sử dụng key đã định nghĩa ở trên
    const savedNotes = localStorage.getItem(notesKey); 
    if (savedNotes) {
      try {
        setInitialNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error("Failed to parse notes for passage:", e);
        setInitialNotes([]);
      }
    }
  }, [notesKey]); // Dependency array bây giờ là `notesKey` cho rõ ràng

  const {
    panelRef,
    selectionPopup,
    highlightAction,
    activeNote,
    editingContent,
    setEditingContent,
    translationPopup,
    actions,
  // 3. Cung cấp đối số thứ hai là notesKey
  } = useHighlighter(initialNotes, notesKey); // <-- SỬA LỖI Ở ĐÂY

  const handleDeleteNote = () => {
    if (activeNote) {
      actions.deleteNote(activeNote.id);
    }
  };

  // --- NEW: Effect to scroll to the highlighted blank ---
  useEffect(() => {
    if (matchingHeaderGroup?.highlightedQ) {
      const key = String(matchingHeaderGroup.highlightedQ);
      const element = blankRefs.current[key];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // You can also add a focus effect if the blank were an input
      }
    }
  }, [matchingHeaderGroup?.highlightedQ]);

  // --- NEW: Logic to parse and replace blanks for Matching Header ---
  const parseOptions: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode.type === 'text' && matchingHeaderGroup) {
        const text = (domNode as Text).data;
        const parts = text.split(/({\d+})/g);

        return <>{parts.map((part, idx) => {
          const match = part.match(/^{(\d+)}$/);
          if (match) {
            const num = match[1];
            const value = matchingHeaderGroup.userAnswers[num] || "";
            return (
              <span
                ref={(el) => (blankRefs.current[num] = el)}
                key={`blank-${num}-${idx}`}
                className={
                  "dragdrop-blank-matching-header" + // Re-use dragdrop styles
                  (matchingHeaderGroup.highlightedQ == num ? " dragdrop-blank-highlight" : "")
                }
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (matchingHeaderGroup.submitted) return;
                  const dropped = e.dataTransfer.getData("text/plain");
                  if (dropped) matchingHeaderGroup.onChange(num, dropped);
                }}
              >
                {value ? (
                  <span className="dragdrop-filled">
                    {value}
                    {!matchingHeaderGroup.submitted && (
                      <button
                        className="dragdrop-remove"
                        onClick={() => matchingHeaderGroup.onChange(num, null)}
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
        })}</>;
      }
      if (domNode.type === 'tag') {
        const el = domNode as Element;
        if (el.attribs && el.attribs.style && typeof el.attribs.style === 'string') {
          el.attribs.style = el.attribs.style.split(';').reduce((acc: any, rule: string) => {
            const [key, value] = rule.split(':');
            if (key && value) {
              const camelKey = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
              acc[camelKey] = value.trim();
            }
            return acc;
          }, {});
        }
        // KIỂM TRA THẺ VOID: Nếu là thẻ void, không render children
        if (voidElements.has(el.name.toLowerCase())) {
          return React.createElement(el.name, el.attribs);
        }
        // Nếu không phải thẻ void, render bình thường với children
        return React.createElement(el.name, el.attribs, domToReact(el.children as any, parseOptions));
      }
    }
  };

  return (
    <div>
      {/* Các component UI giờ chỉ nhận props và hiển thị */}
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
          onDelete={handleDeleteNote} // <-- Sửa ở đây để gọi hàm đúng cách
        />
      )}

      {/* Render the new translation popup */}
      <TranslationPopup
        visible={translationPopup.visible}
        top={translationPopup.top}
        left={translationPopup.left}
        originalText={translationPopup.originalText}
        translatedText={translationPopup.translatedText}
        position={translationPopup.position}
        onClose={actions.closeTranslationPopup}
      />

      {/* Container chính, logic được gắn vào thông qua ref từ hook */}
      <div id="left-panel" className="left-panel" ref={panelRef} style={{ width: `${width}px`, maxHeight: "100vh", overflowY: "auto" }}>
        {passage.map((p) => sanitizeContent(p))
          // .filter((p) => p.replace(/<[^>]+>/g, "").trim() !== "")
          .filter((p) => p.trim() !== "")
          .map((p, i) => (
            <div className="tinymce-content" key={i} >
              {matchingHeaderGroup ? parse(p, parseOptions) : parse(p)}
            </div>
          ))}
      </div>
    </div>
  );
};

export default PassagePanel;
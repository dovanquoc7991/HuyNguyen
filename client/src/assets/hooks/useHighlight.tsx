import { useState, useRef, useEffect, useCallback } from 'react';
import * as ReactDOMServer from 'react-dom/server';
import { MdOutlineChatBubbleOutline } from 'react-icons/md';
import { Note, PopupState, HighlightActionState } from '../../types';
import { unwrapElement } from '../utils/domUtils';

interface TranslationPopupState extends PopupState {
  originalText: string;
  translatedText: string;
  position?: 'above' | 'below';
}

export const useHighlighter = (initialNotes: Note[] = [], notesKey: string) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);

  // State cho các popup
  const [selectionPopup, setSelectionPopup] = useState<PopupState>({ visible: false, top: 0, left: 0 });
  const [highlightAction, setHighlightAction] = useState<HighlightActionState>({ visible: false, top: 0, left: 0, element: null });
  const [translationPopup, setTranslationPopup] = useState<TranslationPopupState>({ visible: false, top: 0, left: 0, originalText: '', translatedText: '', position: 'below' });

  // State cho việc chỉnh sửa note
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // Lưu notes vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const closeAllPopups = useCallback(() => {
    setSelectionPopup({ visible: false, top: 0, left: 0 });
    setHighlightAction({ visible: false, top: 0, left: 0, element: null });
    setActiveNote(null);
    setTranslationPopup(prev => ({ ...prev, visible: false })); // Close translation popup
    window.getSelection()?.removeAllRanges();
  }, []);

  /**
   * A robust function to wrap a range of text content.
   * It handles selections that span across multiple block-level elements (like <p>)
   * by splitting text nodes at the boundaries and wrapping each text node individually.
   * @param range The Range object to wrap.
   * @param className The CSS class for the wrapper span.
   * @param noteId Optional note ID to add as a data attribute.
   * @returns The created wrapper elements.
   */
  const wrapRangeContents = (range: Range, className: string, noteId?: string): HTMLElement[] => {
    const container = range.commonAncestorContainer;

    // 1. Get all text nodes. If the selection is within a single text node, the
    // TreeWalker won't find it, so we handle that case manually.
    const allNodes: Node[] = [];
    if (container.nodeType === Node.TEXT_NODE) {
      allNodes.push(container);
    } else {
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => (range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
      });
      while (walker.nextNode()) allNodes.push(walker.currentNode);
    }

    const createdElements: HTMLElement[] = [];

    // 2. Iterate through the nodes and wrap them.
    for (const node of allNodes) {
      // This must be a Text node because of NodeFilter.SHOW_TEXT.
      const textNode = node as Text;

      // Determine the part of the text node that is inside the selection.
      const isStartNode = textNode === range.startContainer;
      const isEndNode = textNode === range.endContainer;

      const start = isStartNode ? range.startOffset : 0;
      const end = isEndNode ? range.endOffset : textNode.length;

      // A text node might be fully or partially selected. We need to split it if it's
      // partially selected. The order of splitting is important to get the correct node to wrap.
      let nodeToWrap: Node = textNode;

      // 1. Split the end of the selection first. This doesn't change our `textNode` reference.
      if (isEndNode && end < textNode.length) {
        textNode.splitText(end);
      }

      // 2. Split the start. This returns the new node which is the part we want to wrap.
      if (isStartNode && start > 0) {
        nodeToWrap = textNode.splitText(start);
      }
      // Wrap the text node if it's not empty.
      if (nodeToWrap && nodeToWrap.nodeValue?.trim()) {
        const wrapper = document.createElement('span');
        wrapper.className = className;
        if (noteId) {
          wrapper.setAttribute('data-note-id', noteId);
        }
        nodeToWrap.parentNode!.insertBefore(wrapper, nodeToWrap);
        wrapper.appendChild(nodeToWrap);
        createdElements.push(wrapper);
      }
    }
    return createdElements;
  };

  const addHighlight = useCallback(() => {
    if (!selectedRange) return;
    wrapRangeContents(selectedRange, 'highlighted-text');
    closeAllPopups();
  }, [selectedRange, closeAllPopups]);

  const addNote = useCallback(() => {
    if (!selectedRange) return;
    const id = `note-${Date.now()}`;
    const text = selectedRange.toString();

    const createdWrappers = wrapRangeContents(selectedRange, 'note-wrapper highlighted-text', id);

    // Add the note icon to the last created wrapper element.
    if (createdWrappers.length > 0) {
      const iconSpan = document.createElement('span');
      iconSpan.className = 'note-icon';
      iconSpan.innerHTML = ReactDOMServer.renderToStaticMarkup(<MdOutlineChatBubbleOutline />);
      createdWrappers[createdWrappers.length - 1].appendChild(iconSpan);
    }
    
    const newNote: Note = {
      id, text, content: '',
      type: undefined
    };
    setNotes(prevNotes => [...prevNotes, newNote]);
    closeAllPopups();
  }, [selectedRange, closeAllPopups]);

  const saveNoteContent = useCallback(() => {
    if (!activeNote) return;
    setNotes(notes.map(n => (n.id === activeNote.id ? { ...n, content: editingContent } : n)));
    closeAllPopups();
  }, [activeNote, editingContent, notes, closeAllPopups]);

  const translateSelection = useCallback(async () => {
    if (!selectedRange) return;

    const textToTranslate = selectedRange.toString().trim();
    if (!textToTranslate) return;

    // Hiển thị trạng thái đang tải và đóng menu lựa chọn
    const rect = selectedRange.getBoundingClientRect();
    setTranslationPopup({ visible: true, top: rect.bottom + 5, left: rect.left, originalText: textToTranslate, translatedText: 'Đang dịch...', position: 'below' });
    setSelectionPopup({ visible: false, top: 0, left: 0 });

    const mockTranslate = async (text: string): Promise<string> => {
      console.log(`Translating: "${text}"`);
      try {
        // Sử dụng API của MyMemory. Lưu ý: Gói miễn phí có giới hạn hàng ngày.
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`);
        if (!response.ok) {
          return "Dịch thất bại. Vui lòng thử lại.";
        }
        const data = await response.json();
        // Cấu trúc trả về của API MyMemory
        return data.responseData.translatedText || "Không thể dịch được.";
      } catch (error) {
        console.error("Translation API error:", error);
        return "Lỗi kết nối đến dịch vụ dịch.";
      }
    };

    const translatedText = await mockTranslate(textToTranslate); // Lấy kết quả dịch

    // Tính toán lại vị trí popup sau khi có kết quả
    const popupEstimatedHeight = 180; // Chiều cao ước tính của popup, bạn có thể điều chỉnh
    const spaceBelow = window.innerHeight - rect.bottom;

    let top = rect.bottom + 5; // Mặc định: hiển thị bên dưới
    let position: 'above' | 'below' = 'below';

    // Nếu không đủ không gian bên dưới và có đủ không gian bên trên -> hiển thị bên trên
    if (spaceBelow < popupEstimatedHeight && rect.top > popupEstimatedHeight) {
      top = rect.top - 5;
      position = 'above';
    }

    setTranslationPopup({ visible: true, top, left: rect.left, originalText: textToTranslate, translatedText, position });
  }, [selectedRange]);

  const deleteHighlight = useCallback(() => {
    if (!highlightAction.element) return;
    unwrapElement(highlightAction.element);
    closeAllPopups();
  }, [highlightAction.element, closeAllPopups]);

  const deleteNote = useCallback((noteId: string) => {
    panelRef.current?.querySelectorAll(`[data-note-id="${noteId}"]`).forEach(unwrapElement);
    setNotes(notes.filter(n => n.id !== noteId));
    closeAllPopups();
  }, [notes, closeAllPopups]);

  const deleteAllHighlights = useCallback(() => {
    panelRef.current?.querySelectorAll<HTMLElement>('.highlighted-text:not(.note-wrapper)').forEach(unwrapElement);
    closeAllPopups();
  }, [closeAllPopups]);

  const deleteAllNotes = useCallback(() => {
    panelRef.current?.querySelectorAll<HTMLElement>('.note-wrapper').forEach(unwrapElement);
    setNotes([]);
    closeAllPopups();
  }, [closeAllPopups]);

  // Xử lý sự kiện click vào icon note (cần được gắn lại sau khi parse)
  const handleNoteIconClick = useCallback((noteId: string) => {
    const noteToEdit = notes.find(n => n.id === noteId);
    if (noteToEdit) {
      closeAllPopups();
      setActiveNote(noteToEdit);
      setEditingContent(noteToEdit.content);
    }
  }, [notes, closeAllPopups]);


  // Effect chính để lắng nghe sự kiện
  useEffect(() => {
    const currentPanel = panelRef.current;
    if (!currentPanel) return;

    const handleMouseUp = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        target.closest(".popup-toolbar, .tooltip-note, .note-icon, .note-editor-popup, .fillblanks-input")
      ) {
        return; // 👉 Đang ở trong popup hoặc ô input => Không xử lý gì cả
      }

      if (activeNote || highlightAction.visible) return;

      const selection = window.getSelection();
      if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (
          !currentPanel.contains(range.commonAncestorContainer) ||
          range.cloneContents().querySelector(".highlighted-text, .note-wrapper")
        ) {
          setSelectionPopup({ visible: false, top: 0, left: 0 });
          return;
        }

        const rect = range.getBoundingClientRect();
        setSelectionPopup({
          visible: true,
          top: rect.top + window.scrollY - 10,
          left: rect.left + window.scrollX,
        });
        setSelectedRange(range.cloneRange());
      } else {
        setSelectionPopup({ visible: false, top: 0, left: 0 });
      }
    };


    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (
        target.closest(".note-editor-popup, .fillblanks-input")
      ) {
        return; // 👉 Đừng xử lý gì nếu đang gõ nội dung
      }

      if (window.getSelection()?.toString().trim()) return;

      const noteIcon = target.closest<HTMLElement>(".note-icon");
      const highlightElement = target.closest<HTMLElement>(".highlighted-text, .note-wrapper");

      if (noteIcon) {
        e.stopPropagation();
        const noteId = noteIcon.parentElement?.getAttribute("data-note-id");
        if (noteId) handleNoteIconClick(noteId);
        return;
      }

      if (!highlightElement) {
        closeAllPopups();
        return;
      }

      if (activeNote) return;

      const noteId = highlightElement.getAttribute("data-note-id");
      if (noteId) {
        handleNoteIconClick(noteId);
      } else {
        const rect = highlightElement.getBoundingClientRect();
        setHighlightAction({
          visible: true,
          top: rect.top + window.scrollY - 10,
          left: rect.left + window.scrollX,
          element: highlightElement,
        });
        setSelectionPopup({ visible: false, top: 0, left: 0 });
      }
    };


    document.addEventListener('mouseup', handleMouseUp);
    currentPanel.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      currentPanel.removeEventListener('click', handleClick);
    };
  }, [activeNote, highlightAction.visible, handleNoteIconClick, closeAllPopups]);

  // Trả về tất cả state và hàm cần thiết cho UI
  return {
    panelRef,
    notes,
    selectionPopup,
    highlightAction,
    activeNote,
    editingContent,
    translationPopup,
    setEditingContent,
    actions: {
      addHighlight,
      addNote,
      saveNoteContent,
      closeNotePopup: closeAllPopups,
      deleteHighlight,
      deleteNote,
      deleteAllHighlights,
      deleteAllNotes,
      translateSelection,
      closeTranslationPopup: () => setTranslationPopup(prev => ({ ...prev, visible: false })),
    },
  };
};
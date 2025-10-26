export interface Note {
  type: any;
  id: string;
  text: string; // Nội dung gốc được highlight
  content: string; // Nội dung ghi chú của người dùng
}

export interface PopupState {
  visible: boolean;
  top: number;
  left: number;
}

export interface HighlightActionState extends PopupState {
  element: HTMLElement | null;
}
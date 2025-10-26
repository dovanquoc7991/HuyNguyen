import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function averageScores(score1?: string, score2?: string): number {
  const n1 = parseFloat(score1 ?? "0");
  const n2 = parseFloat(score2 ?? "0");
  return Number(((n1 + n2) / 2).toFixed(1));
}

export function calPercentage(value: number, total: number): number {
  if (!total) return 0;
  const percent = (value / total) * 100;
  return percent % 1 === 0 ? Number(percent.toFixed(0)) : Number(percent.toFixed(2));
}

export function removeInlineStyles(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("[style]").forEach(el => el.removeAttribute("style"));
  let cleanHtml = doc.body.innerHTML;
  cleanHtml = cleanHtml.replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, "");
  cleanHtml = cleanHtml.replace(/<p>\s*&nbsp;\s*<\/p>/gi, "");
  return html;
}


export const modules = {
  toolbar: [
    [{ header: [1, 2, false] }], // Tiêu đề H1, H2
    [{ size: ["small", "normal", "large", "huge"] }], // Kích thước chữ
    ["bold", "italic", "underline", "strike"], // Định dạng cơ bản
    [{ list: "ordered" }, { list: "bullet" }], // Danh sách có thứ tự và bullet
    [{ align: [] }], // Căn lề (trái, giữa, phải)
    ["blockquote", "code-block"], // Blockquote và code
    ["link", "image"], // Link và hình ảnh
    ["clean"], // Xóa định dạng
  ],
};

export const formats = [
  "header",
  "size", // Thêm hỗ trợ kích thước chữ
  "bold", "italic", "underline", "strike",
  "list", "bullet", "align",
  "blockquote", "code-block",
  "link", "image",
];

export function sanitizeContent(content: string): string {
  if (!content) return "";

  return content
    // Bỏ các <p> chỉ chứa khoảng trắng, &nbsp;, hoặc <br>
    .replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "")
    // Bỏ nhiều dấu cách liên tiếp -> 1 space
    .replace(/\s+/g, " ")
    // Trim đầu và cuối
    .trim();
}

// src/config/tinymceConfig.ts
export const tinymceConfig = {
  tinymceScriptSrc: "../../../tinymce/tinymce.min.js",
  init: {
    license_key: 'gpl',
    height: 750,
    menubar: true,
    plugins: [
      'advlist autolink lists link image charmap preview anchor',
      'searchreplace visualblocks code fullscreen',
      'table',
      'insertdatetime media table paste code help wordcount'
    ],
    fontsize_formats: '8pt 10pt 12pt 14pt 18pt 24pt 36pt',
    toolbar:
      'undo redo | formatselect | fontsizeselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | image | table | removeformat | help',
    content_style: 'body { font-family:Tahoma, Arial, sans-serif; font-size:16px }',
    image_dimensions: true,
    object_resizing: 'img',
  },
};

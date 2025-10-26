import React from "react";
import { sanitizeContent } from "../lib/utils";

interface ExplanationModalProps {
    open: boolean;
    onClose: () => void;
    content: string;
    title?: string;
}

const panelStyle: React.CSSProperties = {
    background: "#fff",
    width: "100%",
    height: "100%",
    overflowY: "auto",
    padding: "15px",
    position: "relative",
    display: 'flex',
    flexDirection: 'column'
};

const headerContainerStyle: React.CSSProperties = {
    textAlign: "center",
    marginBottom: "10px",
    flexShrink: 0,
    padding: "5px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    position: "relative",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
};

const titleStyle: React.CSSProperties = {
    color: "#1976d2",
    fontWeight: 700,
    fontSize: "24px",
    margin: 0,
    padding: 0,
    lineHeight: 1.3
};

const closeBtnStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    right: "16px",
    transform: "translateY(-50%)",
    fontSize: "28px",
    color: "#6c757d",
    background: "none",
    border: "none",
    cursor: "pointer",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease"
};

const contentStyle: React.CSSProperties = {
    fontSize: 17,
    color: "#222",
    whiteSpace: "pre-line",
    overflowY: 'auto',
    flexGrow: 1,
    textAlign: 'left',
    paddingRight: '10px',
    lineHeight: 1.6
};

// Add these global styles for hover effect
const globalStyles = `
    .close-btn-hover:hover {
        background-color: #f0f0f0 !important;
    }
`;

// Add global styles to document head
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = globalStyles;
    document.head.appendChild(styleElement);
}

const ExplanationModal: React.FC<ExplanationModalProps> = ({ open, onClose, content, title }) => {
    if (!open) return null;
    const cleanContent = sanitizeContent(content);
    return (
        <div style={panelStyle}>
            <div style={headerContainerStyle}>
                <button 
                    style={closeBtnStyle} 
                    onClick={onClose} 
                    aria-label="Đóng"
                    title="Close"
                    className="close-btn-hover"
                >
                    &times;
                </button>
                <div style={titleStyle}>
                    {title || "Explanation"}
                </div>
            </div>
            <div 
                className="tinymce-content" 
                style={contentStyle}
                dangerouslySetInnerHTML={{ __html: cleanContent }} 
            />
        </div>
    );
};

export default ExplanationModal;
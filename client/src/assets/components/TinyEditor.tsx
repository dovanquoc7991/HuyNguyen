import { useEffect, useRef } from "react";

declare global {
    interface Window {
        tinymce: any;
    }
}

interface TinyEditorProps {
    value: string;
    onChange: (content: string) => void;
    init?: Record<string, any>;
    className?: string;
    textareaName: string;
}

const TinyEditor: React.FC<TinyEditorProps> = ({ value, onChange, init, className, textareaName }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const uniqueId = textareaName;

    useEffect(() => {
        if (window.tinymce && textareaRef.current) {
            console.log("TinyEditor initialized with ID:", uniqueId);
            window.tinymce.init({
                target: textareaRef.current,
                ...init,
                setup: (editor: any) => {
                    editor.on("change keyup", () => {
                        onChange(editor.getContent());
                    });
                },
                init_instance_callback: (editor: any) => {
                    editor.setContent(value || "");
                }
            });
        }

        return () => {
            if (window.tinymce) {
                const editor = window.tinymce.get(uniqueId);
                if (editor) {
                    console.log("Removing TinyEditor with ID:", uniqueId);
                    editor.remove();
                }
            }
        };
    }, [uniqueId]);

    useEffect(() => {
        const editor = window.tinymce?.get(uniqueId);
        if (editor && editor.getContent() !== value) {
            editor.setContent(value || "");
        }
    }, [value, uniqueId]);

    return <textarea ref={textareaRef} id={uniqueId} className={className} name={textareaName} />;
};

export default TinyEditor;
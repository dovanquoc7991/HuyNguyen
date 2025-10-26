// MyEditor.tsx
import { Editor } from '@tinymce/tinymce-react';
import { FC } from 'react';

interface MyEditorProps {
  value: string;
  onChange: (content: string) => void;
  textareaName?: string;
  placeholder?: string;
}

const MyEditor: FC<MyEditorProps> = ({
  value,
  onChange,
  textareaName = 'editor',
  placeholder = '',
}) => {
  return (
    <Editor
      tinymceScriptSrc="../../tinymce/tinymce.min.js"
      value={value}
      onEditorChange={onChange}
      textareaName={textareaName}
      init={{
        height: 350,
        menubar: false,
        plugins: [
          'advlist autolink lists link image charmap preview anchor',
          'table',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime media table paste code help wordcount',
        ],
        toolbar:
          'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | table | removeformat | help',
        content_style:
          'body { font-family:Tahoma, Arial, sans-serif; font-size:16px }',
        placeholder,
      }}
      className="bg-white min-h-[120px]"
    />
  );
};

export default MyEditor;

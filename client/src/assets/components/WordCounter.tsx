import React, { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

interface WordCounterProps {
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
}

const WordCounter: React.FC<WordCounterProps> = ({ placeholder, minRows = 5, maxRows = 15 }) => {
  const [text, setText] = useState("");

  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  return (
    <div className="w-full max-w-[50vw] ">
      <TextareaAutosize
        minRows={minRows}
        maxRows={maxRows}
        className=" min-h-[40vh] w-full p-3 border-2 border-blue-400 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
        placeholder={placeholder || "Type your answer..."}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="mt-2 text-gray-700 font-semibold">
        Words: {wordCount}
      </div>
    </div>
  );
};

export default WordCounter;

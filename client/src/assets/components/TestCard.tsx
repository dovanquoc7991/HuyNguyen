import React from "react";
import { Card, CardContent } from "@/assets/ui/card";
import { Button } from "@/assets/ui/button";
import {
  FaBookOpen,
  FaHeadphones,
  FaRegClock,
  FaRegListAlt,
  FaPlay,
  FaRedoAlt,
  FaLock,
} from "react-icons/fa";
import { useLastResult } from "../lib/useLastResult";

export type TestDataItem = {
  id: number;
  partID: number;
  section: string;
  part: number;
  title: string;
  questions: number;
  duration: number;
  locked?: boolean;
};

interface TestCardProps {
  test: TestDataItem;
  onStart: (test: TestDataItem) => void;
}

export function TestTitle({ title }: { title: string }) {
  return (
    <h4
      className="text-sm font-medium text-gray-800 truncate"
      title={title}
      style={{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        flexGrow: 1,
        minWidth: 0,
        textAlign: "left",
        fontWeight: 600,
      }}
    >
      {title}
    </h4>
  );
}

const TestCard: React.FC<TestCardProps> = ({ test, onStart }) => {
  const { data: lastResult, isLoading } = useLastResult(test.partID);

  const hasResult = !!lastResult;
  const label = hasResult ? "Retest" : "Start";
  const icon = hasResult ? <FaRedoAlt size={12} /> : <FaPlay size={12} />;

  return (
    <Card className="flex flex-col h-full min-h-[160px] rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300">
      <CardContent className="flex flex-col flex-1 p-4">
        {/* Title & Icon */}
        <div className="flex items-center gap-2 mb-2">
          {test.section === "Reading" ? (
            <FaBookOpen className="text-green-500 shrink-0" size={14} />
          ) : (
            <FaHeadphones className="text-green-500 shrink-0" size={14} />
          )}
          <TestTitle title={test.title} />
        </div>

        {/* Info section */}
        <div className="flex items-center text-sm text-gray-600 mb-3 gap-4">
          <span className="flex items-center gap-1">
            <FaRegListAlt className="shrink-0" size={12} />
            {test.questions} questions
          </span>
          <span className="flex items-center gap-1">
            <FaRegClock className="shrink-0" size={12} />
            {test.duration} min
          </span>
        </div>

        {/* Kết quả gần nhất */}
        <div className="mb-4 text-xs text-gray-500 min-h-[20px]">
          {isLoading ? (
            <span>Loading result...</span>
          ) : lastResult ? (
            <span>
              Most recent result: <b>{lastResult.correctCount}/{lastResult.total}</b>
            </span>
          ) : (
            <span>No result available</span>
          )}
        </div>

        {/* Action button */}
        <Button
          size="sm"
          className="mt-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 text-sm transition-all"
          onClick={() => onStart(test)}
        >
          {icon}
          {label}
          {test.locked ? (
            <FaLock className="text-red-500 ml-3" size={16} title="Locked" />
          ) : (
            <span/>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TestCard;

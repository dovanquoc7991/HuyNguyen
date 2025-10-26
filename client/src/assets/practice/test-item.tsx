import { Clock, Play, BarChart3, Check } from "lucide-react";
import { Badge } from "@//assets/ui/badge";

interface TestItemProps {
  title: string;
  duration: number;
  question: number;
  lastScore?: number;
  partNumber: number;
  onStart: () => void;
}

export default function TestItem({
  title,
  duration,
  question,
  lastScore,
  partNumber,
  onStart,
}: TestItemProps) {
  const iconBgColor =  "bg-blue-100";
  const iconColor = "text-blue-500";
  const scoreColor = "text-blue-500";

  return (
    <div 
      className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors`}
      onClick={onStart}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 ${iconBgColor} rounded-full flex items-center justify-center`}>
          <Play className={iconColor} size={14} />
        </div>
        <div>
          <h3 className="font-medium text-primary text-left text-base">{title}</h3>
          <div className="flex items-center space-x-4 text-sm text-secondary">
            <span className="flex items-center space-x-1">
              <Clock size={14} />
              <span>{duration} minutes</span>
            </span>
            <span className="flex items-center space-x-1">
              <BarChart3 size={14} />
              <span>{question} questions</span>
            </span>
            <Badge variant="outline" className="font-medium">
                      Part #{partNumber}
            </Badge>
          </div>
        </div>
      </div>
      <div className="text-right">
        {lastScore && (
          <>
            <span className={`text-sm font-medium ${scoreColor}`}>
              {lastScore / 10}
            </span>
            <p className="text-xs text-secondary">
              {"Last score"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

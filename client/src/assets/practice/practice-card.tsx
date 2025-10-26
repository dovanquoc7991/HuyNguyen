import { Card, CardContent, CardHeader } from "@/assets/ui/card";
import { Button } from "@/assets/ui/button";
import { Progress } from "@/assets/ui/progress";
import { ReactNode } from "react";

export enum PracticeType {
  READING,
  LISTENING
};

interface PracticeCardProps {
  title: string;
  description: string;
  practiceType: PracticeType;
  icon: ReactNode;
  progress: number;
  progressLabel: string;
  bgColor: string;
  textColor: string;
  children: ReactNode;
  onViewAll: (practiveType: PracticeType) => void;
  viewAllText: string;
}

export default function PracticeCard({
  title,
  description,
  practiceType,
  icon,
  progress,
  progressLabel,
  bgColor,
  textColor,
  children,
  onViewAll,
  viewAllText,
}: PracticeCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-primary mb-0">{title}</h2>
            <p className="text-sm text-secondary">{description}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-secondary">Progress</span>
            <span className={`text-sm font-medium ${textColor}`}>{progressLabel}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4 mb-6">
          {children}
        </div>

        <Button 
          className={`w-full ${bgColor.replace('bg-', 'bg-').replace('-50', '-500')} hover:${bgColor.replace('bg-', 'bg-').replace('-50', '-600')} text-white`}
          onClick={() => onViewAll(practiceType)}
        >
          {viewAllText}
        </Button>
      </CardContent>
    </Card>
  );
}

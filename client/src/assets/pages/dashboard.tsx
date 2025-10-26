import { Trophy, BookOpen, Headphones } from "lucide-react";
import { Card, CardContent } from "@/assets/ui/card";
import { me, useStats } from "@/assets/hooks/use-user";
import PracticeCard from "@/assets/practice/practice-card";
import { PracticeType } from "@/assets/practice/practice-card";
import TestItem from "@/assets/practice/test-item";
import { Skeleton } from "@/assets/ui/skeleton";
import { useLocation } from "wouter";
import { averageScores, calPercentage} from "@/assets/lib/utils"

interface StatsCalculated {
  averageScore: number;
  percentageReadingProgres: number;
  percentageListeningProgres: number;
};

export default function Dashboard() {
  const { data: user, isLoading: userLoading} = me();
  const [, setLocation] = useLocation();
  const { data: stats, isLoading: statsLoading } = useStats();

  const handleViewAll = (practiceType: PracticeType) => {
    if (practiceType === PracticeType.READING) {
      setLocation('/reading');
    } else if (practiceType === PracticeType.LISTENING) {
      setLocation('/listening');
    }
  };

  if (userLoading || statsLoading) {
    return (
      <div className="p-8">
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statsCalculated: StatsCalculated  = {
    averageScore: stats? averageScores(stats.latest_listening_score, stats.latest_reading_score) : 0,
    percentageReadingProgres: stats? calPercentage(stats.total_reading_completed, 1000) : 0,
    percentageListeningProgres: stats? calPercentage(stats.total_listening_completed, 1000) : 0,
  };

  return (
    <div className="p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-secondary">
          Ready to continue your IELTS preparation? Let's keep building your skills.
        </p>
      </div>

      {/* Progress Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-light rounded-lg flex items-center justify-center">
                <Trophy className="text-primary-green" size={20} />
              </div>
              <span className="text-2xl font-bold text-primary">
                {statsCalculated.averageScore}
              </span>
            </div>
            <h3 className="font-medium text-primary text-left">Overall Score</h3>
            <p className="text-sm text-secondary">Average across all skills</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <BookOpen className="text-blue-500" size={20} />
              </div>
              <span className="text-2xl font-bold text-primary">
                {stats?.latest_reading_score || 0}
              </span>
            </div>
            <h3 className="font-medium text-primary text-left">Reading Score</h3>
            <p className="text-sm text-secondary">Latest assessment</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Headphones className="text-purple-500" size={20} />
              </div>
              <span className="text-2xl font-bold text-primary">
                {stats?.latest_listening_score || 0}
              </span>
            </div>
            <h3 className="font-medium text-primary text-left">Listening Score</h3>
            <p className="text-sm text-secondary">Latest assessment</p>
          </CardContent>
        </Card>
      </div>

      {/* Practice Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Reading Practice */}
        <PracticeCard
          title="Reading Practice"
          description="Improve your comprehension skills"
          practiceType={PracticeType.READING}
          icon={<BookOpen className="text-blue-500" size={20} />}
          progress={statsCalculated.percentageReadingProgres}
          progressLabel={`${statsCalculated.percentageReadingProgres}%`}
          bgColor="bg-blue-50"
          textColor="text-blue-500"
          onViewAll={() => handleViewAll(PracticeType.READING)}
          viewAllText="View All Reading Tests" children={undefined}        >
          {/* {readingTests?.slice(0, 3).map((test: any) => (
            <TestItem
              key={test.id}
              title={test.title}
              duration={test.duration}
              question={test.question}
              lastScore={test.lastScore}
              onStart={() => console.log(`Start test ${test.id}`)}
            />
          ))} */}
        </PracticeCard>

        {/* Listening Practice */}
        <PracticeCard
          title="Listening Practice"
          description="Enhance your listening comprehension"
          practiceType={PracticeType.LISTENING}
          icon={<Headphones className="text-purple-500" size={20} />}
          progress={statsCalculated.percentageListeningProgres}
          progressLabel={`${statsCalculated.percentageListeningProgres}%`}
          bgColor="bg-purple-50"
          textColor="text-purple-500"
          onViewAll={() => handleViewAll(PracticeType.LISTENING)}
          viewAllText="View All Listening Tests" children={undefined}        >
          {/* {listeningTests?.slice(0, 3).map((test: any) => (
            <TestItem
              key={test.id}
              title={test.title}
              duration={test.duration}
              question={test.question}
              lastScore={test.lastScore}
              onStart={() => console.log(`Start test ${test.id}`)}
            />
          ))} */}
        </PracticeCard>
      </div>
    </div>
  );
}

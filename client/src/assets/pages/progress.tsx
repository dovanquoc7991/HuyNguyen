import { TrendingUp, Target, Award, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@//assets/ui/card";
import { Progress } from "@//assets/ui/progress";
import { Skeleton } from "@//assets/ui/skeleton";
import { useStats } from "@/assets/hooks/use-user";
import { averageScores, calPercentage} from "@/assets/lib/utils"

export default function ProgressPage() {
  const { data: stats, isLoading: statsLoading } = useStats();

  if (statsLoading) {
    return (
      <div className="p-8">
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-green-light rounded-lg flex items-center justify-center">
            <TrendingUp className="text-primary-green" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">Progress & Performance</h1>
            <p className="text-secondary">Track your improvement across all skills</p>
          </div>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-light rounded-lg flex items-center justify-center mx-auto mb-4">
              <Award className="text-primary-green" size={20} />
            </div>
            <div className="text-2xl font-bold text-primary mb-1">
              {stats ? averageScores(stats.average_listening_score, stats.average_reading_score) : "0.0"}
            </div>
            <p className="text-sm text-secondary">Overall Score</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Target className="text-blue-500" size={20} />
            </div>
            <div className="text-2xl font-bold text-primary mb-1">
              {stats ? stats.total_listening_completed + stats.total_reading_completed : 0}
            </div>
            <p className="text-sm text-secondary">Tests Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="text-orange-500" size={20} />
            </div>
            <div className="text-2xl font-bold text-primary mb-1">
              {stats ? Math.max(Number(stats.best_listening_score), Number(stats.best_reading_score)) : "0.0"}
            </div>
            <p className="text-sm text-secondary">Best Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Skill Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Reading Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <i className="fas fa-book-open text-blue-500"></i>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary">Reading Progress</h2>
                <p className="text-sm text-secondary">Comprehension and analysis skills</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-500">
                    {stats ? stats.average_reading_score : "0.0"}
                  </div>
                  <p className="text-xs text-secondary">Average</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">
                    {stats ? stats.best_reading_score : "0.0"}
                  </div>
                  <p className="text-xs text-secondary">Best</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {stats ? stats.total_reading_completed : 0}
                  </div>
                  <p className="text-xs text-secondary">Tests</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-secondary">Progress</span>
                  <span className="text-sm font-medium text-blue-500">
                    {stats ? calPercentage(stats.total_reading_completed, 1000) : 0}%
                  </span>
                </div>
                <Progress value={stats ? calPercentage(stats.total_reading_completed, 1000) : 0} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listening Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <i className="fas fa-headphones text-purple-500"></i>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary">Listening Progress</h2>
                <p className="text-sm text-secondary">Audio comprehension skills</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-500">
                    {stats ? stats.average_listening_score : "0.0"}
                  </div>
                  <p className="text-xs text-secondary">Average</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">
                    {stats ? stats.best_listening_score : "0.0"}
                  </div>
                  <p className="text-xs text-secondary">Best</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {stats ? stats.total_listening_completed : 0}
                  </div>
                  <p className="text-xs text-secondary">Tests</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-secondary">Progress</span>
                  <span className="text-sm font-medium text-purple-500">
                    {stats ? calPercentage(stats.total_listening_completed, 1000) : 0}%
                  </span>
                </div>
                <Progress value={stats ? calPercentage(stats.total_listening_completed, 1000) : 0} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

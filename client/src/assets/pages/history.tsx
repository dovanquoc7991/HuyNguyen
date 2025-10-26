import { History as HistoryIcon, BookOpen, Headphones, Calendar, Award } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/assets/ui/card";
import { Badge } from "@/assets/ui/badge";
// import { useUserTestSessions } from "@/assets/hooks/use-user";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/assets/lib/api";
import { Skeleton } from "@/assets/ui/skeleton";
import { format } from "date-fns";

export default function History() {
  const { data: sessions, isLoading: sessionsLoading } = useUserTestSessions();
  
  const { data: tests } = useQuery({
    queryKey: [api.getTests()],
  });

  if (sessionsLoading) {
    return (
      <div className="p-8">
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getTestById = (id: number) => tests?.find((t: any) => t.id === id);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 70) return "text-blue-500";
    if (score >= 60) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 70) return "secondary";
    return "outline";
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-green-light rounded-lg flex items-center justify-center">
            <HistoryIcon className="text-primary-green" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">Practice History</h1>
            <p className="text-secondary">Review your test performance and progress</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {sessions?.length || 0}
            </div>
            <p className="text-sm text-secondary">Total Tests</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-500 mb-1">
              {sessions?.filter((s: any) => s.completedAt).length || 0}
            </div>
            <p className="text-sm text-secondary">Completed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-500 mb-1">
              {sessions?.filter((s: any) => s.score && s.score >= 80).length || 0}
            </div>
            <p className="text-sm text-secondary">High Scores (8.0+)</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary-green mb-1">
              {Math.max(...(sessions?.map((s: any) => s.score || 0) || [0])) / 10 || 0}
            </div>
            <p className="text-sm text-secondary">Best Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Test History */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-primary">Recent Tests</h2>
        </CardHeader>
        <CardContent>
          {sessions?.length ? (
            <div className="space-y-4">
              {sessions.map((session: any) => {
                const test = getTestById(session.testId);
                const isCompleted = !!session.completedAt;
                
                return (
                  <div 
                    key={session.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        test?.type === "reading" ? "bg-blue-50" : "bg-purple-50"
                      }`}>
                        {test?.type === "reading" ? (
                          <BookOpen className={`${test?.type === "reading" ? "text-blue-500" : "text-purple-500"}`} size={20} />
                        ) : (
                          <Headphones className="text-purple-500" size={20} />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-primary">
                          {test?.title || "Unknown Test"}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-secondary">
                          <span className="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span>{format(new Date(session.startedAt), "MMM dd, yyyy")}</span>
                          </span>
                          {session.timeSpent && (
                            <span>{session.timeSpent} minutes</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        {isCompleted ? (
                          <>
                            {session.score && (
                              <div className={`text-lg font-bold ${getScoreColor(session.score)}`}>
                                {(session.score / 10).toFixed(1)}
                              </div>
                            )}
                            <Badge variant={session.score ? getScoreBadgeVariant(session.score) : "outline"}>
                              Completed
                            </Badge>
                          </>
                        ) : (
                          <Badge variant="outline">
                            In Progress
                          </Badge>
                        )}
                      </div>
                      
                      {isCompleted && session.score && session.score >= 80 && (
                        <Award className="text-yellow-500" size={20} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <HistoryIcon className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-secondary mb-2">No test history yet</p>
              <p className="text-sm text-secondary">
                Start taking practice tests to see your history here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      {sessions?.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Recent Performance */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-primary">Recent Performance</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary">Average Score (Last 5 tests)</span>
                  <span className="font-medium text-primary">
                    {(sessions?.slice(0, 5).reduce((acc: number, s: any) => acc + (s.score || 0), 0) / Math.min(5, sessions?.length) / 10).toFixed(1)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary">Completion Rate</span>
                  <span className="font-medium text-primary">
                    {Math.round((sessions?.filter((s: any) => s.completedAt).length / sessions?.length) * 100)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary">Best Recent Score</span>
                  <span className="font-medium text-green-500">
                    {Math.max(...(sessions?.slice(0, 10).map((s: any) => s.score || 0) || [0])) / 10}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Type Breakdown */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-primary">Test Type Breakdown</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="text-blue-500" size={16} />
                    <span className="text-sm text-secondary">Reading Tests</span>
                  </div>
                  <span className="font-medium text-primary">
                    {sessions?.filter((s: any) => {
                      const test = getTestById(s.testId);
                      return test?.type === "reading";
                    }).length || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Headphones className="text-purple-500" size={16} />
                    <span className="text-sm text-secondary">Listening Tests</span>
                  </div>
                  <span className="font-medium text-primary">
                    {sessions?.filter((s: any) => {
                      const test = getTestById(s.testId);
                      return test?.type === "listening";
                    }).length || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

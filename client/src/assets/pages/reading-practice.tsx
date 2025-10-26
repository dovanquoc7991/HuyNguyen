import { BookOpen, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@//assets/ui/card";
import { Skeleton } from "@//assets/ui/skeleton";
import { Progress } from "@//assets/ui/progress";
import { Badge } from "@//assets/ui/badge";
import { Button } from "@//assets/ui/button";
import { Pagination } from "@/assets/components/pagination";
import { useLocation } from "wouter";
import React, { useState } from "react"
import { calPercentage} from "@/assets/lib/utils"
import { useStats, useTestList } from "@/assets/hooks/use-user";
import { navigate } from "wouter/use-browser-location";

const ItemsPerPage = 5;

export default function ReadingPractice() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: testList, isLoading: testListLoading } = useTestList('Reading');

  const [currentPage, setCurrentPage] = useState(1);
  
  const [, setLocation] = useLocation();

  if (statsLoading || testListLoading) {
    return (
      <div className="p-8">
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const testArray = Array.isArray(testList?.exams) ? testList.exams : [];
  const startIndex = (currentPage - 1) * ItemsPerPage
  const endIndex = startIndex + ItemsPerPage
  const paginatedTests = testArray.slice(startIndex, endIndex)
  const totalPages = Math.ceil(testArray.length / ItemsPerPage)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
            <BookOpen className="text-blue-500" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary mb-0">Reading Practice</h1>
            <p className="text-secondary">Improve your reading comprehension skills</p>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {stats?.total_reading_completed || 0}
                </div>
                <p className="text-sm text-secondary">Tests Completed</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500 mb-1">
                  {stats?.best_reading_score || "0.0"}
                </div>
                <p className="text-sm text-secondary">Best Score</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500 mb-1">
                  {stats ? calPercentage(stats.total_reading_completed, 1000) : "0"}%
                </div>
                <p className="text-sm text-secondary">Progress</p>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-secondary">Overall Progress</span>
                <span className="text-sm font-medium text-blue-500">
                  {stats ? calPercentage(stats.total_reading_completed, 1000) : "0"}%
                </span>
              </div>
              <Progress value={stats ? calPercentage(stats.total_reading_completed, 1000) : 0} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        {/* Tests List */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-primary">Available Tests</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paginatedTests.map((test, index) => (
                <div key={test.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="font-medium">
                      Test #{index + 1}
                    </Badge>
                    <div>
                      <h3 className="font-medium text-primary text-base">{test.description !== '' ? test.description  : `Reading test ${index + 1}`}</h3>
                      <div className="flex items-center space-x-4 text-sm text-secondary">
                        <span className="flex items-center space-x-1">
                          <BarChart3 size={14} />
                          <span>{test.parts} parts</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => navigate(`/selectpart?id=${test.id}&type=Reading`)}
                  >
                    Select
                  </Button>
                </div>
              ))}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                className="justify-center"
              />

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

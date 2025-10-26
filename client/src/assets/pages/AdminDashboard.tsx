import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Toaster } from "../components/ui/toaster";
import { usePartListByType } from "../hooks/use-user";

// Sử dụng 2 hook cho Reading và Listening
export default function AdminDashboard() {
  const { data: rPartList, isLoading: isLoadingReading } = usePartListByType("Reading");
  const { data: lPartList, isLoading: isLoadingListening } = usePartListByType("Listening");
  const { data: wPartList, isLoading: isLoaddingWriting } = usePartListByType("Writing");
  const { data: sPartList, isLoading: isLoaddingSpeaking } = usePartListByType("Speaking");




  console.log("Reading Tests:", rPartList?.sections);
  console.log("Listening Tests:", lPartList?.sections);

  const totalReadingTests = Array.isArray(rPartList?.sections) ? rPartList.sections.length : 0;
  const totalListeningTests = Array.isArray(lPartList?.sections) ? lPartList.sections.length : 0;
  const totalWritingTests = Array.isArray(wPartList?.sections) ? wPartList.sections.length : 0;
  const totalSpeakingTests = Array.isArray(sPartList?.sections) ? sPartList.sections.length : 0;

  return (
    <>
      <Toaster />
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-600 mt-1">
              Overview of your IELTS test management system
            </p>
          </div>
          <Link href="/admin/create-reading-test">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <i className="fas fa-plus mr-2"></i>
              Create New Test
            </Button>
          </Link>
        </div>
      </header>

      <div className="p-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reading Tests</CardTitle>
              <i className="fas fa-book-reader text-green-600"></i>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingReading ? <Skeleton className="h-8 w-12" /> : totalReadingTests}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Listening Tests</CardTitle>
              <i className="fas fa-headphones text-blue-600"></i>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingListening ? <Skeleton className="h-8 w-12" /> : totalListeningTests}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Speaking Tests</CardTitle>
              <i className="fas fa-microphone text-purple-600"></i>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoaddingSpeaking ? <Skeleton className="h-8 w-12" /> : totalSpeakingTests}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Writing Tests</CardTitle>
              <i className="fas fa-pen-fancy text-orange-600"></i>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoaddingWriting ? <Skeleton className="h-8 w-12" /> : totalWritingTests}
              </div>
            </CardContent>
          </Card>
        </div>


      </div>
    </>
  );
}
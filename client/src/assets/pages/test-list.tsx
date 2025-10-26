import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { Input } from "@components/ui/input";
import { useToast } from "@hooks/use-toast";
import { queryClient } from "@lib/queryClient";
import { useDeleteExam, usePartListByType } from "../hooks/use-user";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@components/ui/alert-dialog";
import { Pagination } from "@components/pagination";
import { FaRegClock, FaRegListAlt, FaFileAlt, FaFileAudio, FaPencilAlt, FaMicrophone } from "react-icons/fa"; // Thêm icon cho tương lai

const ITEMS_PER_PAGE = 30;

// BƯỚC 1: Mở rộng Type để bao gồm các kỹ năng trong tương lai
type TestType = "Reading" | "Listening" | "Writing" | "Speaking";

// BƯỚC 2: Tạo đối tượng cấu hình tập trung
// Đây là phần quan trọng nhất. Mọi thông tin đặc trưng của từng loại test nằm ở đây.
const TEST_TYPE_CONFIG = {
  Reading: {
    title: "Reading Tests",
    Icon: FaFileAlt,
    colorClasses: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700",
    },
    createLink: "/admin/create-reading-test",
    editLinkBase: "/admin/create-reading-test",
  },
  Listening: {
    title: "Listening Tests",
    Icon: FaFileAudio,
    colorClasses: {
      bg: "bg-green-100",
      text: "text-green-600",
      button: "bg-green-600 hover:bg-green-700",
    },
    createLink: "/admin/create-listening-test",
    editLinkBase: "/admin/create-listening-test",
  },
  // DỄ DÀNG MỞ RỘNG TRONG TƯƠNG LAI
  Writing: {
    title: "Writing Tests",
    Icon: FaPencilAlt,
    colorClasses: {
      bg: "bg-purple-100",
      text: "text-purple-600",
      button: "bg-purple-600 hover:bg-purple-700",
    },
    createLink: "/admin/create-writing-test",
    editLinkBase: "/admin/create-writing-test",
  },
  Speaking: {
    title: "Speaking Tests",
    Icon: FaMicrophone,
    colorClasses: {
      bg: "bg-orange-100",
      text: "text-orange-600",
      button: "bg-orange-600 hover:bg-orange-700",
    },
    createLink: "/admin/create-speaking-test",
    editLinkBase: "/admin/create-speaking-test",
  },

};

// Lấy danh sách các loại test có sẵn từ config
// const AVAILABLE_TEST_TYPES = ["Reading", "Listening"] as TestType[]; // Chỉ hiện Reading và Listening
// Khi nào sẵn sàng, bạn chỉ cần thêm vào đây:
const AVAILABLE_TEST_TYPES = ["Reading", "Listening", "Writing", "Speaking"] as TestType[];

export default function TestList() {
  const { toast } = useToast();
  const deleteExamMutation = useDeleteExam();

  const [selectedType, setSelectedType] = useState<TestType>(AVAILABLE_TEST_TYPES[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // BƯỚC 3: Tối ưu việc gọi API. Chỉ gọi hook cho loại test đang được chọn.
  const { data: partList, isLoading } = usePartListByType(selectedType);

  // Lấy cấu hình hiện tại dựa trên type đã chọn
  const config = TEST_TYPE_CONFIG[selectedType];
  
  // Logic xử lý dữ liệu chung, không cần lặp lại
  const rawTests = Array.isArray(partList?.sections) ? partList.sections : [];
  const filteredTests = rawTests.filter(test =>
    test.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredTests.length / ITEMS_PER_PAGE);
  const paginatedTests = filteredTests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType]);

  const handleDeleteTest = async (id: number) => {
    deleteExamMutation.mutate(id, {
      onSuccess: () => {
        toast({ title: "Success", description: "Test deleted successfully" });
        // Invalidate query cho loại test vừa xóa là đủ
        queryClient.invalidateQueries({ queryKey: ["part-list-by-type", selectedType] });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to delete test", variant: "destructive" });
      },
    });
  };

  return (
    <>
      {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">All Tests</h2>
              <p className="text-gray-600 mt-1">Manage and organize your IELTS tests</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              {/* BƯỚC 4: Tạo các nút chọn loại test một cách tự động từ cấu hình */}
              <div className="flex items-center space-x-2 p-1 bg-gray-100 rounded-lg">
                {AVAILABLE_TEST_TYPES.map(type => (
                  <Button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    variant={selectedType === type ? 'default' : 'ghost'}
                    className="flex-1 sm:flex-auto"
                  >
                    {type}
                  </Button>
                ))}
              </div>
              <div className="w-full sm:w-64">
                <Input
                  type="text"
                  placeholder="Search by test name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </header>

        {/* BƯỚC 5: Render nội dung chỉ một lần, sử dụng dữ liệu từ `config` */}
        <div className="p-8">
          <Card>
            <CardHeader>
              <CardTitle>{config.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-48" /><Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2"><Skeleton className="h-8 w-16" /><Skeleton className="h-8 w-16" /></div>
                    </div>
                  ))}
                </div>
              ) : rawTests.length === 0 ? (
                <div className="text-center py-12">
                  <config.Icon className={`mx-auto text-6xl text-gray-400 mb-4`} />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No {selectedType.toLowerCase()} tests found</h3>
                  <p className="text-gray-600 mb-6">Create your first IELTS {selectedType.toLowerCase()} test to get started</p>
                  <Link href={config.createLink}>
                    <Button className={config.colorClasses.button}><i className="fas fa-plus mr-2"></i>Create {selectedType} Test</Button>
                  </Link>
                </div>
              ) : paginatedTests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <i className="fas fa-search text-6xl text-gray-400 mb-4"></i>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No tests found</h3>
                  <p>Your search for "{searchQuery}" did not match any {selectedType.toLowerCase()} tests.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {paginatedTests.map((test) => (
                      <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 ${config.colorClasses.bg} rounded-lg flex items-center justify-center`}>
                            <config.Icon className={config.colorClasses.text} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{test.title}</h4>
                            {(selectedType === 'Listening' || selectedType === 'Reading') && (
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                <span className="flex items-center gap-1"><FaRegListAlt className="shrink-0" />{test.questions_count} questions</span>
                                <span className="flex items-center gap-1"><FaRegClock className="shrink-0" />{test.time} min</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* {(selectedType === 'Reading' || selectedType === 'Listening') && ( */}
                            <Link href={`${config.editLinkBase}/${test.id}`}>
                              <Button variant="outline" size="sm"><i className="fas fa-edit mr-2"></i>Edit</Button>
                            </Link>
                          {/* )} */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50"><i className="fas fa-trash mr-2"></i>Delete</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the test "{test.title}".</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteTest(test.exam_id)} className="bg-red-600 hover:bg-red-700">Continue</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}/>
                </>
              )}
            </CardContent>
          </Card>
        </div>
    </>
  );
}
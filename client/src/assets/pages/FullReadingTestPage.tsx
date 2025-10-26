import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import BaseReadingTestPage from './BaseReadingTestPage';
import { useSaveResult } from '../hooks/use-user';
import { useToast } from '../hooks/use-toast';
import Timer from '../components/Timer';
import ConfirmDialog from '../components/ConfirmDialog';
import { me } from '../hooks/use-user';
import { FaHome, FaBars } from 'react-icons/fa';
import OptionsModal from '../components/OptionsModal';
import { Question } from './BaseReadingTestPage';
import SubmitButton from '../components/SubmitButton';
import QuestionNavButtons from '../components/QuestionNavButtons';

// Cấu trúc dữ liệu cho một phần thi (part)
interface TestPart {
    id: string;
    exam_id: number;
    title: string;
    time: number;
    part_number: number;
    // Thêm trường để lưu câu hỏi và điểm sau khi fetch
    questions?: Question[];
    score?: number;
    total?: number;
}

const FullReadingTestPage: React.FC = () => {
    const [, params] = useRoute("/practice/Reading/full-test/:id");
    const examId = params?.id;

    const [testParts, setTestParts] = useState<TestPart[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const [activeProgressBar, setActiveProgressBar] = useState<React.ReactNode>(null);
    const [activePartIndex, setActivePartIndex] = useState(0); // State để theo dõi tab đang hoạt động
    const [highlightedQ, setHighlightedQ] = useState<number | string | null>(1);

    // State chung cho toàn bộ bài thi
    const [totalTime, setTotalTime] = useState(60 * 60); // Mặc định 60 phút, sẽ được cập nhật từ API
    const [timeLeft, setTimeLeft] = useState(totalTime);
    const [submitted, setSubmitted] = useState(false);
    // State để lưu câu trả lời cho tất cả các phần, key là part_number
    const [allAnswers, setAllAnswers] = useState<Record<number, Record<string, string | string[] | Record<string, string>>>>({});
    const [openDialog, setOpenDialog] = useState(false);

    const { toast } = useToast();
    const currentUserInfo = me();

    // Sử dụng useEffect để thiết lập dummy data, giống như gọi API
    useEffect(() => {
        setIsLoading(true); // Bắt đầu loading
        // Dữ liệu giả để test
        const dummyParts: TestPart[] = [
            { id: '326', exam_id: 1, title: "Reading Test Part 1", time: 20, part_number: 1 },
            { id: '131', exam_id: 1, title: "Reading Test Part 2", time: 20, part_number: 2 },
            { id: '155', exam_id: 1, title: "Reading Test Part 3", time: 20, part_number: 3 }
        ];

        setTestParts(dummyParts);

        // Tính tổng thời gian từ dữ liệu giả
        const totalDuration = dummyParts.reduce((sum, part) => sum + (part.time || 0), 0);
        setTotalTime(totalDuration * 60);
        setTimeLeft(totalDuration * 60);

        setIsLoading(false); // Kết thúc loading
    }, []); // Mảng rỗng `[]` đảm bảo effect này chỉ chạy một lần sau khi component được mount

    const handleAnswersChange = (partNumber: number, newAnswers: Record<string, string | string[] | Record<string, string>>) => {
        setAllAnswers(prev => ({
            ...prev,
            [partNumber]: newAnswers
        }));
    };

    const handleSubmit = () => {
        // Tính điểm cho từng phần
        const updatedTestParts = testParts.map(part => {
            const partAnswers = allAnswers[part.part_number] || {};
            const questions = part.questions || [];
            let score = 0;
            const total = questions.reduce((sum, q) => sum + (Array.isArray(q.answers) ? q.answers.length : 1), 0);

            questions.forEach(q => {
                const key = String(q.number);
                const userAns = partAnswers[key];

                if (q.type === 'MULTI') {
                    const correct = Array.isArray(q.answers) ? q.answers.map(a => a).sort() : [];
                    const userAnsArr = Array.isArray(userAns) ? (userAns as string[]).map(a => a).sort() : [];
                    if (userAnsArr.length === correct.length && userAnsArr.every((v, i) => v === correct[i])) {
                        score++;
                    }
                } else { // FILL_BLANKS, SINGLE_CHOICE, etc.
                    const correct = Array.isArray(q.answers) ? q.answers[0] : '';
                    const userAnsStr = typeof userAns === 'string' ? userAns.trim() : '';
                    if (userAnsStr && userAnsStr.toLowerCase() === correct.toLowerCase()) {
                        score++;
                    }
                }
            });

            return { ...part, score, total };
        });

        setTestParts(updatedTestParts);
        setSubmitted(true);
        setOpenDialog(false);
        toast({ title: "Success", description: "Test submitted successfully!" });

        // Logic gửi kết quả tổng hợp lên server
        const totalScore = updatedTestParts.reduce((sum, part) => sum + (part.score || 0), 0);
        const totalQuestions = updatedTestParts.reduce((sum, part) => sum + (part.total || 0), 0);
        console.log(`Total Score: ${totalScore}/${totalQuestions}`);
        // try {
        //     const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
        //     saveResultMutation.mutate({ ... });
        // } catch (e) {
        //     console.error("Lưu kết quả thất bại", e);
        // }
        // Ở đây bạn sẽ gọi API để lưu kết quả tổng hợp
    };

    if (isLoading) return <div className="p-8 text-center">Loading full test...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (testParts.length === 0) return <div className="p-8 text-center">No test parts available.</div>;

    return (
        <div className="full-test-container bg-gray-50 min-h-screen">
            {/* Header chung cho cả bài thi */}
            <nav className="top-menu-simple sticky top-0 z-20">
                <div className="menu-content">
                    <div className="left-section">
                        <div className="test-info">
                            {/* Lấy title từ part đầu tiên làm title chung */}
                            <h2>{testParts[0]?.title.replace(/Part\s*\d/i, 'Full Test')}</h2>
                            <div className="user-info">
                                <span>Test taker ID: {currentUserInfo?.data?.firstName} {currentUserInfo?.data?.lastName}</span>
                                <Timer
                                    timeLeft={timeLeft}
                                    submitted={submitted}
                                    onTimeout={handleSubmit}
                                    setTimeLeft={setTimeLeft}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="right-section">
                        <button className="icon-btn" onClick={() => window.history.back()}>
                            <FaHome />
                        </button>
                        <button className="icon-btn" onClick={() => setIsOptionsOpen(true)}>
                            <FaBars />
                        </button>
                    </div>
                </div>
            </nav>

            <div className="p-0 md:p-0" style={{ paddingBottom: '60px' }}> {/* Add padding to avoid content being hidden by the fixed footer */}
                {/* Tab Content */}
                {testParts.map((part, index) => (
                    <div key={part.id} style={{ display: activePartIndex === index ? 'block' : 'none' }}>
                        <BaseReadingTestPage
                            skill="Reading"
                            part={`part${part.part_number}`}
                            id={part.id}
                            submitted={submitted}
                            highlightedQ={highlightedQ}
                            answers={allAnswers[part.part_number] || {}}
                            onAnswersChange={(newAnswers) => handleAnswersChange(part.part_number, newAnswers)}
                            idPrefix={`part${part.part_number}`}
                            onQuestionsLoad={(questions) => {
                                // Lưu danh sách câu hỏi vào state của FullReadingTestPage
                                setTestParts(prevParts => prevParts.map(p =>
                                    p.id === part.id ? { ...p, questions } : p
                                ));
                            }}
                            renderFooter={(progressBar, setQ) => {
                                // When this part is active, we lift its progress bar up to the state
                                if (activePartIndex === index) {
                                    // Use a timeout to avoid React state update loop warning
                                    setTimeout(() => setActiveProgressBar(progressBar), 0);
                                }
                                // This part's footer is now controlled by the parent, so we render nothing here.
                                return null;
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Shared Footer */}
            <footer className="bottom-status" style={{ justifyContent: 'space-between', padding: '8px 20px 0px 20px' }}>
                <div className="flex items-center space-x-4" style={{ width: '150px' }}>
                    {!submitted && (
                        <QuestionNavButtons
                            current={highlightedQ}
                            questions={testParts[activePartIndex]?.questions || []}
                            onChange={setHighlightedQ}
                        />
                    )}
                </div>
                <div className="flex-grow flex justify-center items-center">
                    {testParts.map((part, index) => (
                        <button
                            key={part.id}
                            onClick={() => setActivePartIndex(index)}
                            className={`whitespace-nowrap py-2 px-3 rounded-md font-medium text-sm ${activePartIndex === index
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                }`}
                        >
                            Part {part.part_number}
                        </button>
                    ))}
                    <div className="flex-grow flex justify-center">{activeProgressBar}</div>
                </div>
                <div className="flex justify-end" style={{ width: '150px' }}>
                    {!submitted && (
                        <>
                            <SubmitButton onClick={() => setOpenDialog(true)} />
                        </>
                    )}
                </div>
            </footer>

            <ConfirmDialog
                open={openDialog}
                onConfirm={handleSubmit}
                onCancel={() => setOpenDialog(false)}
                message="Are you sure you want to submit the entire test?"
            />
            <OptionsModal
                isOpen={isOptionsOpen}
                onClose={() => setIsOptionsOpen(false)}
            />
        </div>
    );
};

export default FullReadingTestPage;
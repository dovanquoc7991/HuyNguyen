import React, { useEffect, useRef, useState } from 'react';
import QuestionNavButtons from '../components/QuestionNavButtons';
import SubmitButton from '../components/SubmitButton';
import ConfirmDialog from '../components/ConfirmDialog';
import QuestionList from '../components/QuestionList';
import ProgressBar from '../components/ProgressBar';
import ResultTable from '../components/ResultTable';
import '../css/ListeningTestPage.css';
import { me, useSaveResult } from '../hooks/use-user';
import { FaArrowsAltH, FaBars, FaBell, FaHome, FaWifi } from 'react-icons/fa';
import OptionsModal from '../components/OptionsModal';
import ExplanationModal from '../components/ExplanationModal';
import AudioPlayer from '../components/AudioPlayer';
import { capitalizeFirstLetter, separateLettersAndNumbers, capitalizeEachWord, Question, QuestionType } from '../utils/helpers';


export interface MatchTableColumn {
    key: string;
    label: string;
}

export interface Group {
    paragraph?: string;
    choices?: string[];
    type: QuestionType;
    instruction: string;
    questions: Question[];
    answers?: Record<string, string>;
}

export interface ListeningTest {
    id: string;
    title: string;
    time: number;
    passage: string[];
    groups: Group[];
    audio_url?: string;
    explanation?: string;
}

export interface ListeningTestPageProps {
    skill: string;
    part: string;
    id: string;
}

function getMultiRange(q: Question) {
    const match = q.question.match(/^(\d+)[–-](\d+)/);
    if (match) {
        const from = parseInt(match[1], 10);
        const to = parseInt(match[2], 10);
        return { from, to };
    }
    if (Array.isArray(q.answers)) {
        return { from: q.number, to: q.number + q.answers.length - 1 };
    }
    return { from: q.number, to: q.number };
}

const ListeningTestPage: React.FC<ListeningTestPageProps> = ({ skill, part, id }) => {
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number>(16 * 60);
    const [answers, setAnswers] = useState<Record<string, string | string[] | Record<string, string>>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [leftWidth, setLeftWidth] = useState<number>(() => {
        if (typeof window !== "undefined") {
            return Math.floor(window.innerWidth / 2);
        }
        return 300;
    });
    const [isResizing, setIsResizing] = useState(false);
    const [testData, setTestData] = useState<ListeningTest | null>(null);
    const [highlightedQ, setHighlightedQ] = useState<number | string | null>(1);
    const questionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const [openDialog, setOpenDialog] = useState(false);
    const saveResultMutation = useSaveResult();
    const currentUserInfo = me();

    const [showExplanation, setShowExplanation] = useState(false);
    const [explanationContent, setExplanationContent] = useState('');
    const [loadingExplanation, setLoadingExplanation] = useState(false);

    // Lấy tất cả câu hỏi từ các group
    const allQuestions = testData?.groups.flatMap(g => g.questions) || [];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
                const { apiRequest } = await import("@/assets/lib/queryClient");
                const data = await apiRequest("GET", `/api/section/${id}`, undefined, token);
                if (data && data.id) {
                    let passage = data.passage;
                    if (typeof passage === 'string') {
                        try {
                            passage = JSON.parse(passage);
                        } catch {
                            passage = [passage];
                        }
                    }
                    console.log("ListeningTestPage data:", data);
                    setTestData({
                        id: data.id,
                        title: data.title,
                        time: typeof data.time === "string" ? Number(data.time) : data.time,
                        passage,
                        groups: data.groups || [],
                        audio_url: data.audio_url || "",
                        explanation: data.explanation || '',
                    });
                } else {
                    setTestData(null);
                }
            } catch (error) {
                setTestData(null);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        if (isResizing) {
            document.body.classList.add('resizing');
        } else {
            document.body.classList.remove('resizing');
        }
    }, [isResizing]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent | TouchEvent) => {
            if (!isResizing) return;
            const mainContainer = document.querySelector('.listening-main-container');
            if (!mainContainer) return;
            const rect = mainContainer.getBoundingClientRect();
            // Lấy vị trí X cho cả chuột và cảm ứng
            let clientX = (e as MouseEvent).clientX;
            if ((e as TouchEvent).touches) {
                clientX = (e as TouchEvent).touches[0].clientX;
            }
            const newWidth = clientX - rect.left;
            if (newWidth >= 300 && newWidth <= rect.width - 300) {
                setLeftWidth(newWidth);
            }
        };

        const handleMouseUp = () => setIsResizing(false);

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchmove', handleMouseMove);
        document.addEventListener('touchend', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleMouseMove);
            document.removeEventListener('touchend', handleMouseUp);
        };
    }, [isResizing]);

    // Scroll đến đúng câu hỏi hoặc blank khi highlightedQ thay đổi
    useEffect(() => {
        if (highlightedQ) {
            // Tìm câu hỏi và group tương ứng
            const questionNumber = Number(String(highlightedQ).split('-')[0]);
            const group = testData?.groups.find(g =>
                g.questions.some(q => q.number === questionNumber)
            );

            // Chỉ scroll ở đây nếu không phải là loại câu hỏi đã có logic scroll riêng
            // Ví dụ: FILL_BLANKS đã tự scroll bên trong component của nó
            if (group && group.type !== 'FILL_BLANKS' && group.type !== 'DRAG_DROP' && group.type !== 'MATCHING_HEADER') {
                if (questionRefs.current[highlightedQ]) {
                    questionRefs.current[highlightedQ]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }
    }, [highlightedQ]);

    const handleChange = (q: string, value: string) => setAnswers(prev => ({ ...prev, [q]: value }));

    const getMultiSquareColor = (q: Question, idx: number) => {
        const key = `${q.number}`;
        const userAns = Array.isArray(answers[key]) ? answers[key] : [];
        if (!submitted) {
            return userAns[idx] ? '#FFD700' : '#BDBDBD';
        }
        const correct = Array.isArray(q.answers) ? q.answers.map(a => a).sort() : [];
        const ans = userAns[idx] ? userAns[idx] : '';
        if (ans && correct.includes(ans)) return '#8BC34A';
        return ans ? '#F44336' : '#BDBDBD';
    };

    async function handleExplainClick() {
        setLoadingExplanation(true);
        setShowExplanation(true);
        try {
            console.log("testData?.explanation:", testData?.explanation);
            setExplanationContent(testData?.explanation || 'Không có lời giải cho phần này.');
        } catch (e) {
            setExplanationContent('Không thể tải lời giải. Vui lòng thử lại.');
        }
        setLoadingExplanation(false);
    }

    // Status color cho từng loại, hỗ trợ cả FILL_BLANKS
    const getSquareColor = (i: number | string): string => {
        let q: Question | undefined;
        let blankNum: string | undefined;
        if (typeof i === "string" && i.includes("-")) {
            const [qNum, bNum] = i.split("-");
            q = allQuestions.find(q => q.number === Number(qNum));
            blankNum = bNum;
        } else {
            q = allQuestions.find(q => q.number === Number(i));
        }
        if (!q) return '#BDBDBD';

        // Lấy group chứa câu hỏi này để lấy type
        const group = testData?.groups.find(g => g.questions.some(qq => qq.number === q?.number));
        const type = group?.type;
        const key = `${q.number}`;
        if (!submitted) {
            if (type === 'MULTI') {
                return Array.isArray(answers[key]) && answers[key].length > 0 ? '#FFD700' : '#BDBDBD';
            }
            return answers[key] ? '#FFD700' : '#BDBDBD';
        }

        if (type === 'MULTI') {
            const correct = Array.isArray(q.answers) ? q.answers.map(a => a).sort() : [];
            const userAns = Array.isArray(answers[key]) ? (answers[key] as string[]).map(a => a).sort() : [];
            if (userAns.length === correct.length && userAns.every((v, i) => v === correct[i])) return '#8BC34A';
            return userAns.length > 0 ? '#F44336' : '#BDBDBD';
        } else if (type === 'FILL_BLANKS') {
            let userAns = answers[key];
            let correctAns;
            let isCorrect = false;
            if (typeof userAns === 'object' && userAns !== null && !Array.isArray(userAns)) {
                userAns = Object.values(userAns)[0] ?? '';
            } else if (Array.isArray(userAns)) {
                userAns = userAns[0] ?? '';
            }

            if (typeof userAns === 'string') {
                userAns = userAns.trim();
            } else {
                userAns = '';
            }

            const correctAnswers: string[] = Array.isArray(q.answers)
                ? q.answers.flatMap(a => {
                    if (typeof a === "string") {
                        const trimmed = a.trim();
                        return [trimmed, trimmed.toUpperCase()];
                    }
                    return [];
                })
                : [];

            isCorrect = correctAnswers.includes(userAns);
            if (isCorrect) return '#8BC34A';
            return userAns ? '#F44336' : '#BDBDBD';
        }
        else {
            const correct = Array.isArray(q.answers) ? q.answers[0] : '';
            const userAns = typeof answers[key] === 'string' ? (answers[key] as string).trim() : '';
            if (userAns && userAns === correct) return '#8BC34A';
            return userAns ? '#F44336' : '#BDBDBD';
        }
    };

    const handleSubmit = () => {
        let sc = 0;
        allQuestions.forEach(q => {
            const key = q.number;
            if (q.type === 'MULTI') {
                const correct = Array.isArray(q.answers) ? q.answers.map(a => a).sort() : [];
                const userAns = Array.isArray(answers[key]) ? (answers[key] as string[]).map(a => a).sort() : [];
                correct.forEach(opt => {
                    if (userAns.includes(opt)) sc++;
                });
            }
            else if (q.type === 'FILL_BLANKS') {
                let userAns = answers[key];
                if (typeof userAns === 'object' && userAns !== null && !Array.isArray(userAns)) {
                    userAns = Object.values(userAns)[0] ?? '';
                } else if (Array.isArray(userAns)) {
                    userAns = userAns[0] ?? '';
                }
                if (typeof userAns === 'string') {
                    userAns = userAns.trim();
                } else {
                    userAns = '';
                }

                const correctAnswers: string[] = Array.isArray(q.answers)
                    ? q.answers.flatMap(a => {
                        if (typeof a === "string") {
                            const trimmed = a.trim();
                            return [trimmed, trimmed.toUpperCase()];
                        }
                        return [];
                    })
                    : [];

                if (correctAnswers.includes(userAns)) sc++;
            }
            else {
                const correct = Array.isArray(q.answers) ? q.answers[0] : '';
                const userAns = typeof answers[key] === 'string' ? (answers[key] as string).trim() : '';
                if (userAns && userAns === correct) sc++;
            }
        });
        setScore(sc);
        setSubmitted(true);
        try {
            const totalQuestions = allQuestions.reduce((sum, q) => {
                if (q.type === 'MULTI' && Array.isArray(q.answers)) {
                    return sum + q.answers.length;
                }
                return sum + 1;
            }, 0);
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
            saveResultMutation.mutate({
                sectionID: Number(testData?.id),
                correctCount: sc,
                total: totalQuestions,
                token,
            });
        } catch (e) {
            // Xử lý lỗi nếu cần
            console.error("Lưu kết quả thất bại", e);
        }
    };

    const handleSetRef = (q: Question, el: HTMLDivElement | null) => {
        questionRefs.current[q.number] = el;
        if (q.type === 'MULTI' && Array.isArray(q.answers)) {
            for (let i = 0; i < q.answers.length; i++) {
                questionRefs.current[q.number + i] = el;
            }
        }
    };

    if (!testData) return <div>Loading...</div>;

    const firstQuestionNumber = allQuestions.length > 0 ? allQuestions[0].number : 1;
    const lastQuestionNumber = (() => {
        if (allQuestions.length === 0) return 1;
        const lastQ = allQuestions[allQuestions.length - 1];
        if (lastQ.type === 'MULTI' && Array.isArray(lastQ.answers)) {
            return lastQ.number + lastQ.answers.length - 1;
        }
        return lastQ.number;
    })();

    return (
        <div className="listening-app">
            <nav className="top-menu-simple">
                <div className="menu-content">
                    <div className="left-section">
                        <div className="test-info">
                            <h2>{testData.title}</h2>
                            <div className="user-info">
                                <span>Test taker ID: {currentUserInfo?.data?.firstName} {currentUserInfo?.data?.lastName}</span>
                            </div>

                        </div>
                    </div>
                    {testData?.audio_url && (
                        <AudioPlayer audioSrc={testData.audio_url} />
                    )}

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
            <header className="listening-header">
                <div className="header-block">
                    <div className="header-title">{capitalizeFirstLetter(separateLettersAndNumbers(part))}</div>
                    <div className="header-desc">
                        Listen and answer questions {firstQuestionNumber}–{lastQuestionNumber}.
                    </div>
                </div>
            </header>
            <main className="listening-main-container">
                {showExplanation ? (
                    <>
                        {/* Left Panel: Questions */}
                        <div style={{ width: `${leftWidth}px`, overflowY: 'auto', background: '#fff', padding: '16px' }}>
                            <QuestionList
                                questions={allQuestions}
                                groups={testData.groups}
                                answers={answers}
                                submitted={submitted}
                                highlightedQ={highlightedQ}
                                setAnswers={setAnswers}
                                handleChange={handleChange}
                                setRef={handleSetRef}
                            />
                            <ResultTable
                                allQuestions={allQuestions}
                                answers={answers}
                                score={score}
                                submitted={submitted}
                                onExplainClick={handleExplainClick}
                            />
                        </div>

                        {/* Resize Bar */}
                        <div id="resize-bar" className="resize-bar" onMouseDown={() => setIsResizing(true)} onTouchStart={() => setIsResizing(true)}>
                            <div className="resize-bar-left"></div>
                            <div className="resize-bar-right"></div>
                            <span className="resize-icon"><FaArrowsAltH /></span>
                        </div>

                        {/* Right Panel: Explanation */}
                        <div style={{ flex: 1, display: 'flex' }}>
                            <ExplanationModal
                                open={showExplanation}
                                onClose={() => setShowExplanation(false)}
                                content={loadingExplanation ? "Đang tải..." : explanationContent}
                                title={`Explanation`}
                            />
                        </div>
                    </>
                ) : (
                    <section className="listening-right-panel">
                        <QuestionList
                            questions={allQuestions}
                            groups={testData.groups}
                            answers={answers}
                            submitted={submitted}
                            highlightedQ={highlightedQ}
                            setAnswers={setAnswers}
                            handleChange={handleChange}
                            setRef={handleSetRef}
                        />
                        <ResultTable
                            allQuestions={allQuestions}
                            answers={answers}
                            score={score}
                            submitted={submitted}
                            onExplainClick={handleExplainClick}
                        />
                    </section>
                )}
            </main>
            <footer className="bottom-status">
                {testData && !showExplanation && (
                    <QuestionNavButtons
                        current={highlightedQ}
                        questions={allQuestions}
                        onChange={setHighlightedQ}
                    />
                )}
                <div className="part-label">{capitalizeEachWord(separateLettersAndNumbers(part))}</div>
                <ProgressBar
                    groups={testData.groups}
                    getMultiRange={getMultiRange}
                    getMultiSquareColor={getMultiSquareColor}
                    getSquareColor={getSquareColor}
                    setHighlightedQ={setHighlightedQ}
                />
                {!submitted && (
                    <>
                        <SubmitButton onClick={() => setOpenDialog(true)} />
                    </>
                )}
            </footer>
            <OptionsModal
                isOpen={isOptionsOpen}
                onClose={() => setIsOptionsOpen(false)}
            />

            <ConfirmDialog
                open={openDialog}
                onConfirm={() => {
                    setOpenDialog(false);
                    handleSubmit();
                }}
                onCancel={() => setOpenDialog(false)}
                message={''}
            />
        </div>
    );
};

export default ListeningTestPage;
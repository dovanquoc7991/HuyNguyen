import React, { useEffect, useRef, useState } from 'react';
import '../css/TestLayout.css';
import QuestionNavButtons from '../components/QuestionNavButtons';
import SubmitButton from '../components/SubmitButton';
import PassagePanel from '../components/PassagePanel';
import QuestionList from '../components/QuestionList';
import ProgressBar from '../components/ProgressBar';
import { FaArrowsAltH, FaBars, FaHome } from 'react-icons/fa';
import OptionsModal from '../components/OptionsModal';
import ExplanationModal from '../components/ExplanationModal';
import { capitalizeFirstLetter, separateLettersAndNumbers, capitalizeEachWord, getMultiRange, QuestionType } from '../utils/helpers';
import ResultTable from '../components/ResultTable';

export interface Question {
  number: number;
  question: string;
  answers?: string[];
  options?: string[];
  type?: QuestionType; // Thêm type vào Question
}

export interface MatchTableColumn {
  key: string;
  label: string;
}

export interface Group {
  paragraph?: string;
  imgContent?: string;
  choices?: string[];
  type: QuestionType;
  instruction: string;
  questions: Question[];
  answers?: Record<string, string>; // Đáp án cho MATCH_TABLE
}

export interface ReadingTest {
  id: string;
  title: string;
  time: number;
  passage: string[];
  groups: Group[];
  explanation?: string;
}

export interface ReadingTestPageProps {
  skill: string;
  part: string;
  id: string;
  idPrefix: string; // Thêm prefix để các ID là duy nhất
  submitted: boolean;
  highlightedQ: number | string | null;
  answers: Record<string, string | string[] | Record<string, string>>;
  onAnswersChange: (answers: Record<string, string | string[] | Record<string, string>>) => void;
  onQuestionsLoad?: (questions: Question[]) => void;
  renderFooter?: (progressBar: React.ReactNode, setHighlightedQ: (q: number | string) => void) => React.ReactNode;
}




const BaseReadingTestPage: React.FC<ReadingTestPageProps> = ({ skill, part, id, idPrefix, submitted, highlightedQ: parentHighlightedQ, answers, onAnswersChange, onQuestionsLoad, renderFooter }) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [leftWidth, setLeftWidth] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return Math.floor(window.innerWidth / 2);
    }
    return 300;
  });
  const [isResizing, setIsResizing] = useState(false);
  const [testData, setTestData] = useState<ReadingTest | null>(null);

  // Use local state for highlightedQ, but sync it with parent's prop if provided
  const [highlightedQ, setHighlightedQ] = useState<number | string | null>(parentHighlightedQ || 1);
  useEffect(() => {
    setHighlightedQ(parentHighlightedQ);
  }, [parentHighlightedQ]);

  const questionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const mainContainerRef = useRef<HTMLElement | null>(null); // Ref cho container chính

  // Lấy tất cả câu hỏi từ các group
  const allQuestions = testData?.groups.flatMap(g => g.questions) || [];

  // --- NEW: Logic for Matching Header ---
  const matchingHeaderGroup = testData?.groups.find(g => g.type === 'MATCHING_HEADER');
  const usedMatchingHeaders = matchingHeaderGroup
    ? Object.values(answers).filter(ans => typeof ans === 'string' && matchingHeaderGroup.choices?.includes(ans))
    : [];
  const availableMatchingHeaders = matchingHeaderGroup?.choices?.filter(c => !usedMatchingHeaders.includes(c));
  const handleMatchingHeaderChange = (blankNum: string, value: string | null) => {
    const newAnswers = { ...answers };
    if (value === null) delete newAnswers[blankNum];
    else newAnswers[blankNum] = value;
    onAnswersChange(newAnswers);
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
  // --- END NEW ---



  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationContent, setExplanationContent] = useState('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy token từ session/local storage nếu cần
        const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
        // Sử dụng apiRequest từ queryClient
        const { apiRequest } = await import("@/assets/lib/queryClient");
        const data = await apiRequest("GET", `/api/section/${id}`, undefined, token);
        if (data && data.id) {
          // Parse passage nếu là string
          let passage = data.passage;
          if (typeof passage === 'string') {
            try {
              passage = JSON.parse(passage);
            } catch {
              passage = [passage];
            }
          }
          setTestData({
            id: data.id,
            title: data.title,
            time: typeof data.time === "string" ? Number(data.time) : data.time,
            passage,
            groups: data.groups || [],
            explanation: data.explanation || '',
          });
          if (onQuestionsLoad) {
            onQuestionsLoad(data.groups?.flatMap((g: Group) => g.questions) || []);
          }
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
      const mainContainer = mainContainerRef.current; // Sử dụng ref thay vì getElementById
      if (!mainContainer) return; // Kiểm tra nếu ref đã được gán
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
  const handleChange = (q: string, value: string) => {
    const newAnswers = { ...answers, [q]: value };
    onAnswersChange(newAnswers);
  };

  // MULTI status color
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

  // Map ref cho từng blank của FILL_BLANKS
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

  // Tính điểm khi submitted là true
  const score = (() => {
    if (!submitted) return 0;

    let sc = 0;
    allQuestions.forEach(q => {
      const key = String(q.number);
      const userAns = answers[key];

      if (q.type === 'MULTI') {
        const correct = Array.isArray(q.answers) ? q.answers.map(String).sort() : [];
        const userAnsArr = Array.isArray(userAns) ? (userAns as string[]).map(String).sort() : [];
        if (userAnsArr.length === correct.length && userAnsArr.every((v, i) => v === correct[i])) {
          sc++;
        }
      } else if (q.type === 'FILL_BLANKS') {
        let normalizedUserAns = '';
        if (typeof userAns === 'object' && userAns !== null && !Array.isArray(userAns)) {
          normalizedUserAns = Object.values(userAns)[0]?.trim() ?? '';
        } else if (typeof userAns === 'string') {
          normalizedUserAns = userAns.trim();
        }

        const correctAnswers: string[] = Array.isArray(q.answers)
          ? q.answers.flatMap(a => {
            if (typeof a === "string") {
              const trimmed = a.trim();
              return [trimmed.toLowerCase(), trimmed.toUpperCase(), trimmed];
            }
            return [];
          })
          : [];
        if (correctAnswers.includes(normalizedUserAns)) sc++;
      } else { // SINGLE_CHOICE, etc.
        const correct = Array.isArray(q.answers) ? String(q.answers[0]) : '';
        const userAnsStr = typeof userAns === 'string' ? userAns.trim() : '';
        if (userAnsStr && userAnsStr.toLowerCase() === correct.toLowerCase()) {
          sc++;
        }
      }
    });
    return sc;
  })();

  return (
    <div className="reading-app">
      {/* ===== HEADER CỦA PHẦN THI (PART 2) ===== */}
      <div className="page-content">
        <header className="header-section">
          <div className="header-block">
            <div className="header-title">{capitalizeFirstLetter(separateLettersAndNumbers(part))}</div>
            <div className="header-desc">Read the text and answer questions {firstQuestionNumber}–{lastQuestionNumber}.</div>
          </div>
        </header>
      </div>

      <main id={`${idPrefix}-main-container`} ref={mainContainerRef} className="main-container">

        {showExplanation ? (
          <div style={{ width: `${leftWidth}px`, overflowY: 'auto' }}>
            <ExplanationModal
              open={showExplanation}
              onClose={() => setShowExplanation(false)}
              content={loadingExplanation ? "Đang tải..." : explanationContent}
              title={`Explanation`}
            />
          </div>
        ) : (
          <PassagePanel
            passage={testData.passage}
            width={leftWidth}
            matchingHeaderGroup={matchingHeaderGroup ? {
              choices: matchingHeaderGroup.choices || [],
              userAnswers: answers as Record<string, string>,
              onChange: handleMatchingHeaderChange,
              submitted: submitted,
              highlightedQ: highlightedQ
            } : null}
          />
        )}

        <div id={`${idPrefix}-resize-bar`} className="resize-bar" onMouseDown={() => setIsResizing(true)} onTouchStart={() => setIsResizing(true)}>
          <div className="resize-bar-left"></div>
          <div className="resize-bar-right"></div>
          <span className="resize-icon"><FaArrowsAltH /></span>
        </div>

        <section id={`${idPrefix}-right-panel`} className="right-panel">
          <QuestionList
            questions={allQuestions}
            groups={testData.groups}
            answers={answers}
            submitted={submitted}
            highlightedQ={highlightedQ}
            setAnswers={(value) => {
              if (typeof value === 'function') {
                // If it's a function, call it with the current answers to get the new state
                onAnswersChange(value(answers));
              } else {
                // If it's a direct value, just pass it
                onAnswersChange(value);
              }
            }}
            handleChange={handleChange}
            setRef={handleSetRef}
            // Props mới cho Matching Header
            availableMatchingHeaders={availableMatchingHeaders}
          />
          <ResultTable
            allQuestions={allQuestions}
            answers={answers}
            score={score}
            submitted={submitted}
            onExplainClick={handleExplainClick}
          />
        </section>

      </main>

      {renderFooter ? renderFooter( // If it's a FullTest, use the parent's footer
        <ProgressBar
          groups={testData.groups}
          getMultiRange={getMultiRange}
          getMultiSquareColor={getMultiSquareColor}
          getSquareColor={getSquareColor}
          setHighlightedQ={setHighlightedQ}
        />,
        setHighlightedQ // Pass the setter up to the parent
      ) : (
        <footer className="bottom-status">
          {testData && !showExplanation && (
            <QuestionNavButtons
              current={highlightedQ}
              questions={allQuestions}
              onChange={setHighlightedQ}
            />
          )}
          <div className="part-label">{capitalizeEachWord(separateLettersAndNumbers(part))}</div>
          <ProgressBar groups={testData.groups} getMultiRange={getMultiRange} getMultiSquareColor={getMultiSquareColor} getSquareColor={getSquareColor} setHighlightedQ={setHighlightedQ} />
        </footer>
      )}
      <OptionsModal
        isOpen={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
      />
    </div>
  );
};

export default BaseReadingTestPage;
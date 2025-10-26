import React, { useEffect, useRef, useState } from 'react';
import '../css/TestLayout.css';
import ConfirmDialog from '../components/ConfirmDialog';
import PassagePanel from '../components/PassagePanel';
import { FaArrowsAltH, FaBars, FaHome } from 'react-icons/fa';
import { me } from '../hooks/use-user';
import OptionsModal from '../components/OptionsModal';
import WordCounter from '../components/WordCounter';
import { capitalizeFirstLetter, separateLettersAndNumbers } from '../utils/helpers';
import { Console } from 'console';
import { sanitizeContent } from '../lib/utils';



export interface MatchTableColumn {
  key: string;
  label: string;
}

export interface WritingTest {
  id: string;
  title: string;
  time: number;
  passage: string[];
}

export interface WritingTestPageProps {
  skill: string;
  part: string;
  id: string;
}

const WritingTestPage: React.FC<WritingTestPageProps> = ({ skill, part, id }) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [leftWidth, setLeftWidth] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return Math.floor(window.innerWidth / 2);
    }
    return 700;
  });
  const [isResizing, setIsResizing] = useState(false);
  const [testData, setTestData] = useState<WritingTest | null>({
            id: "",
            title: "",
            time: 0,
            passage: [],
          });

  const [openDialog, setOpenDialog] = useState(false);

  const currentUserInfo = me();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy token từ session/local storage nếu cần
        const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
        // Sử dụng apiRequest từ queryClient
        const { apiRequest } = await import("@/assets/lib/queryClient");
        const data = await apiRequest("GET", `/api/section/${id}`, undefined, token);
        console.log(data);
        if (data && data.id) {
          // Parse passage nếu là string
          let passage = data.examContent;
          // if (typeof passage === 'string') {
          //   try {
          //     passage = JSON.parse(passage);
          //   } catch {
          //     passage = [passage];
          //   }
          // }
          passage = [passage];
          setTestData({
            id: data.id,
            title: data.title,
            time: typeof data.time === "string" ? Number(data.time) : data.time,
            passage: passage,
          });
        } else {
          console.log("else");
          setTestData({
            id: data.id,
            title: data.title,
            time: typeof data.time === "string" ? Number(data.time) : data.time,
            passage: [],
          });
        }
      } catch (error) {
        setTestData(null);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.body.classList.add('resizing');
    } else {
      document.body.classList.remove('resizing');
    }
  }, [isResizing]);


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const mainContainer = document.getElementById('main-container');
      if (!mainContainer) return;
      const rect = mainContainer.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      if (newWidth >= 300 && newWidth <= rect.width - 300) {
        setLeftWidth(newWidth);
      }
    };

    const handleMouseUp = () => setIsResizing(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);


  const handleSubmit = async () => {
    setScore(0);
    setSubmitted(true);
    // Gửi kết quả lên server
    try {
      // const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
      // saveResultMutation.mutate({
      //   sectionID: Number(testData?.id),
      //   correctCount: 0,
      //   total: allQuestions.length,
      //   token,
      // });
    } catch (e) {

    }
  };

  return (
    <div className="writing-app">
      {/* ===== HEADER CHÍNH (THANH TRÊN CÙNG) ===== */}
      <nav className="top-menu-simple">
        <div className="menu-content">
          <div className="left-section">
            <div className="test-info">
              <h2>{testData?.title}</h2>
              <div className="user-info">
                <span>Test taker ID: {currentUserInfo?.data?.firstName} {currentUserInfo?.data?.lastName}</span>
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

      {/* ===== HEADER CỦA PHẦN THI (PART 2) ===== */}
      <div className="page-content">
        <header className="header-section">
          <div className="header-block">
            <div className="header-title">Part {capitalizeFirstLetter(separateLettersAndNumbers(part))}</div>
            <div className="header-desc">You should spend about 60 minutes on this task. Write at least 150 words.</div>
          </div>
        </header>
      </div>


      <main id="main-container" className="main-container">
        {/* <PassagePanel passage={testData?.passage!!} width={leftWidth} /> */}
        <div
          className="tinymce-content left-panel" // Thêm class left-panel để đồng bộ style
          style={{ width: `${leftWidth}px`, overflowY: 'auto', padding: '1rem' }} // Sử dụng style cho width
          dangerouslySetInnerHTML={{
            __html: sanitizeContent(testData?.passage[0] || "") || "No content available",
          }}
        />
        <div id="resize-bar" className="resize-bar" onMouseDown={() => setIsResizing(true)}>
          <div className="resize-bar-left"></div>
          <div className="resize-bar-right"></div>
          <span className="resize-icon"><FaArrowsAltH /></span>
        </div>
        <section id="right-panel" className="right-panel">
          <WordCounter/>
        </section>
      </main>

      <footer className="bottom-status">
        {/* <div className="part-label">{capitalizeEachWord(separateLettersAndNumbers(part))}</div> */}
        {/* {!submitted && (
          <>
            <SubmitButton onClick={() => setOpenDialog(true)} />
          </>
        )} */}
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
        onCancel={() => setOpenDialog(false)} message={''} />
    </div>
  );
};

export default WritingTestPage;
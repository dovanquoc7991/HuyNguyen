import React from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { Question } from '../pages/ReadingTestPage';
import '../css/ResultTable.css';
import { IoMdInformationCircleOutline } from 'react-icons/io';

interface ResultTableProps {
    allQuestions: Question[];
    answers: Record<string, string | string[] | Record<string, string>>;
    score: number;
    submitted: boolean;
    onExplainClick?: () => void;
}

const ResultTable: React.FC<ResultTableProps> = ({ allQuestions, answers, score, submitted, onExplainClick, }) => {
    if (!submitted) return null;
    const totalQuestions = allQuestions.reduce((sum, q) => {
        if (q.type === 'MULTI' && Array.isArray(q.answers)) {
            return sum + q.answers.length;
        }
        return sum + 1;
    }, 0);
    return (
        <div id="result" style={{
            background: '#f4faff',
            borderRadius: 12,
            boxShadow: '0 2px 8px #0001',
            padding: 20,
            margin: 16,
            border: '1px solid #b3e5fc'
        }}>
            <h4 style={{ color: '#1976d2', marginBottom: 16 }}>Results:</h4>
            <table style={{
                width: '100%',
                borderCollapse: 'separate',
                borderSpacing: 0,
                background: '#fff',
                borderRadius: 8,
                overflow: 'hidden',
                boxShadow: '0 1px 4px #0001',
                border: '1px solid #b3e5fc'
            }}>
                <thead>
                    <tr style={{ background: '#e3f2fd' }}>
                        <th style={{ padding: 8, border: '1px solid #b3e5fc' }}>#</th>
                        <th style={{ padding: 8, border: '1px solid #b3e5fc' }}>Status</th>
                        <th style={{ padding: 8, border: '1px solid #b3e5fc' }}>Your Answer</th>
                        <th style={{ padding: 8, border: '1px solid #b3e5fc' }}>Correct Answer</th>
                    </tr>
                </thead>
                <tbody>
                    {allQuestions.map((q, idx) => {
                        const key = `${q.number}`;
                        let userAns = answers[key];
                        let correctAns;
                        let isCorrect = false;

                        if (q.type === 'MULTI') {
                            const correct = Array.isArray(q.answers) ? q.answers.map(a => a.toLowerCase()).sort() : [];
                            const user = Array.isArray(userAns) ? (userAns as string[]).map(a => a.toLowerCase()).sort() : [];
                            isCorrect = user.length === correct.length && user.every((v, i) => v === correct[i]);
                            userAns = Array.isArray(userAns) ? (userAns as string[]).join(', ') : '';
                            correctAns = Array.isArray(q.answers)
                                ? q.answers.slice(0, -1).join('; ') + (q.answers.length > 1 ? ' ; ' : '') + q.answers.slice(-1)
                                : '';
                        } else if (q.type === 'FILL_BLANKS') {
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
                                ? q.answers.map(a => (typeof a === 'string' ? a.trim() : ''))
                                : [];

                            const correctAnswersAcepted: string[] = Array.isArray(q.answers)
                                ? q.answers.flatMap(a => {
                                    if (typeof a === "string") {
                                        const trimmed = a.trim();
                                        return [trimmed, trimmed.toUpperCase()];
                                    }
                                    return [];
                                })
                                : [];

                            isCorrect = correctAnswersAcepted.includes(userAns);
                            correctAns = Array.isArray(correctAnswers)
                                ? correctAnswers.slice(0, -1).join('; ') + (correctAnswers.length > 1 ? ' or ' : '') + correctAnswers.slice(-1)
                                : '';
                        }

                        else {
                            if (Array.isArray(q.answers)) {
                                correctAns = q.answers[0] ?? '';
                                // So sánh với phần tử đầu tiên của mảng (chuẩn hóa về lowercase và trim)
                                isCorrect =
                                    typeof userAns === "string" &&
                                    userAns.trim().toLowerCase() === (q.answers[0]?.trim().toLowerCase() ?? '');
                            }
                        }

                        return (
                            <tr key={q.number} style={{
                                background: idx % 2 === 0 ? '#f9f9fc' : '#e3f2fd',
                                borderRadius: 8
                            }}>
                                <td style={{ padding: 8, textAlign: 'center', fontWeight: 500, border: '1px solid #b3e5fc' }}>
                                    {q.type === 'MULTI' && Array.isArray(q.answers) && q.answers.length > 1
                                        ? `${q.number}-${q.number + q.answers.length - 1}`
                                        : q.number}
                                </td>
                                <td
                                    className="status-cell"
                                    style={{
                                        padding: 8,
                                        textAlign: 'center',
                                        verticalAlign: 'middle',
                                        border: '1px solid #b3e5fc'
                                    }}>
                                    {isCorrect
                                        ? <FaCheckCircle color="#43a047" size={22} title="Correct" />
                                        : <FaTimesCircle color="#e53935" size={22} title="Incorrect" />
                                    }
                                </td>
                                <td style={{ padding: 8, textAlign: 'center', color: isCorrect ? '#43a047' : '#e53935', border: '1px solid #b3e5fc' }}>
                                    {typeof userAns === 'string' && userAns !== ''
                                        ? userAns
                                        : <span style={{ color: '#aaa' }}>No answer</span>
                                    }
                                </td>
                                <td style={{ padding: 8, textAlign: 'center', color: '#1976d2', border: '1px solid #b3e5fc' }}>
                                    {correctAns ? correctAns : ''}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>



            <div
                style={{
                    marginTop: 20,
                    padding: "12px 16px",
                    background: "#e3f2fd",
                    borderRadius: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid #b3e5fc",
                }}
            >
                <p style={{ margin: 0, fontWeight: 500 }}>
                    Correct answers:{" "}
                    <span style={{ color: "#1976d2" }}>
                        {score}/{totalQuestions}
                    </span>
                </p>

                {onExplainClick && (
                    <div
                        onClick={onExplainClick}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            color: "#1976d2",
                            cursor: "pointer",
                            transition: "0.2s",
                        }}
                        title="Click to view detailed explanations of your answers"
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#0d47a1")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#1976d2")}
                    >
                        <IoMdInformationCircleOutline size={22} />
                        <span style={{ fontWeight: 500 }}>View Explanations</span>
                    </div>

                )}
            </div>
        </div>
    );
};

export default ResultTable;
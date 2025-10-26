import React from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { IoMdInformationCircleOutline } from "react-icons/io";

interface ResultSummaryProps {
  score: number;
  total: number;
  correct: number;
  wrong: number;
  skipped: number;
  date?: string;
  onExplainClick?: () => void;
}

const ResultSummary: React.FC<ResultSummaryProps> = ({
  score,
  total,
  correct,
  wrong,
  skipped,
  date,
  onExplainClick,
}) => {
  return (
    <div
      style={{
        display: "flex",
        gap: 32,
        justifyContent: "center",
        alignItems: "flex-start",
        margin: "32px 0",
        flexWrap: "wrap",
      }}
    >
      {/* Score Circle & Legend */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 260 }}>
        <div
          style={{
            width: 170,
            height: 170,
            borderRadius: "50%",
            background: "#fff",
            border: "10px solid #f2f4f8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontSize: 38,
              fontWeight: 600,
              color: score > 0 ? "#43a047" : "#bdbdbd",
            }}
          >
            {score}
          </span>
          <span style={{ fontSize: 32, color: "#bdbdbd", marginLeft: 4, fontWeight: 500 }}>/ {total}</span>
          <span
            style={{
              position: "absolute",
              left: "calc(100% - 38px)",
              top: 18,
              fontSize: 38,
            }}
            title={score === total ? "Excellent!" : score === 0 ? "Try again!" : ""}
          >
            {score === total ? "🎉" : score === 0 ? "😟" : ""}
          </span>
        </div>
        <div style={{ fontWeight: 600, fontSize: 18, color: "#222", marginBottom: 10 }}>
          Chú Thích Trạng Thái
        </div>
        <div style={{ width: 260 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#e8f5e9",
              borderRadius: 10,
              padding: "10px 18px",
              marginBottom: 10,
              fontWeight: 500,
              color: "#388e3c",
              fontSize: 16,
            }}
          >
            <FaCheckCircle style={{ marginRight: 12 }} color="#43a047" /> Câu trả lời đúng
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#ffebee",
              borderRadius: 10,
              padding: "10px 18px",
              marginBottom: 10,
              fontWeight: 500,
              color: "#e53935",
              fontSize: 16,
            }}
          >
            <FaTimesCircle style={{ marginRight: 12 }} color="#e53935" /> Câu trả lời sai
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#f7fafd",
              borderRadius: 10,
              padding: "10px 18px",
              fontWeight: 500,
              color: "#757575",
              fontSize: 16,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 22,
                height: 22,
                border: "2px solid #bdbdbd",
                borderRadius: "50%",
                marginRight: 12,
              }}
            ></span>
            Chưa trả lời
          </div>
        </div>
      </div>
      {/* Main Summary */}
      <div
        style={{
          background: "#fafcfd",
          borderRadius: 18,
          boxShadow: "0 2px 12px #0001",
          padding: "32px 36px",
          minWidth: 380,
          maxWidth: 480,
          flex: 1,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div
            style={{
              color: "#43a047",
              fontWeight: 700,
              fontSize: 36,
              marginBottom: 0,
              letterSpacing: 1,
            }}
          >
            Kết Quả Bài Thi
          </div>
          <div
            style={{
              width: 90,
              height: 5,
              background: "#8bc34a",
              borderRadius: 4,
              margin: "8px auto 0 auto",
            }}
          ></div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 18,
            fontSize: 18,
            color: "#222",
            fontWeight: 500,
          }}
        >
          Ngày Hoàn Thành
          <span style={{ color: "#757575", fontWeight: 400, fontSize: 17, display: "flex", alignItems: "center" }}>
            <span style={{ marginRight: 6, fontSize: 20 }}>🕒</span>
            {date || "--/--/----"}
          </span>
          <span style={{ flex: 1 }} />
          <button
            onClick={onExplainClick}
            style={{
              background: "none",
              border: "none",
              color: "#1976d2",
              fontWeight: 500,
              fontSize: 18,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <IoMdInformationCircleOutline size={26} color="#1976d2" />
            Giải thích đáp án
          </button>
        </div>
        <div
          style={{
            display: "flex",
            gap: 18,
            marginTop: 18,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#e8f5e9",
              borderRadius: 12,
              padding: "18px 32px",
              minWidth: 90,
              textAlign: "center",
            }}
          >
            <div style={{ color: "#43a047", fontWeight: 700, fontSize: 28 }}>{correct}</div>
            <div style={{ color: "#388e3c", fontWeight: 500, fontSize: 17 }}>Đúng</div>
          </div>
          <div
            style={{
              background: "#ffebee",
              borderRadius: 12,
              padding: "18px 32px",
              minWidth: 90,
              textAlign: "center",
            }}
          >
            <div style={{ color: "#e53935", fontWeight: 700, fontSize: 28 }}>{wrong}</div>
            <div style={{ color: "#e53935", fontWeight: 500, fontSize: 17 }}>Sai</div>
          </div>
          <div
            style={{
              background: "#f7fafd",
              borderRadius: 12,
              padding: "18px 32px",
              minWidth: 90,
              textAlign: "center",
            }}
          >
            <div style={{ color: "#757575", fontWeight: 700, fontSize: 28 }}>{skipped}</div>
            <div style={{ color: "#757575", fontWeight: 500, fontSize: 17 }}>Bỏ qua</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultSummary;
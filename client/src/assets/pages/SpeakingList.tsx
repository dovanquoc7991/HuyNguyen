import React, { useState, useMemo, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/assets/ui/select";
import { usePartListByType } from "@/assets/hooks/use-user";
import PracticeListLayout from "../components/PracticeListLayout";
import useSpeechRecognition from "../hooks/use-speech-recognition";
import { FaMicrophone, FaStopCircle, FaTrash } from "react-icons/fa";
import { Button } from "../ui/button";
import { sanitizeContent } from "../lib/utils";

const partOptions = [
  { value: 1, label: "Part 1" },
  { value: 2, label: "Part 2" },
  { value: 3, label: "Part 3" },
];

const sortOptions = [
  { value: "az", label: "A → Z" },
  { value: "za", label: "Z → A" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
];

export default function SpeakingList() {
  const [selectedPart, setSelectedPart] = useState<number>(1);
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState<string>("az");

  const { data: wPartList, isLoading } = usePartListByType("Speaking");

  // Filter by part
  const filteredByPart = useMemo(() => {
    if (!wPartList) return [];
    return wPartList.sections.filter(
      (item: any) => item.part_number === selectedPart
    );
  }, [wPartList, selectedPart]);

  // Filter by search
  const filteredItems = useMemo(() => {
    return filteredByPart.filter((item: any) =>
      item.title?.toLowerCase().includes(search.toLowerCase())
    );
  }, [filteredByPart, search]);

  // Sort
  const sortedItems = useMemo(() => {
    let arr = [...filteredItems];
    if (sortType === "az") {
      arr.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortType === "za") {
      arr.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortType === "newest") {
      arr.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );
    } else if (sortType === "oldest") {
      arr.sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
      );
    }
    return arr;
  }, [filteredItems, sortType]);

  const filterNode = (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Part
      </label>
      <Select
        value={selectedPart.toString()}
        onValueChange={(value) => setSelectedPart(Number(value))}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select part" />
        </SelectTrigger>
        <SelectContent>
          {partOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value.toString()}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  // Component con để quản lý state ghi âm riêng cho từng item
  const SpeakingPracticeSection = () => {
    const { isListening, transcript, startListening, stopListening, hasRecognitionSupport, error } = useSpeechRecognition();
    const [finalTranscript, setFinalTranscript] = useState("");

    useEffect(() => { setFinalTranscript(transcript) }, [transcript]);

    return (
      <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-md font-semibold text-gray-800 mb-3">🎙️ Your Turn to Speak</h3>
        {!hasRecognitionSupport ? (
          <p className="text-sm text-red-600">Trình duyệt của bạn không hỗ trợ tính năng ghi âm.</p>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-4">
              {!isListening ? (
                <Button onClick={startListening} disabled={isListening}>
                  <FaMicrophone className="mr-2" /> Start Recording
                </Button>
              ) : (
                <Button onClick={stopListening} disabled={!isListening} variant="destructive">
                  <FaStopCircle className="mr-2" /> Stop Recording
                </Button>
              )}
              {finalTranscript && !isListening && (
                <Button variant="ghost" size="sm" onClick={() => setFinalTranscript("")}>
                  <FaTrash className="mr-2" /> Clear
                </Button>
              )}
            </div>
            {isListening && <p className="text-sm text-blue-600 animate-pulse">Recording in progress...</p>}
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md min-h-[150px] bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={finalTranscript}
              onChange={(e) => setFinalTranscript(e.target.value)}
              placeholder="Your transcribed speech will appear here..."
              readOnly={isListening}
            />
          </>
        )}
      </div>
    );
  };

  const renderContent = (selectedItem: any) => (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900">
            {selectedItem.title}
          </h2>
        </div>
        <p className="text-sm text-gray-500">
          Added on {new Date(selectedItem.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Audio Player Section */}
      <div className="mb-6">
        <div className="bg-[#f9fafb] rounded-lg border border-gray-300 shadow-sm p-4">
          <h3 className="text-md font-semibold text-gray-700 mb-3">🎧 Listen to the Audio</h3>
          {selectedItem.audio_url ? (
            <audio
              controls
              controlsList="nodownload" // 👈 Ẩn nút tải xuống
              className="w-full outline-none"
              style={{
                backgroundColor: "#f6f3f4ff", // Màu nền nhẹ nhàng
                borderRadius: "8px", // Bo góc
              }}
            >
              <source src={selectedItem.audio_url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          ) : (
            <p className="text-sm text-gray-500 italic">No audio available for this test.</p>
          )}
        </div>
      </div>



      {/* Exam Content Section */}
      <div className="max-w-none mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200 tinymce-content">
        <div
          dangerouslySetInnerHTML={{
            __html: sanitizeContent(selectedItem.examContent) || "No content available",
          }}
        />
      </div>

      {/* Thêm phần thực hành ghi âm */}
      <SpeakingPracticeSection />
    </>
  );

  return (
    <PracticeListLayout
      pageTitle="IELTS Speaking Tests"
      pageDescription="Practice your speaking skills with these tests"
      items={sortedItems}
      isLoading={isLoading}
      searchProps={{ value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search tests..." }}
      sortProps={{ value: sortType, onValueChange: setSortType, options: sortOptions }}
      filterNode={filterNode}
      renderContent={renderContent}
      noItemsFoundText={{
        title: "No tests found",
        description: "No tests available for this part",
        searchDescription: "Try a different search term"
      }}
      selectItemText={{
        title: "Select a test",
        description: "Choose a speaking test from the list to view its content and practice your speaking skills."
      }}
    />
  );
}
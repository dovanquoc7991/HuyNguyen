import React, { useState, useMemo, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/assets/ui/select";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/assets/lib/api";
import PracticeListLayout from "../components/PracticeListLayout";
import { sanitizeContent } from "../lib/utils";

interface Post {
  id: number;
  title: string;
  content: string;
  type: 'reading' | 'listening';
  created_at: string;
  updated_at: string;
  audio_url: string;
}

const skillOptions = [
  { value: "reading", label: "Reading" },
  { value: "listening", label: "Listening" },
];

const sortOptions = [
  { value: "az", label: "A → Z" },
  { value: "za", label: "Z → A" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
];

export default function StudentReport() {
  const [selectedSkill, setSelectedSkill] = useState<string>("reading");
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState<string>("newest");

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      const { apiRequest } = await import("@/assets/lib/queryClient");
      const token = sessionStorage.getItem("auth_token") || localStorage.getItem("auth_token");
      return apiRequest("GET", api.getPosts(), undefined, token);
    },
  });

  const filteredBySkill = useMemo(() => {
    if (!posts) return [];
    return posts.filter(
      (item: Post) => item.type.toLowerCase() === selectedSkill.toLowerCase()
    );
  }, [posts, selectedSkill]);
  
  const filteredItems = useMemo(() => {
    return filteredBySkill.filter((item: Post) =>
      item.title?.toLowerCase().includes(search.toLowerCase())
    );
  }, [filteredBySkill, search]);

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
        Skill
      </label>
      <Select
        value={selectedSkill}
        onValueChange={(value) => setSelectedSkill(value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select skill" />
        </SelectTrigger>
        <SelectContent>
          {skillOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderContent = (selectedItem: Post) => (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900">
            {selectedItem.title}
          </h2>
        </div>
        <p className="text-sm text-gray-500">
          Posted on{" "}
          {new Date(selectedItem.created_at).toLocaleDateString()}
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

      <div className="max-w-none mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200 tinymce-content">
        <div
          dangerouslySetInnerHTML={{
            __html: sanitizeContent(selectedItem.content) || "No content available.",
          }}
        />
      </div>
    </>
  );

  return (
    <PracticeListLayout
      pageTitle="Short Stories"
      pageDescription="Review stories for Reading and Listening."
      items={sortedItems}
      isLoading={isLoading}
      searchProps={{ value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search reports..." }}
      sortProps={{ value: sortType, onValueChange: setSortType, options: sortOptions }}
      filterNode={filterNode}
      renderContent={renderContent}
      noItemsFoundText={{
        title: "No stories found",
        description: "No posts available for this skill",
        searchDescription: "Try a different search term"
      }}
      selectItemText={{
        title: "Select a story",
        description: "Choose a story from the list to view its content."
      }}
    />
  );
}
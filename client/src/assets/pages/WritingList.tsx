import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/assets/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/assets/ui/select";
import { usePartListByType } from "@/assets/hooks/use-user";
import { Play } from "lucide-react";
import { navigate } from "wouter/use-browser-location";
import PracticeListLayout from "../components/PracticeListLayout";
import { sanitizeContent } from "../lib/utils";

const partOptions = [
  { value: 1, label: "Part 1" },
  { value: 2, label: "Part 2" },
];

const sortOptions = [
  { value: "az", label: "A → Z" },
  { value: "za", label: "Z → A" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
];

export default function WritingList() {
  const [selectedPart, setSelectedPart] = useState<number>(1);
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState<string>("az");

  const { data: wPartList, isLoading } = usePartListByType("Writing");

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

      <div className="flex gap-3 mb-6">
        <Button
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            navigate(`/practice/Writing/${selectedPart}/${selectedItem.id}`);
          }}
        >
          <Play size={16} />
          Start Writing
        </Button>
      </div>

      <div className="max-w-none mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200 tinymce-content">
        <div
          dangerouslySetInnerHTML={{
            __html: sanitizeContent(selectedItem.examContent) || "No content available",
          }}
        />
      </div>
    </>
  );

  return (
    <PracticeListLayout
      pageTitle="IELTS Writing Tests"
      pageDescription="Practice your writing skills with these tests"
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
        description: "Choose a writing test from the list to view its content and practice your writing skills."
      }}
    />
  );
}

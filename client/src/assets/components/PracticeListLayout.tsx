import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/assets/ui/card";
import { Input } from "@/assets/ui/input";
import { Button } from "@/assets/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/assets/ui/select";
import { Search, ChevronLeft, FileText, Clock, SortAsc } from "lucide-react";
import { Maximize2, Minimize2 } from "lucide-react";
import { Pagination } from "./pagination";

const ITEMS_PER_PAGE = 30;
const MOBILE_ITEMS_PER_PAGE = 7;

interface PracticeListLayoutProps {
  pageTitle: string;
  pageDescription: string;
  items: any[];
  isLoading: boolean;
  searchProps: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
  };
  sortProps: {
    value: string;
    onValueChange: (value: string) => void;
    options: { value: string; label: string }[];
  };
  filterNode: React.ReactNode;
  renderContent: (selectedItem: any) => React.ReactNode;
  noItemsFoundText: {
    title: string;
    description: string;
    searchDescription: string;
  };
  selectItemText: {
    title: string;
    description: string;
  };
}

export default function PracticeListLayout({
  pageTitle,
  pageDescription,
  items,
  isLoading,
  searchProps,
  sortProps,
  filterNode,
  renderContent,
  noItemsFoundText,
  selectItemText,
}: PracticeListLayoutProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);


  // Responsive check (mobile <640px)
  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Reset page and selection on filter/sort/search change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedId(null);
  }, [searchProps.value, sortProps.value, filterNode]);

  const itemsPerPage = isMobileView ? MOBILE_ITEMS_PER_PAGE : ITEMS_PER_PAGE;
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const selectedItem = items.find((item: any) => item.id === selectedId);

  // Highlight search text
  const highlightText = (text: string, highlight: string) => {
    if (!highlight || !highlight.trim()) return text;
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = String(text).split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // prevent background scroll when mobile overlay open
  useEffect(() => {
    if (isMobileView && selectedId !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileView, selectedId]);

  return (
    <div className="bg-gray-50">
      <Card className="overflow-hidden shadow-lg">
        <CardContent className="p-0">
          {/* Layout container */}
          <div className={`flex flex-col sm:flex-row ${isMaximized ? "overflow-hidden" : ""}`}>

            {/* ---------------- LEFT: LIST (always rendered) ---------------- */}
            {
              !isMaximized && (
                <div
                  className={`bg-white ${isMobileView ? "w-full" : "w-[280px] flex-shrink-0"
                    } border-r border-gray-200 flex flex-col h-[calc(100vh-120px)] overflow-y-auto`}
                  aria-hidden={isMobileView && selectedId !== null ? "true" : "false"}
                >
                  {/* Filters */}
                  <div className="p-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
                    <div className="flex flex-col gap-3">
                      <div className="relative">
                        <Search
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <Input
                          type="text"
                          className="pl-10 pr-4 py-2 w-full rounded-lg bg-white"
                          {...searchProps}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {filterNode}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sort by
                          </label>
                          <Select {...sortProps}>
                            <SelectTrigger className="w-full">
                              <div className="flex items-center">
                                <SortAsc size={16} className="mr-2" />
                                <SelectValue placeholder="Sort by" />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              {sortProps.options.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* List */}
                  <div className="flex-1">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
                        <p className="text-gray-500">Loading items...</p>
                      </div>
                    ) : currentItems.length === 0 ? (
                      <div className="text-center py-12 px-4">
                        <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">{noItemsFoundText.title}</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {searchProps.value ? noItemsFoundText.searchDescription : noItemsFoundText.description}
                        </p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {currentItems.map((item: any) => (
                          <li
                            key={item.id}
                            className={`p-4 cursor-pointer transition-colors ${selectedId === item.id ? "bg-blue-50 border-l-4 border-l-blue-600" : "hover:bg-gray-50"
                              }`}
                            onClick={() => setSelectedId(item.id)}
                          >
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium text-gray-900 line-clamp-2">
                                {highlightText(item.title, searchProps.value)}
                              </h3>
                            </div>
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <Clock size={14} className="mr-1" />
                              <span>{new Date(item.created_at).toLocaleDateString()}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        className="px-4 py-3 bg-gray-50 border-t border-gray-200 justify-between mt-0"
                      />
                    )}
                  </div>
                </div>
              )
            }


            {/* ---------------- RIGHT: CONTENT (desktop normal; mobile placeholder) ---------------- */}
            <div
              className={`bg-white ${isMobileView ? "w-full" : "flex-1"
                } flex flex-col h-[calc(100vh-120px)] overflow-y-auto`}
            >
              {/* On mobile we keep a small placeholder area (or nothing) — actual full-screen content will be overlayed */}
              {!isMobileView && (
                <div className="flex-1 p-4 md:p-6">
                  <div className="flex justify-end mb-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMaximized(!isMaximized)}
                      title={isMaximized ? "Restore view" : "Maximize content"}
                    >
                      {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </Button>
                  </div>
                  {selectedItem ? (
                    renderContent(selectedItem)

                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <FileText size={48} className="text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-500 mb-2">{selectItemText.title}</h3>
                      <p className="text-gray-400 max-w-md">{selectItemText.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ---------------- MOBILE: FULL-SCREEN OVERLAY WHEN ITEM SELECTED ---------------- */}
            {isMobileView && selectedId !== null && (
              <div
                className="fixed inset-0 z-50 bg-white flex flex-col"
                role="dialog"
                aria-modal="true"
              >
                {/* overlay header with back */}
                <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-white flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedId(null)}
                    className="flex items-center"
                  >
                    <ChevronLeft size={16} className="mr-1" />
                    Back to list
                  </Button>

                  <div className="flex-1 px-3">
                    <div className="text-sm font-medium text-gray-700 truncate">
                      {selectedItem ? selectedItem.title : ""}
                    </div>
                  </div>

                  <div className="w-12" />
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                  {selectedItem ? (
                    renderContent(selectedItem)
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <FileText size={48} className="text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-500 mb-2">{selectItemText.title}</h3>
                      <p className="text-gray-400 max-w-md">{selectItemText.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

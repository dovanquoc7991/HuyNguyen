import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/assets/ui/card";
import { Button } from "@/assets/ui/button";
import { FaSearch, FaTimes, FaLock, FaRedo, FaPlay } from "react-icons/fa";
import { Part } from "@/assets/types/data-type";
import { usePartListByType } from "@/assets/hooks/use-user";
import { useRoute } from "wouter";
import { navigate } from "wouter/use-browser-location";
import PasswordModal from "../components/PasswordModal";
import { useLastResult } from "../lib/useLastResult";
import "../css/Practice.css";
import SpeakingList from "./SpeakingList";
import WritingList from "./WritingList";
import StudentReport from "./StudentReport";
import { Pagination } from "../components/pagination";

type TestDataItem = {
    id: number;
    examID?: number;
    partID: number;
    section: string;
    part: number;
    title: string;
    questions: number;
    duration: number;
    locked?: boolean;
    password?: string;
    isBasic?: boolean;
};

const readingPartOptions = [
    { value: 1, label: "Part 1" },
    { value: 2, label: "Part 2" },
    { value: 3, label: "Part 3" },
];

const listeningPartOptions = [
    { value: 1, label: "Part 1" },
    { value: 2, label: "Part 2" },
    { value: 3, label: "Part 3" },
    { value: 4, label: "Part 4" },
];

const sortOptions = [
    { value: "", label: "Default" },
    { value: "title-asc", label: "Title A-Z" },
    { value: "title-desc", label: "Title Z-A" },
    // { value: "questions-asc", label: "Questions ↑" },
    // { value: "questions-desc", label: "Questions ↓" },
    // { value: "duration-asc", label: "Duration ↑" },
    // { value: "duration-desc", label: "Duration ↓" },
];

// ✅ Helper hook đọc query params
function useQuery() {
    return useMemo(() => new URLSearchParams(window.location.search), [window.location.search]);
}

function appendPartsToTestData(parts: Part[], testData: TestDataItem[], type: string) {
    let nextId = testData.length > 0 ? Math.max(...testData.map((item) => item.id)) + 1 : 1;

    parts.forEach((part) => {
        testData.push({
            id: nextId++,
            examID: part.exam_id || 0,
            partID: part.id,
            section: type,
            part: part.part_number,
            title: part.title,
            questions: part.questions_count,
            duration: Number(part.time),
            locked: part.locked,
            password: part.password,
            isBasic: !!part.isBasic,
        });
    });
}

const TestListItem: React.FC<{
    test: TestDataItem;
    onStart: (test: TestDataItem) => void;
    index: number;
}> = ({ test, onStart, index }) => {
    const { data: lastResult, isLoading } = useLastResult(test.partID);
    const hasAttempted = !!lastResult;

    return (
        <div
            className={`grid grid-cols-12 gap-4 items-center px-4 py-3 border rounded-lg transition-shadow
        ${index % 2 === 0 ? "bg-white" : "bg-blue-50"} 
        hover:shadow-md`}
        >
            {/* STT */}
            <div className="col-span-1 text-center font-medium text-gray-700">
                {index + 1}
            </div>

            {/* Title */}
            <div className="col-span-6 font-bold text-gray-800">{test.title}</div>


            {/* Result */}
            <div className="col-span-3 text-center">
                {isLoading ? (
                    <span className="text-gray-400 text-sm">Loading...</span>
                ) : lastResult ? (
                    <div className="flex flex-col items-center">
                        <span className="font-semibold text-blue-600">
                            {lastResult.correctCount}/{lastResult.total}
                        </span>
                        <span className="text-xs text-gray-500">
                            {lastResult.date ? new Date(lastResult.date).toLocaleDateString() : "Recent"}
                        </span>
                    </div>
                ) : (
                    <span className="text-gray-400 text-sm">Not attempted</span>
                )}
            </div>

            {/* Action */}
            <div className="col-span-2 flex items-center justify-center">
                <Button
                    onClick={() => onStart(test)}
                    className={`w-20 px-3 py-1 rounded flex items-center justify-center text-white text-sm transition-colors
        ${test.locked
                            ? "bg-gray-500 hover:bg-gray-600"
                            : hasAttempted
                                ? "bg-orange-500 hover:bg-orange-600"
                                : "bg-blue-600 hover:bg-blue-700"
                        }`}
                >
                    {test.locked ? (
                        <>
                            <span>Unlock</span>
                            <FaLock size={12} className="ml-1" />
                        </>
                    ) : hasAttempted ? (
                        <>
                            <span>Redo</span>
                            <FaRedo size={12} className="ml-1" />
                        </>
                    ) : (
                        <>
                            <span>Start</span>
                            <FaPlay size={12} className="ml-1" />
                        </>
                    )}
                </Button>
            </div>

        </div>
    );
};


export default function Practice() {
    const [, params] = useRoute("/practice/:section");
    const selectedSection = params?.section || "Reading";

    const query = useQuery();
    const initialPart = Number(query.get("part")) || 1;
    const initialTestType = (query.get("type") as "all" | "normal" | "basic") || "all";

    const [selectedPart, setSelectedPart] = useState(initialPart);

    const [testType, setTestType] = useState<"normal" | "basic" | "all">(initialTestType);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("");
    const testPerPage = 50;

    const [currentPage, setCurrentPage] = useState(1);
    const [testsPerPage, setTestsPerPage] = useState(testPerPage);

    useEffect(() => {
        const calculateTestsPerPage = () => {
            setTestsPerPage(testPerPage);
        };

        calculateTestsPerPage();
        window.addEventListener("resize", calculateTestsPerPage);
        return () => window.removeEventListener("resize", calculateTestsPerPage);
    }, []);

    const { data: rPartList } = usePartListByType("Reading");
    const { data: lPartList } = usePartListByType("Listening");
    const rPartArray = Array.isArray(rPartList?.sections) ? rPartList.sections : [];
    const lPartArray = Array.isArray(lPartList?.sections) ? lPartList.sections : [];

    const [showPwModal, setShowPwModal] = useState(false);
    const [pwError, setPwError] = useState("");
    const [pendingTest, setPendingTest] = useState<TestDataItem | null>(null);

    const handleStartTest = (test: TestDataItem) => {
        if (test.locked) {
            setPendingTest(test);
            setShowPwModal(true);
        } else {
            navigate(`/practice/${test.section}/part${test.part}/${test.partID}`);
        }
    };

    let testData: TestDataItem[] = [];
    appendPartsToTestData(rPartArray, testData, "Reading");
    appendPartsToTestData(lPartArray, testData, "Listening");

    const filteredTests = testData.filter(
        (test) =>
            test.section.toLowerCase() === selectedSection.toLowerCase() &&
            test.part === selectedPart &&
            test.title.toLowerCase().includes(search.toLowerCase()) &&
            (testType === "all" ||
                (testType === "basic" && test.isBasic) ||
                (testType === "normal" && !test.isBasic))
    );

    const sortedTests = [...filteredTests].sort((a, b) => {
        switch (sort) {
            case "title-asc":
                return a.title.localeCompare(b.title, undefined, { numeric: true });
            case "title-desc":
                return b.title.localeCompare(a.title, undefined, { numeric: true });
            case "questions-asc":
                return a.questions - b.questions;
            case "questions-desc":
                return b.questions - a.questions;
            case "duration-asc":
                return a.duration - b.duration;
            case "duration-desc":
                return b.duration - a.duration;
            default:
                return 0;
        }
    });

    const totalPages = Math.ceil(sortedTests.length / testsPerPage);
    const paginatedTests = sortedTests.slice(
        (currentPage - 1) * testsPerPage,
        currentPage * testsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedSection, selectedPart, search, sort, testType]);

    const partOptions =
        selectedSection.toLowerCase() === "reading"
            ? readingPartOptions
            : listeningPartOptions;

    if (selectedSection.toLowerCase() === "writing") {
        return <WritingList />;
    } else if (selectedSection.toLowerCase() === "speaking") {
        return <SpeakingList />;
    } else if (selectedSection.toLowerCase() === "reports") {
        return <StudentReport />;
    }

    // ✅ Hàm thay đổi Part (set state + update URL)
    const handleChangePart = (value: number) => {
        setSelectedPart(value);
        navigate(`/practice/${selectedSection}?part=${value}`, { replace: true });
    };

    // ✅ Hàm thay đổi loại Test (set state + update URL)
    const handleChangeTestType = (type: "all" | "normal" | "basic") => {
        setTestType(type);
        // Giữ lại part hiện tại khi thay đổi type
        const params = new URLSearchParams();
        params.set("part", String(selectedPart));
        if (type !== 'all') params.set("type", type);
        navigate(`/practice/${selectedSection}?${params.toString()}`, { replace: true });
    };

    return (
        <div className="p-1 space-y-1">
            <PasswordModal
                open={showPwModal}
                onClose={() => {
                    setShowPwModal(false);
                    setPwError("");
                    setPendingTest(null);
                }}
                error={pwError}
                onSubmit={(pw) => {
                    if (pendingTest && pw === (pendingTest.password || "123456")) {
                        setShowPwModal(false);
                        setPwError("");
                        navigate(
                            `/practice/${pendingTest.section}/part${pendingTest.part}/${pendingTest.partID}`
                        );
                    } else {
                        setPwError("Incorrect password!");
                    }
                }}
            />
            <Card>
                <CardContent>
                    {/* Filter section */}
                    <div className="flex flex-col md:flex-row gap-4 pt-4 mb-4 items-center justify-between">
                        <div className="flex items-center space-x-2 p-1 bg-gray-100 rounded-lg">
                            <Button
                                onClick={() => handleChangeTestType("normal")}
                                variant={testType === "normal" ? "default" : "ghost"}
                                size="sm"
                            >Normal</Button>
                            <Button
                                onClick={() => handleChangeTestType("basic")}
                                variant={testType === "basic" ? "default" : "ghost"}
                                size="sm"
                            >Basic</Button>
                            <Button
                                onClick={() => handleChangeTestType("all")}
                                variant={testType === "all" ? "default" : "ghost"}
                                size="sm"
                            >All</Button>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 mb-6 items-end border-t pt-4 mt-4">
                        <div className="flex flex-col md:flex-row gap-4 flex-1">
                            <div>
                                <label className="block text-sm font-medium mb-1 min-w-[100px]">
                                    Part
                                </label>
                                <select
                                    className="border rounded px-3 py-2 w-full bg-white"
                                    value={selectedPart}
                                    onChange={(e) => handleChangePart(Number(e.target.value))}
                                >
                                    {partOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-grow">
                                <label className="block text-sm font-medium mb-1">
                                    Search by Title
                                </label>
                                <div className="flex items-center">
                                    <div className="relative w-full">
                                        <input
                                            type="text"
                                            className="border rounded px-3 py-2 bg-white pr-8 w-full"
                                            placeholder="Enter test title..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                        {search && (
                                            <button
                                                type="button"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white border border-gray-300 hover:bg-gray-100 text-gray-500 flex items-center justify-center"
                                                style={{ width: 22, height: 22 }}
                                                onClick={() => setSearch("")}
                                                title="Clear search"
                                            >
                                                <FaTimes size={12} />
                                            </button>
                                        )}
                                    </div>
                                    <Button
                                        type="button"
                                        className="ml-2 rounded px-4 py-2 bg-green-500 text-white hover:bg-green-600 transition flex items-center"
                                        onClick={() => setSearch(search)}
                                    >
                                        <FaSearch className="mr-2" />
                                        Search
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="md:ml-auto min-w-[100px] flex flex-col">
                            <label className="block text-sm font-medium mb-1">Sort</label>
                            <select
                                className="border rounded px-3 py-2 bg-white w-full"
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                            >
                                {sortOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {sort && (
                        <div className="mb-4 flex items-center space-x-2">
                            <span className="text-sm text-gray-700">
                                Sorting by: <b>{sortOptions.find((opt) => opt.value === sort)?.label}</b>
                            </span>
                            <button
                                type="button"
                                className="p-1 rounded-full bg-white border border-gray-300 hover:bg-gray-100 text-gray-500 flex items-center justify-center"
                                style={{ width: 22, height: 22 }}
                                onClick={() => setSort("")}
                                title="Clear sort"
                            >
                                <FaTimes size={12} />
                            </button>
                        </div>
                    )}

                    {/* Table */}
                    <div>
                        {sortedTests.length === 0 ? (
                            <div className="text-secondary text-center py-8">
                                No tests available for this section and part.
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-12 gap-4 px-4 py-3 
    bg-blue-100 rounded-lg mb-2 
    font-extrabold text-blue-800">
                                    <div className="col-span-1 text-center">#</div>
                                    <div className="col-span-6">Test Title</div>
                                    <div className="col-span-3 text-center">Most Recent Result</div>
                                    <div className="col-span-2 text-center">Action</div>
                                </div>




                                <div className="space-y-2">
                                    {paginatedTests.map((test, idx) => (
                                        <TestListItem
                                            key={test.id}
                                            test={test}
                                            index={idx}
                                            onStart={handleStartTest}
                                        />
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                        className="justify-center mt-8"
                                    />
                                )}
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

import React from 'react';
import { useRoute } from 'wouter';
import ReadingTestPage from './ReadingTestPage';
import ListeningTestPage from './ListeningTestPage';
import WritingTestPage from './WritingTestPage';
import FullReadingTestPage from './FullReadingTestPage';

const PracticeDetailPage: React.FC = () => {
    const [match, params] = useRoute("/practice/:skill/:part/:id");
    if (!match || !params || !params.id) return <div>Không tìm thấy đề!</div>;

    // Xử lý trường hợp Full Test
    if (params.skill === "Reading" && params.part === "full-test") {
        // Component FullReadingTestPage không cần props skill, part, id vì nó tự lấy từ route
        return <FullReadingTestPage />;
    }

    if (params.skill === "Listening") {
        return <ListeningTestPage skill={params.skill!} part={params.part!} id={params.id!} />;
    } else if (params.skill === "Writing") {
        return <WritingTestPage skill={params.skill!} part={params.part!} id={params.id!} />;
    }
    // Mặc định hoặc reading
    return <ReadingTestPage skill={params.skill!} part={params.part!} id={params.id!} />;
};

export default PracticeDetailPage;
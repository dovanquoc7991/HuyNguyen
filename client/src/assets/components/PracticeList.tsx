import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface Practice {
  id: string;
  title: string;
}

interface PracticeListProps {
  skill: string;
  part: string;
}

const PAGE_SIZE = 7;

const PracticeList: React.FC<PracticeListProps> = ({ skill, part }) => {
  const [page, setPage] = useState(1);
  const [hoveredTestId, setHoveredTestId] = useState<string | null>(null);
  const [practices, setPractices] = useState<Practice[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPractices = async () => {
      try {
        const res = await fetch('http://localhost:3002/Detailedtest');
        const data = await res.json();
        const testArr = data?.[skill]?.[part] || [];
        // Map to Practice[]
        const mapped: Practice[] = testArr.map((item: any) => ({
          id: item.id,
          title: item.title
        }));
        setPractices(mapped);
        setPage(1); // Reset page when skill/part changes
      } catch (e) {
        setPractices([]);
      }
    };
    fetchPractices();
  }, [skill, part]);

  const totalPages = Math.ceil(practices.length / PAGE_SIZE);
  const startIdx = (page - 1) * PAGE_SIZE;
  const currentPractices = practices.slice(startIdx, startIdx + PAGE_SIZE);

  const handlePracticeClick = (id: string) => {
    navigate(`/practice/${skill}/${part}/${id}`);
  };

  return (
    <div>
      <ul style={{ padding: 0, listStyle: 'none' }}>
        {currentPractices.map((practice) => (
          <li
            key={practice.id}
            style={{
              background: hoveredTestId === practice.id ? '#ffe082' : '#fffbe7',
              marginBottom: 12,
              padding: 16,
              borderRadius: 8,
              boxShadow: hoveredTestId === practice.id ? '0 2px 8px #ffd54f' : '0 1px 4px #ffe082',
              borderLeft: '5px solid #ffd54f',
              cursor: 'pointer',
              transition: 'background 0.2s, box-shadow 0.2s'
            }}
            onClick={() => handlePracticeClick(practice.id)}
            onMouseEnter={() => setHoveredTestId(practice.id)}
            onMouseLeave={() => setHoveredTestId(null)}
          > 
            {practice.title && (
              <div style={{ marginTop: 4 }}>
                <strong>Test ID:</strong> {practice.id}
              </div>
            )}
            <strong>Topic </strong>
            <span>: {practice.title}</span>
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid #90caf9',
              background: page === 1 ? '#e3f2fd' : '#fff',
              color: '#1976d2',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: '1px solid #90caf9',
                background: page === i + 1 ? '#1976d2' : '#fff',
                color: page === i + 1 ? '#fff' : '#1976d2',
                fontWeight: page === i + 1 ? 700 : 400,
                cursor: 'pointer',
              }}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid #90caf9',
              background: page === totalPages ? '#e3f2fd' : '#fff',
              color: '#1976d2',
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default PracticeList;
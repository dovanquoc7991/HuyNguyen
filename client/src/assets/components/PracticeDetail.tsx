import React from 'react';
import { useParams } from 'react-router-dom';

const PracticeDetail: React.FC = () => {
  const { skill, part, id } = useParams();

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 32 }}>
      <h2>Luyện đề: {id}</h2>
      <p>Kỹ năng: {skill}</p>
      <p>Phần: {part}</p>
      {/* Thêm logic fetch nội dung đề ở đây nếu cần */}
    </div>
  );
};

export default PracticeDetail;
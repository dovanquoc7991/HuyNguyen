import React, { useEffect, ReactNode } from 'react';

interface TestLayoutProps {
  children: ReactNode;
}

/**
 * Layout này quản lý việc áp dụng và dọn dẹp các class CSS cho font size
 * khi người dùng ở trong các trang làm bài thi.
 */
const TestLayout: React.FC<TestLayoutProps> = ({ children }) => {
  useEffect(() => {
    const savedTextSize = localStorage.getItem('textSize') || 'regular';
    
    document.body.classList.remove('text-large', 'text-extra-large');
    
    if (savedTextSize === 'large') {
      document.body.classList.add('text-large');
    } else if (savedTextSize === 'extra-large') {
      document.body.classList.add('text-extra-large');
    }

    return () => {
      console.log('Cleaning up text size classes...');
      document.body.classList.remove('text-large', 'text-extra-large');
    };
  }, []);

  return <>{children}</>;
};

export default TestLayout;
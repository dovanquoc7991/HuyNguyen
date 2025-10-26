import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaPaperPlane, 
  FaChevronRight, 
  FaChevronLeft, 
  FaAdjust, 
  FaSearchPlus, 
  FaCheck 
} from 'react-icons/fa';

// Import file CSS tương ứng
import '../css/OptionsModal.css'; // Giả sử bạn đã tạo file CSS này

// Định nghĩa các kiểu dữ liệu để tăng tính an toàn và dễ đọc
type ModalView = 'main' | 'contrast' | 'text-size';
type ContrastTheme = 'black-on-white' | 'white-on-black' | 'yellow-on-black';
type TextSize = 'regular' | 'large' | 'extra-large';

// Định nghĩa props cho component
interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OptionsModal: React.FC<OptionsModalProps> = ({ isOpen, onClose }) => {
  // State quản lý màn hình hiện tại trong modal
  const [currentView, setCurrentView] = useState<ModalView>('main');
  
  // State quản lý lựa chọn của người dùng.
  // Sử dụng hàm callback trong useState để đọc từ localStorage một lần duy nhất khi component mount.
  const [selectedContrast, setSelectedContrast] = useState<ContrastTheme>(
    () => (localStorage.getItem('theme') as ContrastTheme) || 'black-on-white'
  );
  const [selectedTextSize, setSelectedTextSize] = useState<TextSize>(
    () => (localStorage.getItem('textSize') as TextSize) || 'regular'
  );

  // Side effect để áp dụng THEME khi `selectedContrast` thay đổi
  useEffect(() => {
    const body = document.body;
    // 1. Xóa tất cả các class theme cũ để tránh xung đột
    body.classList.remove('dark', 'yellow-on-black');
    
    // 2. Thêm class mới tương ứng với lựa chọn
    if (selectedContrast === 'white-on-black') {
      body.classList.add('dark');
    } else if (selectedContrast === 'yellow-on-black') {
      body.classList.add('yellow-on-black');
    }
    // Theme 'black-on-white' là mặc định, không cần thêm class.
    
    // 3. Lưu lựa chọn vào localStorage để duy trì sau khi tải lại trang
    localStorage.setItem('theme', selectedContrast);
  }, [selectedContrast]); // Chạy lại hook này mỗi khi selectedContrast thay đổi

  // Side effect để áp dụng FONT SIZE khi `selectedTextSize` thay đổi
  useEffect(() => {
    const body = document.body;
    // 1. Xóa các class kích thước cũ
    body.classList.remove('text-large', 'text-extra-large');

    // 2. Thêm class mới nếu cần
    if (selectedTextSize === 'large') {
      body.classList.add('text-large');
    } else if (selectedTextSize === 'extra-large') {
      body.classList.add('text-extra-large');
    }

    // 3. Lưu lựa chọn vào localStorage
    localStorage.setItem('textSize', selectedTextSize);
  }, [selectedTextSize]); // Chạy lại hook này mỗi khi selectedTextSize thay đổi

  // Nếu modal không mở, không render gì cả
  if (!isOpen) {
    return null;
  }

  // Hàm xử lý khi đóng modal
  const handleClose = () => {
    setCurrentView('main'); // Reset về màn hình chính cho lần mở sau
    onClose();
  };
  
  // Ngăn việc click vào nội dung modal làm nó bị đóng
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // --- Các hàm render cho từng màn hình ---

  const renderMainView = () => {
    return (
      <>
        <div className="options-group">
          {/* <div className="option-item" onClick={() => setCurrentView('contrast')}>
            <FaAdjust className="option-icon" />
            <span className="option-text">Contrast</span>
            <FaChevronRight className="option-chevron" />
          </div> */}
          <div className="option-item" onClick={() => setCurrentView('text-size')}>
            <FaSearchPlus className="option-icon" />
            <span className="option-text">Text size</span>
            <FaChevronRight className="option-chevron" />
          </div>
        </div>
      </>
    );
  };

  const renderContrastView = () => {
    const contrastOptions: { id: ContrastTheme; label: string }[] = [
      { id: 'black-on-white', label: 'Black on white' },
      { id: 'white-on-black', label: 'White on black' },
      { id: 'yellow-on-black', label: 'Yellow on black' },
    ];
    return (
      <div className="options-group">
        {contrastOptions.map((option) => (
          <div 
            key={option.id} 
            className="option-item"
            onClick={() => setSelectedContrast(option.id)}
          >
            <FaCheck className={`option-icon ${selectedContrast === option.id ? '' : 'invisible'}`} />
            <span className="option-text">{option.label}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderTextSizeView = () => {
    const textSizeOptions: { id: TextSize; label: string }[] = [
      { id: 'regular', label: 'Regular' },
      { id: 'large', label: 'Large' },
      { id: 'extra-large', label: 'Extra large' },
    ];
    return (
      <div className="options-group">
        {textSizeOptions.map((option) => (
          <div 
            key={option.id} 
            className="option-item"
            onClick={() => setSelectedTextSize(option.id)}
          >
            <FaCheck className={`option-icon ${selectedTextSize === option.id ? '' : 'invisible'}`} />
            <span className="option-text">{option.label}</span>
          </div>
        ))}
      </div>
    );
  };
  
  // Đối tượng giúp lấy tiêu đề cho các màn hình con
  const subViewTitle = {
    contrast: 'Contrast',
    'text-size': 'Text size',
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={handleModalContentClick}>
        
        <div className="modal-header">
          {currentView === 'main' ? (
            <h2 className="modal-title">Options</h2>
          ) : (
            <div className="modal-subheader">
              <button className="back-button" onClick={() => setCurrentView('main')}>
                <FaChevronLeft />
                <span>Options</span>
              </button>
              <h2 className="modal-title-centered">{subViewTitle[currentView]}</h2>
            </div>
          )}
          <button onClick={handleClose} className="close-button">
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {currentView === 'main' && renderMainView()}
          {currentView === 'contrast' && renderContrastView()}
          {currentView === 'text-size' && renderTextSizeView()}
        </div>
      </div>
    </div>
  );
};

export default OptionsModal;
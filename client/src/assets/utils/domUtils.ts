// Hàm này không phụ thuộc vào state nào, nên có thể tách ra thành tiện ích riêng
export const unwrapElement = (element: Element) => {
  const parent = element.parentNode;
  if (parent) {
    while (element.firstChild) {
      // Đảm bảo không di chuyển icon ra ngoài trước khi xóa wrapper
      const childNode = element.firstChild;
      if (childNode.nodeType === Node.ELEMENT_NODE && (childNode as HTMLElement).classList.contains('note-icon')) {
          element.removeChild(childNode);
      } else {
          parent.insertBefore(childNode, element);
      }
    }
    parent.removeChild(element);
    parent.normalize(); // Hợp nhất các Text Node liền kề
  }
};
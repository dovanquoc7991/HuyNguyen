import { apiRequest } from "./queryClient";

export const api = {
  // User API
  deleteUser: (id: number) => apiRequest("DELETE", `/api/users/${id}`),
  updateUserStatus: (userId: number, payload: { status: "active" | "disabled" }) =>
    apiRequest("PUT", `/api/users/${userId}/status`, payload),
  getUsers: () => `/api/users`,
  me: () => `/api/user`,
  login: (data: any) => apiRequest("POST", "/api/login", data),
  register: (data: any) => apiRequest("POST", "/api/register", data),
  logout: (token?: string | null) => apiRequest("POST", "/api/logout", undefined, token),
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    apiRequest("POST", "/api/password/change", {
      current_password: data.oldPassword,
      password: data.newPassword,
      password_confirmation: data.newPassword,
    }),
  forgotPassword: (data: { email: string }) =>
    apiRequest("POST", "/api/forgot-password", data),
  resetPassword: (data: { token: string; email: string; password: string }) =>
    apiRequest("POST", "/api/reset-password", {
      token: data.token,
      email: data.email,
      password: data.password,
      password_confirmation: data.password,
    }),

  // Progress API
  getStats: () => `/api/user/stats`,

  //Exam API
  getReadingList: () => '/api/exam/list/reading',
  getListeningList: () => '/api/exam/list/listening',
  getReadingPartList: (id: number) => `/api/exam/list/part/reading/${id}`,
  getListeningPartList: (id: number) => `/api/exam/list/part/listening/${id}`,
  // API to get exam list to show exam list in home page
  getReadingPartListByType: () => `/api/exam/list/part/reading`,
  getListeningPartListByType: () => `/api/exam/list/part/listening`,
  getWritingPartListByType: () => `/api/exam/list/part/writing`,
  getSpeakingPartListByType: () => `/api/exam/list/part/speaking`,
  createReadingTest: (payload: any) => apiRequest("POST", `/api/exam/new/reading`, payload),
  createListeningTest: (payload: any) => apiRequest("POST", `/api/exam/new/listening`, payload),
  createWritingTest: (payload: any) => apiRequest("POST", `/api/exam/new/writing`, payload),
  createSpeakingTest: (payload: any) => apiRequest("POST", `/api/exam/new/speaking`, payload),
  // Post API
  getPosts: () => '/api/posts',
  createPost: (payload: { title: string; type: 'reading' | 'listening'; content: string; audio_url?: string }) =>
    apiRequest("POST", "/api/posts", payload),
  getPostDetail: (id: number) => apiRequest("GET", `/api/posts/${id}`),
  updatePost: (id: number, payload: any) => apiRequest("PUT", `/api/posts/${id}`, payload),
  createFullTest: (payload: any) => apiRequest("POST", `/api/exam/new`, payload),
  deleteExam: (id: number) => apiRequest("DELETE", `/api/exam/delete/${id}`),
  deletePost: (id: number) => apiRequest("DELETE", `/api/posts/${id}`),

  getListeningPartDetail: (id: number | string) => apiRequest("GET", `/api/section/${id}`),
  // updateListeningPart: (id: number | string, payload: any) => apiRequest("PUT", `/api/exam/update/part/listening/${id}`, payload),

  getReadingPartDetail: (id: number | string) => apiRequest("GET", `/api/section/${id}`),
  // updateReadingPart: (id: number | string, payload: any) => apiRequest("PUT", `/api/exam/update/part/reading/${id}`, payload),

  getReadingWritingDetail: (id: number | string) => apiRequest("GET", `/api/section/${id}`),

  // Sử dụng PUT để cập nhật một section cụ thể, giữ nguyên ID của section
  updateReadingPart: (id: number | string, payload: any) => apiRequest("PUT", `/api/sections/update/${id}`, payload),
  updateListeningPart: (id: number | string, payload: any) => apiRequest("PUT", `/api/sections/update/${id}`, payload),
  updateWritingPart: (id: number | string, payload: any) => apiRequest("PUT", `/api/sections/update/${id}`, payload),

  updateTest: async (id: number | string, type: string, payload: any) => {
    // Hàm này cũng sẽ trỏ đến endpoint update chung.
    // Backend sẽ xử lý việc cập nhật dựa trên payload.
    return apiRequest("PUT", `/api/sections/update/${id}`, payload);
  },

  // query last result
  getLastResultUrl: (sectionId: number) => `/api/user/last-result?sectionID=${sectionId}`,
  getLastResult: (sectionId: number) => apiRequest("GET", `/api/user/last-result?sectionID=${sectionId}`),

  // Feedback API
  submitFeedback: (payload: { content: string; context: any }) =>
    apiRequest("POST", "/api/feedback", payload),

  getFeedbacks: () => apiRequest("GET", "/api/feedback"),

  updateFeedbackStatus: (id: number, status: 'new' | 'read' | 'resolved') =>
    apiRequest("PUT", `/api/feedback/${id}/status`, { status }),

  deleteFeedback: (id: number) =>
    apiRequest("DELETE", `/api/feedback/${id}`),
};

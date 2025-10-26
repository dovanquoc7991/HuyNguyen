import { useQuery } from '@tanstack/react-query';
import { api } from '@/assets/lib/api';

export function useAuth() {
  const { data: user, isLoading, isError } = useQuery({
    queryKey: [api.me()], // Sử dụng URL làm query key
    // Không cần queryFn vì đã có default trong queryClient

    // Tự động kiểm tra lại sau mỗi 15 giây
    refetchInterval: 15 * 1000, 

    // Chỉ chạy query này khi có token
    enabled: !!(sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token')),
    staleTime: 15 * 1000, // Coi dữ liệu là cũ sau 15 giây để refetchInterval hoạt động
  });

  return { user, isLoading, isAuthenticated: !!user && !isError };
}
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@lib/api";
import { User, Stat, TestList, PartList } from "@/assets/types/data-type"

export function me() {
  return useQuery<User>({
    queryKey: ['me'],
    queryFn: async () => {
      const { apiRequest } = await import("@/assets/lib/queryClient");
      const url = api.me(); // ví dụ '/api/me'
      return apiRequest("GET", url); // thực sự gọi API
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}


export function useStats() {
  return useQuery<Stat>({
    queryKey: [api.getStats()],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useTestList(type: string) {
  return useQuery<TestList>({
    queryKey: [type === 'Reading'? api.getReadingList() : api.getListeningList()],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePartList(id: number, type: string) {
  return useQuery<PartList>({
    queryKey: [type === 'Reading'? api.getReadingPartList(id) : api.getListeningPartList(id)],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 

export function usePartListByType(type: string) {
  return useQuery<PartList>({
    queryKey: ["part-list-by-type", type],
    queryFn: async () => {
      let url;
      if(type === "Reading"){
        url = api.getReadingPartListByType();
      } else if(type === "Listening"){
        url = api.getListeningPartListByType();
      } else if(type === "Writing") {
        url = api.getWritingPartListByType();
      } else{
        url = api.getSpeakingPartListByType();
      }
      const { apiRequest } = await import("@/assets/lib/queryClient");
      return apiRequest("GET", url);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeleteExam() {
  return useMutation({
    mutationFn: (id: number) => api.deleteExam(id),
  });
}

export function useSaveResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sectionID,
      correctCount,
      total,
      token,
    }: {
      sectionID: number;
      correctCount: number;
      total: number;
      token?: string | null;
    }) => {
      const { apiRequest } = await import("@/assets/lib/queryClient");
      return apiRequest(
        "POST",
        "/api/user/save-result",
        { sectionID, correctCount, total },
        token
      );
    },
    onSuccess: (_data, variables) => {
      // Invalidate lastResult query để TestCard tự fetch lại
      queryClient.invalidateQueries({ queryKey: ["lastResult", variables.sectionID] });
    },
  });
}

export function useFeedbacks() {
  return useQuery({
    queryKey: ['feedbacks'],
    queryFn: () => api.getFeedbacks(),
  });
}

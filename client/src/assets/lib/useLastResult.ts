import { api } from "@/assets/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useLastResult(sectionId: number) {
  return useQuery({
    queryKey: ["lastResult", sectionId],
    queryFn: () => api.getLastResult(sectionId),
    enabled: !!sectionId,
  });
}
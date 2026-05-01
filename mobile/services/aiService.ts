import { api } from "@/services/api";
import { AIDetails } from "@/types/place";

export const getAIDetails = async (placeId: string): Promise<AIDetails> => {
  if (!placeId) {
    throw new Error("Invalid placeId");
  }

  console.log("Requesting at:", `${api.defaults.baseURL}/ai/${placeId}`);

  const response = await api.get(`/ai/${placeId}`);

  if (response?.data?.success && response?.data?.data) {
    return response.data.data;
  }

  throw new Error(
    response?.data?.message || "Invalid AI response structure"
  );
};
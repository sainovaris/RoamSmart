import { useState } from "react"
import { api } from "@/services/api"
import { AIDetails } from "@/types/place"

export default function useAI() {

  const [aiDetails, setAiDetails] =
    useState<AIDetails | null>(null)

  const [aiLoading, setAiLoading] = useState(false)

  const fetchAIDetails = async (placeId: string) => {
    console.log("Sending ID (useAI):", placeId);
    
    try {

      setAiLoading(true);

      const response = await api.get(`/ai/${placeId}`);

      if (response?.data?.success && response?.data?.data) {
        setAiDetails(response.data.data);
      } else {
        console.log("Invalid AI response:", response.data);
      }

    } catch (err: any) {
      console.log("AI error:", err?.response?.data || err.message);
    } finally {
      setAiLoading(false);
    }
  };
  
  return {
    aiDetails,
    aiLoading,
    fetchAIDetails,
    setAiDetails
  }

}
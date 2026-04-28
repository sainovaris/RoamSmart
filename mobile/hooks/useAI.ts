import { useRef, useState } from "react";
import { api } from "@/services/api";
import { AIDetails, Place } from "@/types/place";

export default function useAI() {
  const [aiDetails, setAiDetails] = useState<AIDetails | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // 🔁 simple in-memory cache: placeId -> AIDetails
  const cacheRef = useRef<Map<string, AIDetails>>(new Map());

  // 🛑 track latest request to avoid race conditions
  const activeReqId = useRef(0);

  const resolveId = (input?: string | Place): string | null => {
    if (!input) return null;
    if (typeof input === "string") return input;
    return input.id || input.place_id || null;
  };

  const fetchAIDetails = async (input?: string | Place) => {
    const placeId = resolveId(input);

    if (!placeId) {
      console.log("❌ AI skipped: invalid placeId");
      return;
    }

    // ✅ return from cache if present
    const cached = cacheRef.current.get(placeId);
    if (cached) {
      setAiDetails(cached);
      return;
    }

    const reqId = ++activeReqId.current;

    try {
      setAiLoading(true);

      const response = await api.get(`/ai/${placeId}`);

      // 🛑 ignore stale responses
      if (reqId !== activeReqId.current) return;

      if (response?.data?.success && response?.data?.data) {
        const data: AIDetails = response.data.data;

        cacheRef.current.set(placeId, data);
        setAiDetails(data);
      } else {
        console.log("⚠️ Invalid AI response:", response?.data);
      }
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err && "message" in err
          ? (err as { message: string }).message
          : "Unknown error";
      console.log("❌ AI error:", message);
    } finally {
      // 🛑 only clear loading if this is the latest request
      if (reqId === activeReqId.current) {
        setAiLoading(false);
      }
    }
  };

  return {
    aiDetails,
    aiLoading,
    fetchAIDetails,
    setAiDetails,
  };
}
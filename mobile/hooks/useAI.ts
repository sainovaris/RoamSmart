import { useRef, useState } from "react";
import { getAIDetails } from "@/services/aiService";
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
    return input.place_id || input.id || null;
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

    console.log("📡 Calling AI for:", placeId);

    try {
      setAiLoading(true);

      const data = await getAIDetails(placeId);

      if (reqId !== activeReqId.current) return;

      cacheRef.current.set(placeId, data);
      setAiDetails(data);

    } 
    catch (err: unknown) {
      const message =
        typeof err === "object" && err && "message" in err
          ? (err as { message: string }).message
          : "Unknown error";
      if (typeof err === "object" && err && "response" in err) {
        console.log("❌ AI ERROR RESPONSE:", (err as any).response?.data);
      } else {
        console.log("❌ AI error:", message);
      }
    } 
    finally {
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
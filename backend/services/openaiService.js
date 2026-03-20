const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generatePlaceDetails = async (place) => {
  const prompt = `
Return ONLY valid JSON. No explanation. No markdown.

Schema:
{
  "overview": "string",
  "highlights": ["string"],
  "best_time_to_visit": "string",
  "travel_tips": "string",
  "recommended_duration": "string",
  "booking_required": boolean
}

Place Details:
Name: ${place.name}
Category: ${place.category}
Location: ${place.location?.lat || "unknown"}, ${place.location?.lng || "unknown"}
`;

  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "system",
        content: "You must respond ONLY with valid JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  let content = response.output_text.trim();

  // clean markdown if present
  content = content.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(content);
  } catch (err) {
    console.error("RAW AI:", content);

    return {
      overview: "",
      highlights: [],
      best_time_to_visit: "",
      travel_tips: "",
      recommended_duration: "",
      booking_required: false,
    };
  }
};

module.exports = { generatePlaceDetails };

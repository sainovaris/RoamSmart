const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generatePlaceDetails = async (place) => {
  try {
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
Subcategory: ${place.subcategory || ""}
Location: ${place.location?.lat || "unknown"}, ${place.location?.lng || "unknown"}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = response.choices[0].message.content;
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("AI ERROR:", err.message);
    return null;
  }
};

module.exports = { generatePlaceDetails };

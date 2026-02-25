const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generatePlaceDetails = async (place) => {
  const prompt = `
You are a luxury AI travel guide.

Generate a structured JSON response for the place below.

Place:
Name: ${place.name}
Type: ${place.type}
Rating: ${place.rating}
Address: ${place.address}

Return strictly valid JSON with this format:
{
  "overview": "",
  "highlights": [],
  "best_time_to_visit": "",
  "travel_tips": "",
  "recommended_duration": "",
  "booking_required": true/false
}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const content = response.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch (err) {
    throw new Error("AI response was not valid JSON");
  }
};

module.exports = { generatePlaceDetails };

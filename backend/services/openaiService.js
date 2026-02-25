const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generatePlaceDetails = async (place) => {
  const prompt = `
  Return ONLY valid JSON. No explanation. No markdown.

    Structure:
    {
      "overview": "string",
      "highlights": ["point1", "point2"],
      "best_time_to_visit": "string",
      "travel_tips": "string",
      "recommended_duration": "string",
      "booking_required": true or false
    }

    Place:
    Name: ${place.name}
    Type: ${place.type}
    Location: ${place.location.coordinates[1]}, ${place.location.coordinates[0]}
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You must respond ONLY with valid JSON matching the schema.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
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

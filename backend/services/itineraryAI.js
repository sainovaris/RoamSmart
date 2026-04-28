const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.generateItinerarySummary = async (places) => {
  const prompt = `
You are a travel assistant.

Create a fun, short itinerary description like a guide.

Mention:
- flow of day
- vibe of places

${places.map((p, i) => `${i + 1}. ${p.name} (${p.category})`).join("\n")}
`;

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    return res.choices[0].message.content;
  } catch (err) {
    console.error("Itinerary Summary Error:", err.message);
    return "";
  }
};

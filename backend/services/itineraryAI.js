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
${places.map((p, i) => `${i + 1}. ${p.name}`).join("\n")}
`;

  const res = await openai.responses.create({
    model: "gpt-4o-mini",
    input: prompt,
  });

  return res.output_text;
};
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          messages: [
            {
              role: "system",
              content: `
You are a Study Helper AI.

If input contains [QUIZ]:
- Generate questions only
- No explanations
- Focus on testing understanding

Otherwise:
- Explain clearly
- Use steps and examples
`
            },
            {
              role: "user",
              content: req.body.message
            }
          ]
        })
      }
    );

    res.json(await response.json());

  } catch {
    res.status(500).json({ error: "Server error" });
  }
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

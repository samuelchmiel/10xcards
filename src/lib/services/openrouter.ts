interface GeneratedFlashcard {
  front: string;
  back: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function generateFlashcardsFromText(
  text: string,
  count: number
): Promise<GeneratedFlashcard[]> {
  const apiKey = import.meta.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OpenRouter API key is not configured");
  }

  const systemPrompt = `You are a flashcard generator. Given a text, create exactly ${count} flashcards that help someone learn the key concepts from the text.

Each flashcard should have:
- "front": A clear question or prompt (not too long)
- "back": A concise but complete answer

Respond ONLY with a valid JSON array of flashcard objects. No markdown, no explanation, just the JSON array.

Example response format:
[{"front": "What is X?", "back": "X is..."}, {"front": "Define Y", "back": "Y means..."}]`;

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://10xcards.app",
      "X-Title": "10xCards",
    },
    body: JSON.stringify({
      model: "anthropic/claude-3.5-haiku",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Create ${count} flashcards from this text:\n\n${text}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenRouter API error:", errorText);
    throw new Error(`AI generation failed: ${response.status}`);
  }

  const data: OpenRouterResponse = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No response from AI");
  }

  return parseFlashcardsResponse(content);
}

function parseFlashcardsResponse(content: string): GeneratedFlashcard[] {
  let jsonString = content.trim();

  // Remove markdown code blocks if present
  if (jsonString.startsWith("```")) {
    jsonString = jsonString.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  try {
    const parsed = JSON.parse(jsonString);

    if (!Array.isArray(parsed)) {
      throw new Error("Response is not an array");
    }

    // Validate each flashcard has front and back
    const flashcards: GeneratedFlashcard[] = parsed.map((item, index) => {
      if (typeof item.front !== "string" || typeof item.back !== "string") {
        throw new Error(`Invalid flashcard at index ${index}`);
      }
      return {
        front: item.front.trim(),
        back: item.back.trim(),
      };
    });

    return flashcards;
  } catch (error) {
    console.error("Failed to parse AI response:", content);
    throw new Error("Failed to parse AI response");
  }
}

export interface GeneratedFlashcard {
  front: string;
  back: string;
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// OpenRouter model ID for Claude 3.5 Haiku
const MODEL_ID = "anthropic/claude-3-5-haiku-latest";

export async function generateFlashcardsFromText(
  text: string,
  count: number,
  apiKey?: string
): Promise<GeneratedFlashcard[]> {
  const key = apiKey || import.meta.env.OPENROUTER_API_KEY;

  if (!key) {
    throw new Error("OpenRouter API key is not configured. Please set OPENROUTER_API_KEY environment variable.");
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
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://10xcards.app",
      "X-Title": "10xCards",
    },
    body: JSON.stringify({
      model: MODEL_ID,
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
    throw new Error(`AI generation failed (${response.status}): ${errorText}`);
  }

  const data: OpenRouterResponse = await response.json();

  // Check for API-level errors in the response
  if ((data as unknown as { error?: { message?: string } }).error) {
    const errorData = data as unknown as { error: { message: string } };
    throw new Error(`AI API error: ${errorData.error.message}`);
  }

  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No response from AI. The model may be unavailable.");
  }

  const flashcards = parseFlashcardsResponse(content);

  if (flashcards.length === 0) {
    throw new Error("AI returned no flashcards. Please try with different text.");
  }

  return flashcards;
}

export function parseFlashcardsResponse(content: string): GeneratedFlashcard[] {
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
  } catch {
    throw new Error("Failed to parse AI response");
  }
}

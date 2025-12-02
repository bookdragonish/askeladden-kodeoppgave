import { z } from "zod";
import { gateway, generateObject, generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { taskSuggestions } from "@/db/schema";

/**
 * AI Service for generating task suggestions
 *
 * This is a boilerplate implementation. Replace the mock implementation
 * with actual AI API calls (e.g., OpenAI, Anthropic, etc.)
 */

export interface TaskSuggestion {
  title: string;
  description: string | null;
}

const TaskSuggestionsSchema = z.object({
  suggestions: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ),
});

export interface CarInfo {
  id: number;
  regNr: string;
  make: string;
  model: string;
  year: number;
  color: string | null;
}

const openai = createOpenAICompatible({
  name: "openai",
  apiKey: process.env.AI_GATEWAY_API_KEY!,
  baseURL: "https://ai-gateway.vercel.sh/v1",
});

/**
 * Generate AI-powered task suggestions for a car
 *
 * @param carInfo - Information about the car
 * @returns Array of task suggestions
 */
export async function generateTaskSuggestions(
  carInfo: CarInfo
): Promise<TaskSuggestion[]> {


  // If there is no enviroment sat use fallback data
  if (!process.env.AI_GATEWAY_API_KEY) {
    return [
      {
        title: "Service",
        description: `Årlig service for ${carInfo.make} ${carInfo.model}`,
      },
      {
        title: "Oljeskift",
        description: "Rutinemessig oljeskift",
      },
      {
        title: "Bilvask",
        description: "Vask og polering av bilen",
      },
    ];
  }

  // Call to ai
  const {object} = await generateObject({
    model: gateway("gpt-4o-mini"),
    schema: TaskSuggestionsSchema,
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that suggests maintenance tasks for cars.",
      },
      {
        role: "user",
        content: `Suggest maintenance 2-4 tasks for a ${carInfo.year} ${carInfo.make} ${carInfo.model} (${carInfo.regNr}).`,
      },
    ],
  });

  return object.suggestions;
}
